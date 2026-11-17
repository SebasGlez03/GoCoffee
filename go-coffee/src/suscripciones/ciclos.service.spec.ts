import { CiclosService } from './ciclos.service';
import { proximoDia, siguienteFecha } from './ciclos-calendario';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('Programación de ciclos', () => {
  beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(new Date('2026-11-16T12:00:00Z')); });
  afterEach(() => jest.useRealTimers());
  it.each([['SEMANAL', '2026-02-07'], ['QUINCENAL', '2026-02-15'], ['MENSUAL', '2026-03-03']] as const)(
    '%s usa días fijos incluso al cruzar de mes', (frecuencia, esperado) => {
      expect(siguienteFecha(new Date('2026-01-31T00:00:00Z'), frecuencia).toISOString().slice(0, 10)).toBe(esperado);
    },
  );
  it('busca el siguiente día elegido', () => {
    expect(proximoDia(new Date('2026-11-17T12:00:00Z'), 'LUNES').toISOString()).toBe('2026-11-23T12:00:00.000Z');
  });

  function preparar(estado = 'ACTIVA', ciclos: any[] = []) {
    const s = { estadoSuscripcion: estado, fechaInicio: new Date('2026-11-20T12:00:00Z'),
      diaSemana: 'LUNES', plan: { frecuenciaEntrega: 'QUINCENAL' }, ciclos };
    const tx = {
      suscripcion: { findUniqueOrThrow: jest.fn().mockResolvedValue(s) },
      ciclo: { create: jest.fn(), update: jest.fn() }, entrega: { updateMany: jest.fn() },
    };
    const servicio = new CiclosService({} as PrismaService);
    return { tx, servicio, cliente: tx as unknown as Prisma.TransactionClient };
  }
  it('crea el primer ciclo y su entrega', async () => {
    const { tx, servicio, cliente } = preparar();
    await servicio.sincronizar(cliente, 1);
    expect(tx.ciclo.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      numCiclo: 1, fechaProgramada: new Date('2026-11-20T12:00:00Z'),
      entrega: { create: { fechaEntrega: new Date('2026-11-20T12:00:00Z'), estadoEntrega: 'PROGRAMADA' } },
    }) });
  });
  it.each(['PAUSADA', 'SUSPENDIDA', 'CANCELADA'])('no genera ciclos para %s', async (estado) => {
    const { tx, servicio, cliente } = preparar(estado);
    await servicio.sincronizar(cliente, 1);
    expect(tx.ciclo.create).not.toHaveBeenCalled();
    if (estado === 'CANCELADA') expect(tx.ciclo.update).not.toHaveBeenCalled();
  });
  it('no duplica un ciclo futuro', async () => {
    const { tx, servicio, cliente } = preparar('ACTIVA', [{ numCiclo: 1, fechaProgramada: new Date('2026-11-20') }]);
    await servicio.sincronizar(cliente, 1);
    expect(tx.ciclo.create).not.toHaveBeenCalled();
  });
  it('reanuda sin atrasados manteniendo el intervalo de 15 días', async () => {
    const { tx, servicio, cliente } = preparar('ACTIVA', [{ idCiclo: 2, numCiclo: 2,
      fechaProgramada: new Date('2026-11-01T12:00:00Z'), entrega: { estadoEntrega: 'PROGRAMADA' } }]);
    await servicio.sincronizar(cliente, 1, false, true);
    expect(tx.ciclo.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
      fechaProgramada: new Date('2026-12-01T12:00:00Z'),
    }) }));
  });
  it('cambia solamente las entregas programadas', async () => {
    const { tx, servicio, cliente } = preparar('ACTIVA', [
      { idCiclo: 1, numCiclo: 1, fechaProgramada: new Date('2026-11-18'), entrega: { estadoEntrega: 'ENVIADA' } },
      { idCiclo: 2, numCiclo: 2, fechaProgramada: new Date('2026-11-20'), entrega: { estadoEntrega: 'PROGRAMADA' } },
    ]);
    await servicio.sincronizar(cliente, 1, true);
    expect(tx.ciclo.update).toHaveBeenCalledTimes(1);
    expect(tx.ciclo.update).toHaveBeenCalledWith(expect.objectContaining({ where: { idCiclo: 2 }, data: expect.objectContaining({
      fechaProgramada: new Date('2026-11-23'),
    }) }));
  });
});
