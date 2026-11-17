import type { RespuestaError } from '../tipos';

/**
 * Tipos de falla que entiende el portal. Las pantallas deciden qué
 * mostrar según el tipo, nunca según el código HTTP.
 */
export type TipoError =
  | 'sin-conexion' // el servicio no responde o no hay red
  | 'sesion' // 401: la credencial ya no vale
  | 'permiso' // 403
  | 'no-encontrado' // 404
  | 'validacion' // 400
  | 'regla' // 409 / 422: una regla de negocio lo impidió
  | 'servidor'; // 500 o algo inesperado

export class ErrorApi extends Error {
  readonly tipo: TipoError;
  readonly estado: number | null;
  readonly codigo: string | null;

  constructor(tipo: TipoError, mensaje: string, estado: number | null, codigo: string | null) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.tipo = tipo;
    this.estado = estado;
    this.codigo = codigo;
  }
}

/** Mensajes para el usuario según el código de error de dominio del servicio. */
const MENSAJES_POR_CODIGO: Record<string, string> = {
  SuscripcionDuplicadaError:
    'Ya tienes una suscripción a este plan. Puedes verla en "Mis suscripciones".',
  CambioRetroactivoError: 'La fecha elegida ya pasó. Elige una fecha a partir de mañana.',
  SuscripcionCanceladaError: 'Esta suscripción está cancelada y ya no se puede modificar.',
  SuscripcionInactivaError: 'Esta suscripción no está activa, por eso no genera entregas.',
  EntregaDuplicadaError: 'Esa entrega ya estaba programada.',
  ModificacionEntregaEnProcesoError:
    'Esa entrega ya se está preparando o ya salió, así que no se puede cambiar.',
  PlanNoEncontradoError: 'Ese plan no existe o ya no está disponible.',
  SuscripcionNoEncontradaError: 'No encontramos esa suscripción.',
  IdInvalidoError: 'La dirección que abriste no es válida.',
};

const MENSAJES_POR_TIPO: Record<TipoError, string> = {
  'sin-conexion':
    'No pudimos comunicarnos con GoCoffee. Revisa tu conexión o inténtalo de nuevo en unos minutos.',
  sesion: 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.',
  permiso: 'No tienes permiso para hacer esto.',
  'no-encontrado': 'No encontramos lo que buscabas.',
  validacion: 'Algunos datos no son válidos. Revísalos e inténtalo de nuevo.',
  regla: 'No se pudo completar la operación.',
  servidor: 'Algo salió mal de nuestro lado. Inténtalo de nuevo en unos minutos.',
};

function tipoPorEstado(estado: number): TipoError {
  if (estado === 400) return 'validacion';
  if (estado === 401) return 'sesion';
  if (estado === 403) return 'permiso';
  if (estado === 404) return 'no-encontrado';
  if (estado === 409 || estado === 422) return 'regla';
  return 'servidor';
}

/** Los mensajes por defecto de class-validator vienen en inglés y son técnicos. */
function esTecnico(texto: string) {
  return /\b(should|must|property|constraint|undefined|null)\b/i.test(texto);
}

/**
 * Convierte la respuesta de error del servicio (formato RespuestaError del
 * contrato) en un ErrorApi con un mensaje en lenguaje del usuario.
 * ÚNICO lugar donde se interpretan los errores del servicio.
 */
export function interpretarError(
  estado: number | null,
  cuerpo: Partial<RespuestaError> | undefined,
): ErrorApi {
  if (estado === null) {
    return new ErrorApi('sin-conexion', MENSAJES_POR_TIPO['sin-conexion'], null, null);
  }
  const tipo = tipoPorEstado(estado);
  const codigo = typeof cuerpo?.error === 'string' ? cuerpo.error : null;

  if (codigo && MENSAJES_POR_CODIGO[codigo]) {
    return new ErrorApi(tipo, MENSAJES_POR_CODIGO[codigo], estado, codigo);
  }

  // Para 400, 401 (login) y 409 el servicio ya responde textos para el usuario.
  if (tipo === 'validacion' || tipo === 'regla' || estado === 401) {
    const mensajes = ([] as string[]).concat(cuerpo?.message ?? []);
    if (mensajes.length > 0 && !mensajes.some(esTecnico)) {
      return new ErrorApi(tipo, mensajes.join(' '), estado, codigo);
    }
  }

  return new ErrorApi(tipo, MENSAJES_POR_TIPO[tipo], estado, codigo);
}

/** Para errores que no vienen del cliente HTTP (por si acaso). */
export function aErrorApi(error: unknown): ErrorApi {
  if (error instanceof ErrorApi) return error;
  return new ErrorApi('servidor', MENSAJES_POR_TIPO.servidor, null, null);
}
