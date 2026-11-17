/** A dónde regresar al usuario después de entrar o registrarse. */
export function destinoSeguro(desde: unknown, porDefecto = '/suscripciones'): string {
  if (typeof desde !== 'string') return porDefecto;
  if (!desde.startsWith('/') || desde.startsWith('//')) return porDefecto;
  if (desde.startsWith('/entrar') || desde.startsWith('/registrar')) return porDefecto;
  return desde;
}
