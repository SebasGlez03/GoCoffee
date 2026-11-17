import { useEffect, useState } from 'react';
import type { Suscripcion } from '../tipos/tipos.ts';
import { traerSuscripciones } from '../servicios/goCoffee.ts';
import { mensajeDeError } from '../servicios/api.ts';

export function useMisSuscripciones() {
    const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let vigente = true;
        traerSuscripciones()
            .then((lista) => { if (vigente) setSuscripciones(lista); })
            .catch((e) => {
                if (vigente) setError(mensajeDeError(e, 'No se pudieron cargar tus suscripciones.'));
            })
            .finally(() => { if (vigente) setCargando(false); });

        return () => { vigente = false; };
    }, [intento]);

    function reintentar() {
        setCargando(true);
        setError(null);
        setIntento((n) => n + 1);
    }

    return { suscripciones, cargando, error, reintentar };
}
