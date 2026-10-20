import { Test, TestingModule } from '@nestjs/testing';
import { SuscripcionesService } from './suscripciones.service';
import { SUSCRIPCIONES_REPOSITORY } from './suscripciones.tokens';
import {
  CambioRetroactivoError,
  CiclosSuscripcionesVacios,
  DireccionEntregaVacia,
  SuscripcionCanceladaError,
  SuscripcionNoEncontradaError,
} from '../dominio/errores';

describe('SuscripcionesService', () => {
  let service: SuscripcionesService;

  const repoMock = {
    findById: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const dtoBase = {
    diaSemanaEntrega: 'Lunes',
    fechaInicio: new Date('2026-12-01'),
    direccionEntrega: {
      idDireccionEntrega: 1,
      calle: 'Av. Principal',
      codigoPostal: '85000',
      numeroCasa: '123',
      estado: 'Sonora',
    },
    estadoSuscripcion: 'ACTIVA' as const,
    ciclos: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuscripcionesService,
        { provide: SUSCRIPCIONES_REPOSITORY, useValue: repoMock },
      ],
    }).compile();

    service = module.get<SuscripcionesService>(SuscripcionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rechaza crear una suscripción sin dirección', async () => {
    await expect(
      service.save({ ...dtoBase, direccionEntrega: undefined as any }),
    ).rejects.toThrow(DireccionEntregaVacia);
  });

  it('rechaza crear una suscripción sin ciclos', async () => {
    await expect(
      service.save({ ...dtoBase, ciclos: undefined as any }),
    ).rejects.toThrow(CiclosSuscripcionesVacios);
  });

  it('rechaza crear una suscripción con fecha retroactiva', async () => {
    await expect(
      service.save({ ...dtoBase, fechaInicio: new Date('2020-01-01') }),
    ).rejects.toThrow(CambioRetroactivoError);
  });

  it('rechaza modificar una suscripción cancelada', async () => {
    repoMock.findById.mockResolvedValue({ ...dtoBase, idSuscripcion: 7, estadoSuscripcion: 'CANCELADA' });
    await expect(service.update({ id: 7 })).rejects.toThrow(SuscripcionCanceladaError);
  });

  it('rechaza modificar una suscripción inexistente', async () => {
    repoMock.findById.mockResolvedValue(null);
    await expect(service.update({ id: 999 })).rejects.toThrow(SuscripcionNoEncontradaError);
  });
});