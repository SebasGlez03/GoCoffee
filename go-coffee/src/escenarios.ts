import { EntregaMemoriaRepository } from './dominio/entregas-repo';
import { EntregasDominioService } from './dominio/entregas.service';
import { Suscripcion, Entrega } from './dominio/entidades';

async function ejecutarEscenarios() {
  console.log('===============================');
  console.log('   GoCoffee - AVANCE 1           ');
  console.log('=============================\n');

  const entregaRepo = new EntregaMemoriaRepository();
  const servicioEntregas = new EntregasDominioService(entregaRepo);

  // Suscripcion de prueba Activa
  const suscripcionActiva: Suscripcion = {
    idSuscripcion: 101,
    diaSemanaEntrega: 'Lunes',
    fechaInicio: new Date('2026-09-28'),
    direccionEntrega: {
      idDireccionEntrega: 1,
      calle: 'Av. Principal',
      codigoPostal: '85000',
      numeroCasa: '123',
      estado: 'Sonora',
    },
    estadoSuscripcion: 'ACTIVA',
    ciclos: [],
  };


  // Generacion normal de entrega para suscripción activa (debería salir bien)
  console.log('- Generación exitosa de entrega -');
  try {
    const entrega = await servicioEntregas.generarEntregaCiclo(
      suscripcionActiva,
      1,
      new Date('2026-10-05'),
    );
    console.log(' STATUS: ✅ ÉXITO');
    console.log(' Entrega generada correctamente:', entrega);
  } catch (error: any) {
    console.error(' STATUS: ❌ ERROR INESPERADO:', error.message);
  }

  console.log('\n-------------------------------------------------\n');

  // Generar entrega en suscripción SUSPENDIDA
  console.log('- Rechazo por suscripción suspendida -');
  const suscripcionSuspendida: Suscripcion = {
    ...suscripcionActiva,
    idSuscripcion: 102,
    estadoSuscripcion: 'SUSPENDIDA',
  };

  try {
    await servicioEntregas.generarEntregaCiclo(
      suscripcionSuspendida,
      1,
      new Date('2026-10-05'),
    );
    console.log(' STATUS: ❌ ERROR (Permitió generar entrega en suscripción suspendida)');
  } catch (error: any) {
    console.log(' STATUS: ✅ RECHAZADO POR REGLA DE NEGOCIO');
    console.log(` Error capturado [${error.name}]: ${error.message}`);
  }
  console.log('\n-------------------------------------------------\n');


  // Intentar modificar/saltar una entrega en estado ARMADA
  console.log('- Rechazo de cancelación en entrega armada -');
  const entregaEnPreparacion: Entrega = {
    idEntrega: 500,
    fechaProgramada: new Date('2026-10-05'),
    estadoEntrega: 'ARMADA',
  };

  try {
    servicioEntregas.validarModificacionEntrega(entregaEnPreparacion);
    console.log(' STATUS: ❌ ERROR (Permitió modificar una entrega armada)');
  } catch (error: any) {
    console.log(' STATUS: ✅ RECHAZADO CORRECTAMENTE POR REGLA DE NEGOCIO');
    console.log(` Error capturado [${error.name}]: ${error.message}`);
  }

}

ejecutarEscenarios();