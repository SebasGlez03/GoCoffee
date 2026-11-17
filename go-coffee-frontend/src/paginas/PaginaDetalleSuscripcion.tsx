import { Link, useParams } from 'react-router';
import { useState } from 'react';
import type { DiaSemana } from '../tipos/tipos';
import { Cargando } from '../componentes/Cargando';
import { CambioPlanSuscripcion } from '../componentes/CambioPlanSuscripcion';
import { DatosPlanSuscripcion } from '../componentes/DatosPlanSuscripcion';
import { ResumenCancelacion } from '../componentes/ResumenCancelacion';
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
    return <DetalleSuscripcion key={idSuscripcion} id={idSuscripcion} />;
}

function DetalleSuscripcion({ id }: { id: number }) {
    const { suscripcion, cargando, error, reintentar, ejecutarAccion, accion, errorAccion, mensaje, guardarDiaEntrega } = useSuscripcion(id);
    const [diaElegido, setDiaElegido] = useState<DiaSemana | null>(null);
    const diaActual = diaElegido ?? suscripcion?.diaSemanaEntrega;

    function confirmar(tipo: 'pausar' | 'cancelar' | 'reanudar') {
        const aviso = tipo === 'cancelar' ? ' Se respetarán las entregas ya pagadas. Esta acción no se puede deshacer.' : '';
        if (window.confirm(`¿Quieres ${tipo} la suscripción #${id}?${aviso}`)) {
            void ejecutarAccion(tipo);
        }
    }
    return (
        <section className="gc-detalle-suscripcion" aria-labelledby="detalle-suscripcion-titulo">
            <Link className="gc-detalle-suscripcion__volver" to="/suscripciones">← Volver a mis suscripciones</Link>
            <header>
                <h1 id="detalle-suscripcion-titulo">Suscripción #{id}</h1>
                <p>Consulta los datos de tu suscripción y la entrega de tu café.</p>
            </header>
            {cargando && <Cargando />}
            {error && <MensajeError mensaje={error} onReintentar={reintentar} />}
            {errorAccion && <p className="gc-detalle-suscripcion__aviso gc-detalle-suscripcion__aviso--error" role="alert">{errorAccion}</p>}
            {mensaje && <p className="gc-detalle-suscripcion__aviso" role="status">{mensaje}</p>}
            {suscripcion && (
                <article className="gc-detalle-suscripcion__tarjeta">
                    <h2>Información de la suscripción</h2>
                    <DatosPlanSuscripcion plan={suscripcion.plan} />
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
                    <ResumenCancelacion suscripcion={suscripcion} />
                    {suscripcion.estadoSuscripcion === 'PAUSADA' && (
                        <p className="gc-detalle-suscripcion__aviso" role="status">
                            Tu suscripción está pausada. Puedes reanudarla cuando quieras.
                        </p>
                    )}
                    {suscripcion.estadoSuscripcion !== 'CANCELADA' && (
                        <form className="gc-detalle-suscripcion__dia" onSubmit={(e) => {
                            e.preventDefault();
                            if (diaActual && diaActual !== suscripcion.diaSemanaEntrega) {
                                void guardarDiaEntrega(diaActual);
                            }
                        }}>
                            <label htmlFor="dia-entrega">Cambiar día de entrega</label>
                            <div>
                                <select
                                    id="dia-entrega"
                                    value={diaActual}
                                    disabled={accion !== null}
                                    onChange={(e) => setDiaElegido(e.target.value as DiaSemana)}
                                >
                                    {Object.entries(dias).map(([valor, nombre]) => (
                                        <option key={valor} value={valor}>{nombre}</option>
                                    ))}
                                </select>
                                <button type="submit" disabled={accion !== null || diaActual === suscripcion.diaSemanaEntrega}>
                                    {accion === 'dia' ? 'Guardando…' : 'Guardar día de entrega'}
                                </button>
                            </div>
                        </form>
                    )}
                    <div className="gc-detalle-suscripcion__acciones">
                        {suscripcion.estadoSuscripcion === 'ACTIVA' && (
                            <button type="button" disabled={accion !== null} onClick={() => confirmar('pausar')}>
                                {accion === 'pausar' ? 'Pausando…' : 'Pausar suscripción'}
                            </button>
                        )}
                        {suscripcion.estadoSuscripcion === 'PAUSADA' && (
                            <button type="button" disabled={accion !== null} onClick={() => confirmar('reanudar')}>
                                {accion === 'reanudar' ? 'Reanudando…' : 'Reanudar suscripción'}
                            </button>
                        )}
                        {suscripcion.estadoSuscripcion !== 'CANCELADA' && (
                            <button type="button" className="gc-detalle-suscripcion__cancelar" disabled={accion !== null} onClick={() => confirmar('cancelar')}>
                                {accion === 'cancelar' ? 'Cancelando…' : 'Desuscribirme'}
                            </button>
                        )}
                    </div>
                    <CambioPlanSuscripcion key={`${suscripcion.id}-${suscripcion.estadoSuscripcion}-${suscripcion.plan?.idPlan}`} suscripcion={suscripcion} />
                </article>
            )}
        </section>
    );
}
