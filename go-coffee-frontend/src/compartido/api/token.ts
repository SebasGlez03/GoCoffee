/** Único lugar donde se guarda y se lee la credencial en el navegador. */
const CLAVE_TOKEN = 'gocoffee.token';
const CLAVE_USUARIO = 'gocoffee.usuario';

function seguro<T>(accion: () => T, porDefecto: T): T {
  try {
    return accion();
  } catch {
    return porDefecto; // almacenamiento bloqueado (modo privado, etc.)
  }
}

export const almacen = {
  leerToken: () => seguro(() => localStorage.getItem(CLAVE_TOKEN), null),
  leerUsuario: () => seguro(() => localStorage.getItem(CLAVE_USUARIO), null),
  guardar(token: string, usuario: unknown) {
    seguro(() => {
      localStorage.setItem(CLAVE_TOKEN, token);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    }, undefined);
  },
  borrar() {
    seguro(() => {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    }, undefined);
  },
};

/** Lee la fecha de vencimiento del JWT (sin verificarlo: eso lo hace el servicio). */
export function tokenVencido(token: string): boolean {
  try {
    const carga = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    ) as { exp?: number };
    return typeof carga.exp === 'number' && carga.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
