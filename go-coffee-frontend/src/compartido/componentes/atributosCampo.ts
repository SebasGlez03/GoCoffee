/** Atributos de accesibilidad que conectan el control con su mensaje. */
export function atributosCampo(id: string, error?: string, ayuda?: string) {
  return {
    id,
    name: id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined,
  } as const;
}
