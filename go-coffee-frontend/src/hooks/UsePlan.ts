import { useEffect, useState } from "react";
import { traerPlan } from "../servicios/goCoffee";
import { mensajeDeError } from '../servicios/api.ts';
import type { Plan } from "../tipos/tipos";


export function usePlan(id: number){
    const [plan, setPlan] = useState<Plan | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [intento, setIntento] = useState(0);

    useEffect(() =>{
        let vigente = true;
        traerPlan(id)
        .then((datos) => {if(vigente) setPlan(datos);})
        .catch((e) => { if (vigente) setError(mensajeDeError(e, 'No se pudo conectar con el gimnasio.'))})
        .finally(() => { if (vigente) setCargando(false); });
        
        return () => {vigente = false;}
    }, [id, intento])

    function reintentar() {
        setCargando(true);
        setError(null);
        setIntento((n) => n + 1);
    }

    return { plan, cargando, error, reintentar };
}