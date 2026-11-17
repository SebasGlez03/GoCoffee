import { Outlet } from 'react-router';
import { NoEncontrado } from '../compartido/componentes/NoEncontrado';
import { useSesion } from './SesionContext';

/** Las pantallas de backoffice solo se muestran al administrador. */
export function RutaAdministrador() {
  const { esAdministrador } = useSesion();
  if (!esAdministrador) {
    return (
      <NoEncontrado
        codigo="🔒"
        titulo="Esta sección no está disponible"
        mensaje="Solo el personal de GoCoffee puede ver esta página."
        enlace={{ a: '/suscripciones', texto: 'Ir a mis suscripciones' }}
      />
    );
  }
  return <Outlet />;
}
