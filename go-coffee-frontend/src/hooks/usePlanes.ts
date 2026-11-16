import { useEffect, useState } from "react";
import type {Plan} from '../tipos/tipos.ts';
import { traerPlanes } from "../servicios/goCoffee.ts";
import { mensajeDeError } from "../servicios/api";

export function usePlanes() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let vigente = true;
        traerPlanes()
        .then((lista) => {if(vigente) setPlanes(lista);})
        .catch((e) => {if(vigente) setError(mensajeDeError(e, 'No se pudo conectar con goCoffee'));})
        .finally(() => {if(vigente) setCargando(false);});
        return () => {vigente = false;};
    }, [intento]);

    function reintentar(){
        setCargando(true);
        setError(null);
        setIntento((n) => n + 1);
    }

    return {planes, cargando, error, reintentar}
}