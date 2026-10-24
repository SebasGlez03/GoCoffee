import { EntregaMemoriaRepository } from './entregas-repo';
import { EntregasDominioService } from './entregas.service';
import { Suscripcion } from './entidades';
import { EntregaDuplicadaError } from './errores';

describe('EntregasDominioService', () => {
  let repository: EntregaMemoriaRepository;
  let service: EntregasDominioService;

  const crearSuscripcion = (idSuscripcion: number): Suscripcion => ({
    idSuscripcion,
    diaSemanaEntrega: 'LUNES',
    fechaInicio: new Date('2026-01-01'),
    direccionEntrega: {
      idDireccionEntrega: 1,
      calle: 'Av. Principal',
      codigoPostal: '85000',
      numeroCasa: '123',
      estado: 'Sonora',
    },
    estadoSuscripcion: 'ACTIVA',
    ciclos: [],
  });

  beforeEach(() => {
    repository = new EntregaMemoriaRepository();
    service = new EntregasDominioService(repository);
  });

  it('rechaza repetir una entrega para el mismo ciclo de la misma suscripción', async () => {
    const suscripcion = crearSuscripcion(1);
    const fechaProgramada = new Date('2026-10-05');

    await service.generarEntregaCiclo(suscripcion, 1, fechaProgramada);

    await expect(
      service.generarEntregaCiclo(suscripcion, 1, fechaProgramada),
    ).rejects.toThrow(EntregaDuplicadaError);
  });

  it('filtra las entregas por suscripción', async () => {
    await service.generarEntregaCiclo(
      crearSuscripcion(1),
      1,
      new Date('2026-10-05'),
    );
    await service.generarEntregaCiclo(
      crearSuscripcion(2),
      1,
      new Date('2026-10-05'),
    );

    await expect(repository.findAllBySuscripcion(1)).resolves.toHaveLength(1);
  });
});
