import { Layout } from "./componentes/Layout";
import { Route, Routes, Navigate} from "react-router";
import { PaginaCatalogoPlanes } from "./paginas/PaginaCatalogoPlanes";
import { PaginaDetallePlan } from "./paginas/PaginaDetallePlan";
import { NoEncontrado } from "./componentes/NoEncontrado";
import { PaginaRegistro } from "./paginas/PaginaRegistro";
import { PaginaEntrar } from "./paginas/PaginaEntrar";
import { RutaProtegida } from "./componentes/RutaProtegida";
import { PaginaMisSuscripciones } from "./paginas/PaginaMisSuscripciones";
import { PaginaDetalleSuscripcion } from "./paginas/PaginaDetalleSuscripcion";
import { PaginaCambiosPlan } from "./paginas/PaginaCambiosPlan";

function App() {

  return (
      <Routes>
        <Route element={<Layout/>}>

          <Route index element={<Navigate to="/planes" replace />} /> 

          <Route path="/planes">
             <Route index element={<PaginaCatalogoPlanes />} />
             <Route path=":id" element={<PaginaDetallePlan />} />
          </Route>

          
          <Route path="entrar" element={<PaginaEntrar/>} />
          <Route path="registrar" element={<PaginaRegistro />} /> 

          <Route element={<RutaProtegida/>}>
            <Route path="administracion/cambios-plan" element={<PaginaCambiosPlan />} />
            <Route path="suscripciones">
              <Route index element={<PaginaMisSuscripciones/>} />
              <Route path=":id" element={<PaginaDetalleSuscripcion/>} />
            </Route>
          </Route>

          <Route path="*" element={<NoEncontrado />} />

        </Route>
      </Routes>
  )
}

export default App
