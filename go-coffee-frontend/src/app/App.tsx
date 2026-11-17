import { Navigate, Route, Routes } from 'react-router';
import { PaginaAdministracion } from '../administracion/PaginaAdministracion';
import { PaginaSolicitudesCambio } from '../administracion/PaginaSolicitudesCambio';
import { PaginaCobros } from '../cobros/PaginaCobros';
import { NoEncontrado } from '../compartido/componentes/NoEncontrado';
import { PaginaEntregas } from '../entregas/PaginaEntregas';
import { PaginaCatalogoPlanes } from '../planes/PaginaCatalogoPlanes';
import { PaginaDetallePlan } from '../planes/PaginaDetallePlan';
import { PaginaEntrar } from '../sesion/PaginaEntrar';
import { PaginaRegistro } from '../sesion/PaginaRegistro';
import { RutaAdministrador } from '../sesion/RutaAdministrador';
import { RutaProtegida } from '../sesion/RutaProtegida';
import { PaginaDetalleSuscripcion } from '../suscripciones/PaginaDetalleSuscripcion';
import { PaginaMisSuscripciones } from '../suscripciones/PaginaMisSuscripciones';
import { Layout } from './Layout';

/** Mapa de pantallas del portal. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/planes" replace />} />

        {/* Públicas */}
        <Route path="planes" element={<PaginaCatalogoPlanes />} />
        <Route path="planes/:id" element={<PaginaDetallePlan />} />
        <Route path="entrar" element={<PaginaEntrar />} />
        <Route path="registrar" element={<PaginaRegistro />} />

        {/* Requieren sesión */}
        <Route element={<RutaProtegida />}>
          <Route path="suscripciones" element={<PaginaMisSuscripciones />} />
          <Route path="suscripciones/:id" element={<PaginaDetalleSuscripcion />} />
          <Route path="entregas" element={<PaginaEntregas />} />
          <Route path="cobros" element={<PaginaCobros />} />

          {/* Backoffice (solo administrador) */}
          <Route element={<RutaAdministrador />}>
            <Route path="administracion" element={<PaginaAdministracion />} />
            <Route path="administracion/cambios-plan" element={<PaginaSolicitudesCambio />} />
          </Route>
        </Route>

        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}
