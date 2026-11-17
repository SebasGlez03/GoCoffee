import { useEffect, useRef, useState } from 'react';
import type { DiaSemana, Suscripcion } from '../tipos/tipos';
import { traerSuscripcion, pausarSuscripcion, desuscribirse, reanudarSuscripcion, cambiarDiaEntrega } from '../servicios/goCoffee';
import { mensajeDeError } from '../servicios/api';

export function useSuscripcion(id: number) {
    const [resultado, setResultado] = useState<{
        id: number; intento: number; suscripcion: Suscripcion | null; error: string | null;
    } | null>(null);
    const [intento, setIntento] = useState(0);
    const [accion, setAccion] = useState<'pausar' | 'cancelar' | 'reanudar' | 'dia' | null>(null);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const enCurso = useRef(false);
    const montado = useRef(false);

    useEffect(() => {
        montado.current = true;
        return () => { montado.current = false; };
    }, []);

    async function ejecutarAccion(tipo: 'pausar' | 'cancelar' | 'reanudar') {
        if (enCurso.current) return;
        enCurso.current = true;
        setAccion(tipo);
        setErrorAccion(null);
        setMensaje(null);
        const operaciones = { pausar: pausarSuscripcion, cancelar: desuscribirse, reanudar: reanudarSuscripcion };
        const mensajes = { pausar: 'Se pausó la suscripción.', cancelar: 'Se canceló la suscripción.', reanudar: 'Se reanudó la suscripción.' };
        try {
            const suscripcion = await operaciones[tipo](id);
            if (montado.current) {
                setResultado({ id, intento, suscripcion, error: null });
                setMensaje(mensajes[tipo]);
            }
        } catch (e) {
            if (montado.current) setErrorAccion(mensajeDeError(e, 'No se pudo actualizar la suscripción. Intenta de nuevo.'));
        } finally {
            enCurso.current = false;
            if (montado.current) setAccion(null);
        }
    }

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

    async function guardarDiaEntrega(dia: DiaSemana) {
        if (enCurso.current) return;
        enCurso.current = true;
        setAccion('dia');
        setErrorAccion(null);
        setMensaje(null);
        try {
            const suscripcion = await cambiarDiaEntrega(id, dia);
            if (montado.current) {
                setResultado({ id, intento, suscripcion, error: null });
                setMensaje('Se actualizó el día de entrega.');
            }
        } catch (e) {
            if (montado.current) setErrorAccion(mensajeDeError(e, 'No se pudo cambiar el día de entrega. Intenta de nuevo.'));
        } finally {
            enCurso.current = false;
            if (montado.current) setAccion(null);
        }
    }

    const vigente = resultado?.id === id && resultado?.intento === intento;
    return {
        suscripcion: vigente ? resultado.suscripcion : null,
        cargando: !vigente,
        error: vigente ? resultado.error : null,
        reintentar: () => setIntento((n) => n + 1),
        ejecutarAccion, accion, errorAccion, mensaje,
        guardarDiaEntrega,
    };
}
