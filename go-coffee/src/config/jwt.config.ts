/**
 * Lee el secreto del JWT desde el entorno. Ya no existe un valor por
 * defecto: si falta JWT_SECRET el servicio no arranca, para no firmar
 * tokens con un secreto conocido por todos.
 */
export function obtenerSecretoJwt(): string {
  const secreto = process.env.JWT_SECRET?.trim();
  if (!secreto) {
    throw new Error(
      'Falta la variable JWT_SECRET. Cópiala de .env.example a tu archivo .env.',
    );
  }
  return secreto;
}

/** Duración de la sesión. El portal cierra la sesión cuando el token vence. */
export const DURACION_TOKEN = process.env.JWT_EXPIRA_EN ?? '7d';
