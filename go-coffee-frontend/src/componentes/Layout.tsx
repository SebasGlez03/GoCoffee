import { Encabezado } from "./Encabezado";
import {PiePagina} from "./PiePagina";

export function Layout() {
    return (
        <div className="disposicion">
            <Encabezado/>
            <main className="disposicion__contenido">

            </main>
            <PiePagina />
        </div>
    );
}