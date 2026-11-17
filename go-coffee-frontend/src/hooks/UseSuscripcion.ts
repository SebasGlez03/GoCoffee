import { useEffect, useState } from 'react';
import type { Suscripcion } from '../tipos/tipos';
import { traerSuscripcion } from '../servicios/goCoffee';
import { mensajeDeError } from '../servicios/api';

export function useSuscripcion(id: number) {
    const [resultado, setResultado] = useState<{
        id: number; intento: number; suscripcion: Suscripcion | null; error: string | null;
    } | null>(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let vigente = true;
        traerSuscripcion(id)
            .then((suscripcion) => {
                if (vigente) setResultado({ id, intento, suscripcion, error: null });
            })
            .catch((e) => {
                if (vigente) setResultado({
                    id, intento, suscripcion: null,
                    error: mensajeDeError(e, 'No se pudo cargar la suscripción.'),
                });
            });
        return () => { vigente = false; };
    }, [id, intento]);

    const vigente = resultado?.id === id && resultado?.intento === intento;
    return {
        suscripcion: vigente ? resultado.suscripcion : null,
        cargando: !vigente,
        error: vigente ? resultado.error : null,
        reintentar: () => setIntento((n) => n + 1),
    };
}
