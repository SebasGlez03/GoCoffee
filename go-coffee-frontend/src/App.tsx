import { Layout } from "./componentes/Layout";
import { Route, Routes, Navigate} from "react-router";

function App() {

  return (
      <Routes>
        <Route element={<Layout/>}>

          <Route index element={<Navigate to="/planes" replace />} /> 

          <Route path="/planes">
            
          </Route>
        </Route>
      </Routes>
  )
}

export default App
