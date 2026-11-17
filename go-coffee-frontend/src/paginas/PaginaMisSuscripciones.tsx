import { Link } from 'react-router';
import { Cargando } from '../componentes/Cargando';
import { MensajeError } from '../componentes/MensajeError';
import { useMisSuscripciones } from '../hooks/UseMisSuscripciones';
import '../assets/css/PaginaMisSuscripciones.css';

const dias = {
    LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
    JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
};

const estados = {
    ACTIVA: 'Activa', PAUSADA: 'Pausada', SUSPENDIDA: 'Suspendida', CANCELADA: 'Cancelada',
};

const formatoFecha = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

export function PaginaMisSuscripciones() {
    const {
        suscripciones, cargando, error, reintentar,
        cancelarSuscripcion, cancelandoId, errorCancelacion, mensajeCancelacion,
        pausarSuscripcion, pausandoId,
        reanudarSuscripcion, reanudandoId,
    } = useMisSuscripciones();
    const procesando = cancelandoId !== null || pausandoId !== null || reanudandoId !== null;

    function confirmarCancelacion(id: number) {
        if (window.confirm(`¿Quieres cancelar la suscripción #${id}? Esta acción no se puede deshacer.`)) {
            void cancelarSuscripcion(id);
        }
    }

    function confirmarPausa(id: number) {
        if (window.confirm(`¿Quieres pausar la suscripción #${id}?`)) {
            void pausarSuscripcion(id);
        }
    }

    function confirmarReanudacion(id: number) {
        if (window.confirm(`¿Quieres reanudar la suscripción #${id}?`)) {
            void reanudarSuscripcion(id);
        }
    }

    return (
        <section className="gc-suscripciones" aria-labelledby="mis-suscripciones-titulo">
            <header className="gc-suscripciones__encabezado">
                <span className="gc-suscripciones__etiqueta">Tu café, a tu ritmo</span>
                <h1 id="mis-suscripciones-titulo">Mis suscripciones</h1>
                <p>Consulta el estado de tus suscripciones y los datos de entrega de tu café.</p>
                <Link className="gc-suscripciones__enlace" to="/planes">Explorar planes</Link>
            </header>

            {cargando && <Cargando />}
            {!cargando && error && <MensajeError mensaje={error} onReintentar={reintentar} />}
            {errorCancelacion && <p className="gc-suscripciones__aviso gc-suscripciones__aviso--error" role="alert">{errorCancelacion}</p>}
            {mensajeCancelacion && <p className="gc-suscripciones__aviso" role="status">{mensajeCancelacion}</p>}

            {!cargando && !error && (
                suscripciones.length === 0 ? (
                    <div className="gc-suscripciones__vacio">
                        <h2>Aún no tienes suscripciones</h2>
                        <p>Elige un plan y comienza a recibir café en tu puerta.</p>
                        <Link className="gc-suscripciones__enlace" to="/planes">Elegir mi plan</Link>
                    </div>
                ) : (
                    <div className="gc-suscripciones__lista">
                        {suscripciones.map((suscripcion) => (
                            <article className="gc-suscripcion" key={suscripcion.id}>
                                <header className="gc-suscripcion__encabezado">
                                    <h2>Suscripción #{suscripcion.id}</h2>
                                    <span className={`gc-suscripcion__estado gc-suscripcion__estado--${suscripcion.estadoSuscripcion.toLowerCase()}`}>
                                        {estados[suscripcion.estadoSuscripcion]}
                                    </span>
                                </header>
                                <dl className="gc-suscripcion__datos">
                                    <div>
                                        <dt>Fecha de inicio</dt>
                                        <dd><time dateTime={suscripcion.fechaInicio}>{formatoFecha.format(new Date(suscripcion.fechaInicio))}</time></dd>
                                    </div>
                                    <div>
                                        <dt>Día de entrega</dt>
                                        <dd>{dias[suscripcion.diaSemanaEntrega]}</dd>
                                    </div>
                                    <div className="gc-suscripcion__direccion">
                                        <dt>Dirección de entrega</dt>
                                        <dd>
                                            {suscripcion.direccionEntrega.calle} #{suscripcion.direccionEntrega.numeroCasa}
                                            <br />
                                            C.P. {suscripcion.direccionEntrega.codigoPostal}, {suscripcion.direccionEntrega.estado}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Ciclos registrados</dt>
                                        <dd>{suscripcion.ciclos.length}</dd>
                                    </div>
                                </dl>
                                <div className="gc-suscripcion__acciones">
                                {suscripcion.estadoSuscripcion === 'ACTIVA' && (
                                    <button
                                        type="button"
                                        className="gc-suscripcion__pausar"
                                        disabled={procesando}
                                        onClick={() => confirmarPausa(suscripcion.id)}
                                        aria-label={`Pausar suscripción #${suscripcion.id}`}
                                    >
                                        {pausandoId === suscripcion.id ? 'Pausando…' : 'Pausar suscripción'}
                                    </button>
                                )}
                                {suscripcion.estadoSuscripcion === 'PAUSADA' && (
                                    <button
                                        type="button"
                                        className="gc-suscripcion__reanudar"
                                        disabled={procesando}
                                        onClick={() => confirmarReanudacion(suscripcion.id)}
                                        aria-label={`Reanudar suscripción #${suscripcion.id}`}
                                    >
                                        {reanudandoId === suscripcion.id ? 'Reanudando…' : 'Reanudar suscripción'}
                                    </button>
                                )}
                                {suscripcion.estadoSuscripcion !== 'CANCELADA' && (
                                    <button
                                        type="button"
                                        className="gc-suscripcion__cancelar"
                                        disabled={procesando}
                                        onClick={() => confirmarCancelacion(suscripcion.id)}
                                        aria-label={`Cancelar suscripción #${suscripcion.id}`}
                                    >
                                        {cancelandoId === suscripcion.id ? 'Cancelando…' : 'Desuscribirme'}
                                    </button>
                                )}
                                </div>
                            </article>
                        ))}
                    </div>
                )
            )}
        </section>
    );
}
