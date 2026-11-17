import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CiclosService } from '../suscripciones/ciclos.service';
import { PagosService } from './pagos.service';

describe('PagosService', () => {
  let servicio: PagosService;
  let tx: {
    $queryRaw: jest.Mock;
    suscripcion: { findUnique: jest.Mock; update: jest.Mock };
    ciclo: { findUnique: jest.Mock; findMany: jest.Mock };
    cobro: { create: jest.Mock };
  };
  let sincronizar: jest.Mock;

  const administrador = { idUsuario: 1, rol: 'ADMINISTRADOR' as const };
  const suscripcion = {
    idSuscripcion: 12,
    estadoSuscripcion: 'ACTIVA',
    motivoSuspension: null,
    plan: { precio: 320 },
    usuario: { metodoPago: { marca: 'VISA', ultimos4: '1234' } },
  };
  const ciclo = {
    idCiclo: 55,
    precioAplicado: 290,
    entrega: { estadoEntrega: 'PROGRAMADA' },
    cobros: [],
  };

  beforeEach(() => {
    tx = {
      $queryRaw: jest.fn(),
      suscripcion: {
        findUnique: jest.fn().mockResolvedValue(suscripcion),
        update: jest.fn(),
      },
      ciclo: {
        findUnique: jest.fn().mockResolvedValue(ciclo),
        findMany: jest
          .fn()
          .mockResolvedValue([{ cobros: [{ estadoCobro: 'PAGADO' }] }]),
      },
      cobro: {
        create: jest
          .fn()
          .mockResolvedValue({ idCobro: 8, estadoCobro: 'FALLIDO' }),
      },
    };
    const prisma = {
      client: {
        $transaction: jest.fn((operacion: (tx: unknown) => unknown) =>
          operacion(tx),
        ),
      },
    } as unknown as PrismaService;
    sincronizar = jest.fn();
    servicio = new PagosService(prisma, {
      sincronizar,
    } as unknown as CiclosService);
  });

  it('registra el monto del ciclo y suspende la suscripción ante un cobro fallido', async () => {
    await servicio.registrarCobro(
      { idSuscripcion: 12, numCiclo: 2, estadoCobro: 'FALLIDO' },
      administrador,
    );

    expect(tx.cobro.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cicloId: 55,
          monto: 290,
          estadoCobro: 'FALLIDO',
        }) as unknown,
      }),
    );
    expect(tx.suscripcion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          estadoSuscripcion: 'SUSPENDIDA',
          motivoSuspension: 'COBRO_FALLIDO',
        },
      }),
    );
    expect(sincronizar).not.toHaveBeenCalled();
  });

  it('reactiva tras resolver el último cobro fallido', async () => {
    tx.suscripcion.findUnique.mockResolvedValue({
      ...suscripcion,
      estadoSuscripcion: 'SUSPENDIDA',
      motivoSuspension: 'COBRO_FALLIDO',
    });
    tx.cobro.create.mockResolvedValue({ idCobro: 9, estadoCobro: 'PAGADO' });

    await servicio.registrarCobro(
      { idSuscripcion: 12, numCiclo: 2, estadoCobro: 'PAGADO' },
      administrador,
    );

    expect(tx.suscripcion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { estadoSuscripcion: 'ACTIVA', motivoSuspension: null },
      }),
    );
    expect(sincronizar).toHaveBeenCalledWith(tx, 12, false, true);
  });

  it('rechaza un cobro duplicado si el ciclo ya está pagado', async () => {
    tx.ciclo.findUnique.mockResolvedValue({
      ...ciclo,
      cobros: [{ estadoCobro: 'PAGADO' }],
    });

    await expect(
      servicio.registrarCobro(
        { idSuscripcion: 12, numCiclo: 2, estadoCobro: 'PAGADO' },
        administrador,
      ),
    ).rejects.toThrow(ConflictException);
    expect(tx.cobro.create).not.toHaveBeenCalled();
  });
});
