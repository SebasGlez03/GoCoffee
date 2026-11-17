import { PrismaService } from '../common/prisma/prisma.service';
import { CambiosPlanService } from './cambios-plan.service';

describe('Opciones de cambio de plan por ciclo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-16T12:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('ofrece ciclos futuros con su fecha calculada', async () => {
    const prisma = {
      client: {
        suscripcion: {
          findUnique: jest.fn().mockResolvedValue({
            idSuscripcion: 3,
            usuarioId: 8,
            fechaInicio: new Date('2026-11-01T12:00:00Z'),
            plan: { frecuenciaEntrega: 'SEMANAL' },
            ciclos: [
              {
                numCiclo: 4,
                fechaProgramada: new Date('2026-11-20T12:00:00Z'),
              },
            ],
          }),
        },
        plan: { findMany: jest.fn().mockResolvedValue([]) },
      },
    } as unknown as PrismaService;
    const servicio = new CambiosPlanService(prisma);

    const opciones = await servicio.opciones(3, {
      idUsuario: 8,
      rol: 'CLIENTE',
    });

    expect(opciones.ciclosAplicacion.slice(0, 2)).toEqual([
      { numCiclo: 5, fecha: new Date('2026-11-27T12:00:00Z') },
      { numCiclo: 6, fecha: new Date('2026-12-04T12:00:00Z') },
    ]);
  });
});
