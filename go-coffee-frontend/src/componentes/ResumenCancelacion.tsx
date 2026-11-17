import type { Suscripcion } from '../tipos/tipos';

const fecha = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

export function ResumenCancelacion({ suscripcion }: { suscripcion: Suscripcion }) {
  if (suscripcion.estadoSuscripcion !== 'CANCELADA') return null;
  const ultima = suscripcion.ultimaEntregaPagada;
  return (
    <p role="status">
      {ultima ? <>
        {ultima.estadoEntrega === 'ENTREGADA' ? 'Última entrega pagada: ' : 'Se conserva tu última entrega pagada: '}
        <strong><time dateTime={ultima.fechaProgramada}>{fecha.format(new Date(ultima.fechaProgramada))}</time></strong>
        {' '}(ciclo {ultima.numCiclo}).
        {ultima.estadoEntrega === 'ENTREGADA' && ' Ya fue entregada.'}
      </> : 'No hay entregas pagadas registradas por conservar.'}
      {' '}No se generarán nuevos ciclos para esta suscripción.
    </p>
  );
}
