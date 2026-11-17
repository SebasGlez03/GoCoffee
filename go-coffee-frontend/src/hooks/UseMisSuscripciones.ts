import { useEffect, useRef, useState } from 'react';
import type { Suscripcion } from '../tipos/tipos.ts';
import { desuscribirse, traerSuscripciones } from '../servicios/goCoffee.ts';
import { mensajeDeError } from '../servicios/api.ts';

export function useMisSuscripciones() {
    const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [intento, setIntento] = useState(0);
    const [cancelandoId, setCancelandoId] = useState<number | null>(null);
    const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null);
    const [mensajeCancelacion, setMensajeCancelacion] = useState<string | null>(null);
    const cancelacionEnCurso = useRef(false);

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

    async function cancelarSuscripcion(id: number) {
        if (cancelacionEnCurso.current) return;
        cancelacionEnCurso.current = true;
        setCancelandoId(id);
        setErrorCancelacion(null);
        setMensajeCancelacion(null);
        try {
            const actualizada = await desuscribirse(id);
            setSuscripciones((lista) => lista.map((s) => s.id === id ? actualizada : s));
            setMensajeCancelacion(`Se canceló la suscripción #${id}.`);
        } catch (e) {
            setErrorCancelacion(mensajeDeError(e, 'No se pudo cancelar la suscripción. Intenta de nuevo.'));
        } finally {
            cancelacionEnCurso.current = false;
            setCancelandoId(null);
        }
    }

    return {
        suscripciones, cargando, error, reintentar,
        cancelarSuscripcion, cancelandoId, errorCancelacion, mensajeCancelacion,
    };
}
