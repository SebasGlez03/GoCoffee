import { Navigate, Outlet, useLocation } from 'react-router';
import { useSesion } from './SesionContext';

/**
 * Pantallas que requieren sesión: si no la hay, manda a iniciar sesión
 * y recuerda a dónde iba el usuario para regresarlo después.
 * (Esto acomoda la interfaz; la protección real está en el servicio.)
 */
export function RutaProtegida() {
  const { usuario } = useSesion();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
  }
  return <Outlet />;
}
