import { useEffect, useRef, useState } from 'react';
import type { OpcionesCambioPlan, SolicitudCambioPlan } from '../tipos/tipos';
import {
  traerCambiosPlan,
  traerOpcionesCambioPlan,
  solicitarCambioPlan,
  resolverCambioPlan,
} from '../servicios/goCoffee';
import { mensajeDeError } from '../servicios/api';

export function useCambiosPlan(id?: number) {
  const [historial, setHistorial] = useState<SolicitudCambioPlan[]>([]);
  const [opciones, setOpciones] = useState<OpcionesCambioPlan | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [intento, setIntento] = useState(0);
  const ocupado = useRef(false);
  const montado = useRef(false);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  useEffect(() => {
    let vigente = true;
    Promise.all([
      traerCambiosPlan(id),
      id === undefined ? Promise.resolve(null) : traerOpcionesCambioPlan(id),
    ])
      .then(([lista, opciones]) => {
        if (vigente) {
          setHistorial(lista);
          setOpciones(opciones);
        }
      })
      .catch((e) => {
        if (vigente)
          setError(
            mensajeDeError(e, 'No se pudieron cargar los cambios de plan.'),
          );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [id, intento]);
  function actualizar() {
    setCargando(true);
    setError(null);
    setIntento((n) => n + 1);
  }
  async function guardar(
    operacion: () => Promise<SolicitudCambioPlan>,
    texto: string,
  ) {
    if (ocupado.current) return;
    ocupado.current = true;
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const cambio = await operacion();
      if (montado.current) {
        setHistorial((lista) => [
          cambio,
          ...lista.filter((s) => s.idSolicitud !== cambio.idSolicitud),
        ]);
        setMensaje(texto);
      }
    } catch (e) {
      if (montado.current)
        setError(mensajeDeError(e, 'No se pudo guardar el cambio de plan.'));
    } finally {
      ocupado.current = false;
      if (montado.current) setGuardando(false);
    }
  }
  return {
    historial,
    opciones,
    cargando,
    error,
    mensaje,
    guardando,
    actualizar,
    solicitar: (planId: number, precio: number, numCicloAplicacion: number) =>
      id === undefined
        ? Promise.resolve()
        : guardar(
            () => solicitarCambioPlan(id, planId, precio, numCicloAplicacion),
            'Solicitud enviada. Tu plan seguirá igual hasta la aprobación y el ciclo indicado.',
          ),
    resolver: (solicitudId: number, aceptar: boolean) =>
      guardar(
        () => resolverCambioPlan(solicitudId, aceptar),
        aceptar
          ? 'Cambio aprobado para el ciclo indicado.'
          : 'Solicitud rechazada.',
      ),
  };
}
