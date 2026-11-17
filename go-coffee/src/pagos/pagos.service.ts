import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CiclosService } from '../suscripciones/ciclos.service';
import type { UsuarioSesion } from '../suscripciones/suscripciones.service';
import type { MetodoPagoDto } from './dto/metodo-pago.dto';
import type { RegistrarCobroDto } from './dto/registrar-cobro.dto';

@Injectable()
export class PagosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ciclos: CiclosService,
  ) {}

  obtenerMetodoPago(usuario: UsuarioSesion) {
    return this.prisma.client.metodoPago.findUnique({
      where: { usuarioId: usuario.idUsuario },
      select: {
        titular: true,
        marca: true,
        ultimos4: true,
        actualizadoEn: true,
      },
    });
  }

  guardarMetodoPago(usuario: UsuarioSesion, dto: MetodoPagoDto) {
    return this.prisma.client.metodoPago.upsert({
      where: { usuarioId: usuario.idUsuario },
      create: {
        usuarioId: usuario.idUsuario,
        titular: dto.titular.trim(),
        marca: dto.marca,
        ultimos4: dto.ultimos4,
      },
      update: {
        titular: dto.titular.trim(),
        marca: dto.marca,
        ultimos4: dto.ultimos4,
      },
      select: {
        titular: true,
        marca: true,
        ultimos4: true,
        actualizadoEn: true,
      },
    });
  }

  async historial(usuario: UsuarioSesion) {
    const suscripciones = await this.prisma.client.suscripcion.findMany({
      where: { usuarioId: usuario.idUsuario },
      select: { idSuscripcion: true },
    });
    const ids = suscripciones.map((suscripcion) => suscripcion.idSuscripcion);
    if (ids.length === 0) return [];

    return this.prisma.client.cobro.findMany({
      where: { ciclo: { is: { suscripcionId: { in: ids } } } },
      include: {
        ciclo: {
          include: {
            entrega: true,
            suscripcion: { select: { idSuscripcion: true } },
          },
        },
        registradoPor: { select: { email: true } },
      },
      orderBy: [{ fechaCobro: 'desc' }, { idCobro: 'desc' }],
    });
  }

  async registrarCobro(dto: RegistrarCobroDto, administrador: UsuarioSesion) {
    return this.prisma.client.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM suscripciones WHERE id = ${dto.idSuscripcion} FOR UPDATE`;
      const suscripcion = await tx.suscripcion.findUnique({
        where: { idSuscripcion: dto.idSuscripcion },
        include: { plan: true, usuario: { include: { metodoPago: true } } },
      });
      if (!suscripcion)
        throw new NotFoundException('Suscripción no encontrada.');
      if (suscripcion.estadoSuscripcion === 'CANCELADA') {
        throw new ConflictException(
          'No se pueden registrar cobros para una suscripción cancelada.',
        );
      }
      if (!suscripcion.usuario?.metodoPago) {
        throw new BadRequestException(
          'El cliente debe registrar un método de pago antes de cobrar.',
        );
      }

      const ciclo = await tx.ciclo.findUnique({
        where: {
          suscripcionId_numCiclo: {
            suscripcionId: dto.idSuscripcion,
            numCiclo: dto.numCiclo,
          },
        },
        include: { entrega: true, cobros: { orderBy: { idCobro: 'desc' } } },
      });
      if (!ciclo) throw new NotFoundException('Ciclo no encontrado.');
      if (ciclo.entrega?.estadoEntrega === 'SALTADA') {
        throw new ConflictException(
          'No se puede cobrar un ciclo cuya entrega fue saltada.',
        );
      }
      if (ciclo.cobros.some((cobro) => cobro.estadoCobro === 'PAGADO')) {
        throw new ConflictException('Este ciclo ya tiene un cobro pagado.');
      }

      const cobro = await tx.cobro.create({
        data: {
          cicloId: ciclo.idCiclo,
          registradoPorId: administrador.idUsuario,
          estadoCobro: dto.estadoCobro,
          monto: ciclo.precioAplicado ?? suscripcion.plan.precio,
          referencia: dto.referencia?.trim() || null,
        },
        include: { registradoPor: { select: { email: true } } },
      });

      if (dto.estadoCobro === 'FALLIDO') {
        await tx.suscripcion.update({
          where: { idSuscripcion: dto.idSuscripcion },
          data: {
            estadoSuscripcion: 'SUSPENDIDA',
            motivoSuspension: 'COBRO_FALLIDO',
          },
        });
      } else if (suscripcion.motivoSuspension === 'COBRO_FALLIDO') {
        const ciclosConCobros = await tx.ciclo.findMany({
          where: { suscripcionId: dto.idSuscripcion },
          include: { cobros: { orderBy: { idCobro: 'desc' }, take: 1 } },
        });
        const hayFallidosPendientes = ciclosConCobros.some(
          (item) => item.cobros[0]?.estadoCobro === 'FALLIDO',
        );
        if (!hayFallidosPendientes) {
          await tx.suscripcion.update({
            where: { idSuscripcion: dto.idSuscripcion },
            data: { estadoSuscripcion: 'ACTIVA', motivoSuspension: null },
          });
          await this.ciclos.sincronizar(tx, dto.idSuscripcion, false, true);
        }
      }

      return cobro;
    });
  }
}
