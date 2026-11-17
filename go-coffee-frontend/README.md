# GoCoffee · Portal del cliente (storefront)

Aplicación React + Vite + TypeScript que usa el cliente final para suscribirse y administrar su café. Corre por su cuenta y le pide los datos al servicio del Avance 2 (`../go-coffee`) por HTTP.

## Arrancar

```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
npm run dev              # http://localhost:5173
```

El servicio debe estar corriendo (ver el [README de la raíz](../README.md)).

### Apuntar al servicio

La dirección del servicio se configura **solo** en `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Después de cambiarla hay que reiniciar `npm run dev`. Si no hay `.env`, se usa `http://localhost:3000`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Revisa tipos y genera `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Sirve el `dist/` generado |

## Estructura (por característica)

Cada carpeta es un área del negocio con sus pantallas, componentes, servicio y estilos.

```
src/
  main.tsx                 Arranque: router + proveedor de sesión
  app/                     Rutas (App.tsx), Layout, Encabezado y Pie comunes
  compartido/
    api/cliente.ts         ÚNICO lugar que habla con la red (axios)
    api/errores.ts         Interpreta los errores del servicio en lenguaje del usuario
    api/token.ts           Guarda/lee la credencial
    tipos.ts               Tipos importados del contrato del servicio (@contrato)
    hooks/useConsulta.ts   Cargando / datos / error para toda pantalla que pide datos
    hooks/useAccion.ts     Operaciones que cambian datos (sin doble clic)
    componentes/           Cargando, MensajeError, EstadoVacio, NoEncontrado, Campo, Aviso, Confirmar…
    estilos/Global.css     Variables y componentes visuales compartidos
    formato.ts             Moneda, fechas y nombres de estados
    validacion.ts          Reglas de validación de formularios
  sesion/                  Inicio de sesión, registro, contexto de sesión, rutas protegidas
  planes/                  Catálogo y detalle de plan + formulario de suscripción
  suscripciones/           Mis suscripciones y detalle (pausar, reanudar, cancelar, día)
  entregas/                Calendario de entregas y salto de entrega
  cambios-plan/            Solicitud e historial de cambios de plan
  cobros/                  Método de pago e historial de cobros
  administracion/          Pantallas de backoffice (solo administrador)
```

## Decisiones

- **Comunicación en un solo lugar.** Las pantallas llaman al servicio de su característica (`planes.servicio.ts`, `suscripciones.servicio.ts`…), que a su vez usa `compartido/api/cliente.ts`. Ninguna pantalla importa axios.
- **Formato uniforme interpretado una vez.** `cliente.ts` abre el sobre `{ data, meta }` y `errores.ts` convierte `{ statusCode, error, message }` en un `ErrorApi` con un mensaje para el usuario y un tipo (`sin-conexion`, `sesion`, `no-encontrado`, `regla`…).
- **Los mismos tipos que el servicio.** `vite.config.ts` y `tsconfig.app.json` definen el alias `@contrato` → `../go-coffee/src/contrato/contrato.ts`. Si el servicio cambia un campo, el portal deja de compilar.
- **Credencial automática.** Cada petición lleva `Authorization: Bearer <token>`. Si el servicio responde 401, `SesionContext` cierra la sesión, avisa y manda a iniciar sesión recordando a dónde se iba.
- **Cuatro situaciones.** `useConsulta` + `EstadoConsulta` resuelven cargando, con información, vacía (con mensaje de por qué) y error (con botón de reintentar). Si el servicio está apagado se muestra "No hay conexión con GoCoffee".
- **Formularios.** Se validan antes de enviar y el mensaje aparece junto al campo que lo provocó.
- **Seguridad.** Ocultar botones solo acomoda la interfaz; quien protege de verdad es el servicio (JWT + roles + dueño del recurso).
