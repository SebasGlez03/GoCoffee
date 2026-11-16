import { Layout } from "./componentes/Layout";
import { Route, Routes, Navigate} from "react-router";
import { PaginaCatalogoPlanes } from "./paginas/PaginaCatalogoPlanes";
import { PaginaDetallePlan } from "./paginas/PaginaDetallePlan";
import { NoEncontrado } from "./componentes/NoEncontrado";

function App() {

  return (
      <Routes>
        <Route element={<Layout/>}>

          <Route index element={<Navigate to="/planes" replace />} /> 

          <Route path="/planes">
             <Route index element={<PaginaCatalogoPlanes />} />
             <Route path=":id" element={<PaginaDetallePlan />} />
          </Route>

          <Route path="*" element={<NoEncontrado />} />

        </Route>
      </Routes>
  )
}

export default App
