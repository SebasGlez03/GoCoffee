import { Link, useParams } from 'react-router';
import { Cargando } from '../componentes/Cargando';
import { MensajeError } from '../componentes/MensajeError';
import { useSuscripcion } from '../hooks/UseSuscripcion';
import '../assets/css/PaginaDetalleSuscripcion.css';

const estados = { ACTIVA: 'Activa', PAUSADA: 'Pausada', SUSPENDIDA: 'Suspendida', CANCELADA: 'Cancelada' };
const dias = {
    LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves',
    VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
};
const fecha = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

export function PaginaDetalleSuscripcion() {
    const { id } = useParams();
    const idSuscripcion = Number(id);
    if (!id || !/^\d+$/.test(id) || !Number.isSafeInteger(idSuscripcion) || idSuscripcion <= 0) {
        return (
            <section className="gc-detalle-suscripcion">
                <h1>Suscripción inválida</h1>
                <p>El identificador debe ser un número entero positivo.</p>
                <Link to="/suscripciones">Volver a mis suscripciones</Link>
            </section>
        );
    }
    return <DetalleSuscripcion id={idSuscripcion} />;
}

function DetalleSuscripcion({ id }: { id: number }) {
    const { suscripcion, cargando, error, reintentar } = useSuscripcion(id);
    return (
        <section className="gc-detalle-suscripcion" aria-labelledby="detalle-suscripcion-titulo">
            <Link className="gc-detalle-suscripcion__volver" to="/suscripciones">← Volver a mis suscripciones</Link>
            <header>
                <h1 id="detalle-suscripcion-titulo">Suscripción #{id}</h1>
                <p>Consulta los datos de tu suscripción y la entrega de tu café.</p>
            </header>
            {cargando && <Cargando />}
            {error && <MensajeError mensaje={error} onReintentar={reintentar} />}
            {suscripcion && (
                <article className="gc-detalle-suscripcion__tarjeta">
                    <h2>Información de la suscripción</h2>
                    <dl>
                        <div><dt>Estado</dt><dd>{estados[suscripcion.estadoSuscripcion]}</dd></div>
                        <div><dt>Fecha de inicio</dt><dd><time dateTime={suscripcion.fechaInicio}>{fecha.format(new Date(suscripcion.fechaInicio))}</time></dd></div>
                        <div><dt>Día de entrega</dt><dd>{dias[suscripcion.diaSemanaEntrega]}</dd></div>
                        <div><dt>Ciclos registrados</dt><dd>{suscripcion.ciclos.length}</dd></div>
                        <div className="gc-detalle-suscripcion__direccion">
                            <dt>Dirección de entrega</dt>
                            <dd>
                                {suscripcion.direccionEntrega.calle} #{suscripcion.direccionEntrega.numeroCasa}<br />
                                C.P. {suscripcion.direccionEntrega.codigoPostal}, {suscripcion.direccionEntrega.estado}
                            </dd>
                        </div>
                    </dl>
                </article>
            )}
        </section>
    );
}
