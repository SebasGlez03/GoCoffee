// Ejecutar con: npx tsx test/cambio-plan.integration.ts
// Los datos de prueba se crean en una única transacción que siempre se revierte.
import assert from 'node:assert/strict';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { CambiosPlanService } from '../src/suscripciones/cambios-plan.service';
import { CiclosService } from '../src/suscripciones/ciclos.service';

async function verificar() {
  const prisma = new PrismaService();
  const rollback = new Error('ROLLBACK_PRUEBA');
  try {
    await prisma.client.$transaction(async (tx) => {
      const cliente = await tx.usuario.create({ data: { email: `prueba-cambio-${Date.now()}@example.invalid`, passwordHash: 'solo-prueba' } });
      const anterior = await tx.plan.create({ data: { nombre: 'Prueba semanal', cantidadBolsas: 1, precio: 100, frecuenciaEntrega: 'SEMANAL' } });
      const nuevo = await tx.plan.create({ data: { nombre: 'Prueba mensual', cantidadBolsas: 3, precio: 250, frecuenciaEntrega: 'MENSUAL' } });
      const s = await tx.suscripcion.create({ data: { usuarioId: cliente.idUsuario, planId: anterior.planId,
        estadoSuscripcion: 'ACTIVA', diaSemana: 'LUNES', fechaInicio: new Date(Date.now() + 86_400_000) } });
      const fachada = { client: {
        suscripcion: tx.suscripcion, plan: tx.plan, solicitudCambioPlanSuscrito: tx.solicitudCambioPlanSuscrito,
        $transaction: (fn: (cliente: typeof tx) => unknown) => fn(tx),
      } } as unknown as PrismaService;
      const cambios = new CambiosPlanService(fachada);
      const ciclos = new CiclosService(prisma);
      const usuario = { idUsuario: cliente.idUsuario, rol: 'CLIENTE' as const };
      await ciclos.sincronizar(tx, s.idSuscripcion);
      const solicitud = await cambios.solicitar(s.idSuscripcion, nuevo.planId, 250, usuario);
      assert.equal(solicitud.numCicloAplicacion, 2);
      assert.equal((await tx.suscripcion.findUniqueOrThrow({ where: { idSuscripcion: s.idSuscripcion } })).planId, anterior.planId);
      await assert.rejects(cambios.solicitar(s.idSuscripcion, nuevo.planId, 250, usuario));
      await cambios.resolver(solicitud.idSolicitud, true);
      // Simula el paso del tiempo para que corresponda generar el segundo ciclo.
      const primero = await tx.ciclo.findFirstOrThrow({ where: { suscripcionId: s.idSuscripcion } });
      await tx.ciclo.update({ where: { idCiclo: primero.idCiclo }, data: { fechaProgramada: new Date(Date.now() - 1000) } });
      await ciclos.sincronizar(tx, s.idSuscripcion);
      const actual = await tx.suscripcion.findUniqueOrThrow({ where: { idSuscripcion: s.idSuscripcion }, include: { ciclos: { orderBy: { numCiclo: 'asc' } } } });
      assert.equal(actual.planId, nuevo.planId);
      assert.equal(actual.ciclos.length, 2);
      assert.equal(actual.ciclos[0].planIdAplicado, anterior.planId);
      assert.equal(actual.ciclos[0].precioAplicado, 100);
      assert.equal(actual.ciclos[1].planIdAplicado, nuevo.planId);
      assert.equal(actual.ciclos[1].precioAplicado, 250);
      await ciclos.sincronizar(tx, s.idSuscripcion);
      assert.equal(await tx.ciclo.count({ where: { suscripcionId: s.idSuscripcion } }), 2);
      const historial = await cambios.historial(s.idSuscripcion, usuario);
      assert.equal(historial[0].estadoSolicitud, 'ACEPTADA');
      assert.ok(historial[0].fechaAplicacion);
      throw rollback;
    }, { timeout: 30_000 });
  } catch (e) {
    if (e !== rollback) throw e;
    console.log('Flujo de cambio de plan verificado en MySQL. Transacción revertida.');
  } finally { await prisma.client.$disconnect(); }
}
verificar().catch((e) => { console.error(e); process.exitCode = 1; });
