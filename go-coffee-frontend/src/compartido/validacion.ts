/** Validación de formularios antes de enviar. Cada regla devuelve el mensaje o null. */
export type Regla = (valor: string) => string | null;
export type Errores<C extends string> = Partial<Record<C, string>>;

export const requerido =
  (mensaje: string): Regla =>
  (v) =>
    v.trim() ? null : mensaje;

export const correo: Regla = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Escribe un correo válido, por ejemplo nombre@correo.com.';

export const minimo =
  (n: number, mensaje: string): Regla =>
  (v) =>
    v.length >= n ? null : mensaje;

export const patron =
  (expresion: RegExp, mensaje: string): Regla =>
  (v) =>
    expresion.test(v.trim()) ? null : mensaje;

/** Aplica las reglas a cada campo y devuelve solo los campos con error. */
export function validar<C extends string>(
  valores: Record<C, string>,
  reglas: Partial<Record<C, Regla[]>>,
): Errores<C> {
  const errores: Errores<C> = {};
  for (const campo of Object.keys(reglas) as C[]) {
    for (const regla of reglas[campo] ?? []) {
      const mensaje = regla(valores[campo] ?? '');
      if (mensaje) {
        errores[campo] = mensaje;
        break;
      }
    }
  }
  return errores;
}

/** Lleva el foco al primer campo con error para que el usuario lo vea. */
export function enfocarPrimerError(errores: Errores<string>) {
  const primero = Object.keys(errores)[0];
  if (primero) document.getElementById(primero)?.focus();
}
