import { Layout } from "./componentes/Layout";
import { Route, Routes, Navigate} from "react-router";
import { PaginaCatalogoPlanes } from "./paginas/PaginaCatalogoPlanes";
import { PaginaDetallePlan } from "./paginas/PaginaDetallePlan";
import { NoEncontrado } from "./componentes/NoEncontrado";
import { PaginaRegistro } from "./paginas/PaginaRegistro";
import { PaginaEntrar } from "./paginas/PaginaEntrar";
import { RutaProtegida } from "./componentes/RutaProtegida";
import { PaginaMisSuscripciones } from "./paginas/PaginaMisSuscripciones";

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
            <Route path="suscripciones" element={<PaginaMisSuscripciones/>}/>
          </Route>

          <Route path="*" element={<NoEncontrado />} />

        </Route>
      </Routes>
  )
}

export default App
