import { CiclosService } from './ciclos.service';
import { proximoDia, siguienteFecha } from './ciclos-calendario';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

type CicloFixture = {
  idCiclo?: number;
  numCiclo: number;
  fechaProgramada: Date;
  entrega?: { estadoEntrega: string } | null;
  cobros?: { estadoCobro: string }[];
  entregaPausada?: boolean;
};

describe('Programación de ciclos', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-16T12:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());
  it.each([
    ['SEMANAL', '2026-02-07'],
    ['QUINCENAL', '2026-02-15'],
    ['MENSUAL', '2026-03-03'],
  ] as const)(
    '%s usa días fijos incluso al cruzar de mes',
    (frecuencia, esperado) => {
      expect(
        siguienteFecha(new Date('2026-01-31T00:00:00Z'), frecuencia)
          .toISOString()
          .slice(0, 10),
      ).toBe(esperado);
    },
  );
  it('busca el siguiente día elegido', () => {
    expect(
      proximoDia(new Date('2026-11-17T12:00:00Z'), 'LUNES').toISOString(),
    ).toBe('2026-11-23T12:00:00.000Z');
  });

  function preparar(estado = 'ACTIVA', ciclos: CicloFixture[] = []) {
    const s = {
      estadoSuscripcion: estado,
      fechaInicio: new Date('2026-11-20T12:00:00Z'),
      diaSemana: 'LUNES',
      plan: { frecuenciaEntrega: 'QUINCENAL' },
      ciclos,
    };
    const tx = {
      $queryRaw: jest.fn(),
      solicitudCambioPlanSuscrito: {
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      suscripcion: { findUniqueOrThrow: jest.fn().mockResolvedValue(s) },
      ciclo: { create: jest.fn(), update: jest.fn() },
      entrega: { updateMany: jest.fn() },
    };
    const servicio = new CiclosService({} as PrismaService);
    return { tx, servicio, cliente: tx as unknown as Prisma.TransactionClient };
  }
  it('crea el primer ciclo y su entrega', async () => {
    const { tx, servicio, cliente } = preparar();
    await servicio.sincronizar(cliente, 1);
    expect(tx.ciclo.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        numCiclo: 1,
        fechaProgramada: new Date('2026-11-20T12:00:00Z'),
        entrega: {
          create: {
            fechaEntrega: new Date('2026-11-20T12:00:00Z'),
            estadoEntrega: 'PROGRAMADA',
          },
        },
      }) as unknown,
    });
  });
  it.each(['PAUSADA', 'SUSPENDIDA', 'CANCELADA'])(
    'no genera ciclos para %s',
    async (estado) => {
      const { tx, servicio, cliente } = preparar(estado);
      await servicio.sincronizar(cliente, 1);
      expect(tx.ciclo.create).not.toHaveBeenCalled();
      if (estado === 'CANCELADA')
        expect(tx.ciclo.update).not.toHaveBeenCalled();
    },
  );
  it('no duplica un ciclo futuro', async () => {
    const { tx, servicio, cliente } = preparar('ACTIVA', [
      { numCiclo: 1, fechaProgramada: new Date('2026-11-20') },
    ]);
    await servicio.sincronizar(cliente, 1);
    expect(tx.ciclo.create).not.toHaveBeenCalled();
  });
  it('reanuda sin atrasados manteniendo el intervalo de 15 días', async () => {
    const { tx, servicio, cliente } = preparar('ACTIVA', [
      {
        idCiclo: 2,
        numCiclo: 2,
        fechaProgramada: new Date('2026-11-01T12:00:00Z'),
        entrega: { estadoEntrega: 'PROGRAMADA' },
        cobros: [],
      },
    ]);
    await servicio.sincronizar(cliente, 1, false, true);
    expect(tx.ciclo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fechaProgramada: new Date('2026-12-01T12:00:00Z'),
        }) as unknown,
      }),
    );
  });
  it('cambia solamente las entregas programadas', async () => {
    const { tx, servicio, cliente } = preparar('ACTIVA', [
      {
        idCiclo: 1,
        numCiclo: 1,
        fechaProgramada: new Date('2026-11-18'),
        entrega: { estadoEntrega: 'ENVIADA' },
        cobros: [],
      },
      {
        idCiclo: 2,
        numCiclo: 2,
        fechaProgramada: new Date('2026-11-20'),
        entrega: { estadoEntrega: 'PROGRAMADA' },
        cobros: [],
      },
    ]);
    await servicio.sincronizar(cliente, 1, true);
    expect(tx.ciclo.update).toHaveBeenCalledTimes(1);
    expect(tx.ciclo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idCiclo: 2 },
        data: expect.objectContaining({
          fechaProgramada: new Date('2026-11-23'),
        }) as unknown,
      }),
    );
  });

  it('conserva los ciclos ya pagados al reanudar', async () => {
    const { tx, servicio, cliente } = preparar('ACTIVA', [
      {
        idCiclo: 1,
        numCiclo: 1,
        fechaProgramada: new Date('2026-11-18T12:00:00Z'),
        entrega: { estadoEntrega: 'PROGRAMADA' },
        cobros: [{ estadoCobro: 'PAGADO' }],
      },
    ]);

    await servicio.sincronizar(cliente, 1, false, true);

    expect(tx.ciclo.update).not.toHaveBeenCalled();
  });

  it('salta una entrega futura no pagada', async () => {
    const fila = {
      idCiclo: 4,
      fechaEntrega: new Date('2026-11-20T12:00:00Z'),
      estadoEntrega: 'PROGRAMADA',
    };
    const tx = {
      $queryRaw: jest.fn(),
      suscripcion: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ usuarioId: 7, estadoSuscripcion: 'ACTIVA' }),
      },
      ciclo: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ idCiclo: 4, entrega: fila, cobros: [] }),
        update: jest.fn().mockResolvedValue({
          entrega: { ...fila, estadoEntrega: 'SALTADA' },
        }),
      },
    };
    const prisma = {
      client: {
        $transaction: (operacion: (tx: unknown) => unknown) => operacion(tx),
      },
    } as unknown as PrismaService;
    const servicioSaltos = new CiclosService(prisma);

    await expect(
      servicioSaltos.saltarEntrega(3, 2, { idUsuario: 7, rol: 'CLIENTE' }),
    ).resolves.toMatchObject({ entrega: { estadoEntrega: 'SALTADA' } });
    expect(tx.ciclo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entrega: { update: { estadoEntrega: 'SALTADA' } },
        }) as unknown,
      }),
    );
  });

  it('rechaza saltar una entrega pagada', async () => {
    const tx = {
      $queryRaw: jest.fn(),
      suscripcion: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ usuarioId: 7, estadoSuscripcion: 'ACTIVA' }),
      },
      ciclo: {
        findUnique: jest.fn().mockResolvedValue({
          idCiclo: 4,
          entrega: {
            fechaEntrega: new Date('2026-11-20T12:00:00Z'),
            estadoEntrega: 'PROGRAMADA',
          },
          cobros: [{ estadoCobro: 'PAGADO' }],
        }),
        update: jest.fn(),
      },
    };
    const prisma = {
      client: {
        $transaction: (operacion: (tx: unknown) => unknown) => operacion(tx),
      },
    } as unknown as PrismaService;
    const servicioSaltos = new CiclosService(prisma);

    await expect(
      servicioSaltos.saltarEntrega(3, 2, { idUsuario: 7, rol: 'CLIENTE' }),
    ).rejects.toThrow('No se puede saltar una entrega que ya fue pagada.');
    expect(tx.ciclo.update).not.toHaveBeenCalled();
  });
});
