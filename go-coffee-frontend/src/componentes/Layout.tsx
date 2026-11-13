import { Encabezado } from "./Encabezado";
import {PiePagina} from "./PiePagina";
import { Outlet } from 'react-router';

export function Layout() {
    return (
        <div className="disposicion">
            <Encabezado/>
            <main className="disposicion__contenido">
                <Outlet />
            </main>
            <PiePagina />
        </div>
    );
}