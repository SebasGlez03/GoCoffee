# Programación de ciclos

El repositorio Prisma crea la suscripción y su primer ciclo con entrega PROGRAMADA
en la misma transacción. Los ciclos no se reciben del frontend. Generar un ciclo
no cobra dinero.

El servicio CiclosService revisa las suscripciones activas al iniciar el backend y
cada minuto. Mantiene un ciclo futuro, avanzando 7, 15 o 31 días desde el anterior.
Los intervalos son días de calendario UTC, no meses ni semanas ajustadas al día
preferido. Si el servidor estuvo apagado, omite fechas vencidas sin fabricar
entregas atrasadas. La programación requiere mantener el backend ejecutándose.

Pausar o suspender detiene la generación. Reanudar desplaza las entregas pendientes
vencidas al siguiente intervalo futuro. Cancelar marca como SALTADA las entregas
PROGRAMADAS sin cobro PAGADO y detiene la generación. Las pagadas conservan su
fecha y estado, y las detenidas por una pausa se recuperan si estaban pagadas.
No se recuperan saltos voluntarios. Se conserva el historial.

## Integración de cancelación con cobros y entregas

El modo de cobro actual es manual/demo y no procesa pagos. Un administrador
registra el resultado confirmado fuera del sistema en `POST /cobros`; cada intento
se conserva como fila ligada al ciclo. Un ciclo se considera pagado si existe al
menos un intento PAGADO. Un intento FALLIDO suspende la suscripción y detiene la
programación. Cuando todos los intentos fallidos pendientes se resuelven con un
cobro exitoso, la suscripción se reactiva y sincroniza sus ciclos.

El cliente puede consultar su historial en `GET /cobros/historial` y corregir los
datos visibles de pago en `GET/PUT /cobros/metodo-pago`. Solo se guarda titular,
marca y últimos cuatro dígitos; no se solicitan ni almacenan número completo,
CVV o fecha de expiración. Estos metadatos no autorizan un cargo real.

El registro de cobros y el salto de entrega bloquean la suscripción dentro de una
transacción para evitar que ambas operaciones se acepten a la vez. No se puede
cobrar un ciclo saltado, saltar un ciclo pagado ni cobrar dos veces un ciclo.

La respuesta de suscripción incluye ultimaEntregaPagada (o null), con idEntrega,
numCiclo, fechaProgramada ISO y estadoEntrega. Se calcula por la fecha de entrega
más tardía entre las pagadas que no estén SALTADAS. El listado y el detalle muestran
este dato después de cancelar y también al volver a consultar la suscripción.

La pantalla de entregas muestra los ciclos por mes y permite saltar una entrega
PROGRAMADA no pagada con `POST /suscripciones/:id/ciclos/:numCiclo/saltar`.
El endpoint valida la propiedad de la suscripción y conserva el ciclo como parte
del historial.

Los cambios de plan permiten seleccionar uno de los próximos doce ciclos. La
solicitud queda pendiente de aprobación; el plan nuevo y su precio se aplican
cuando el programador alcanza ese número de ciclo.

El panel `GET /administracion/ciclos` permite filtrar el historial por fechas,
suscripción, estado de entrega y estado de cobro. El panel también permite al
administrador registrar el resultado manual de un cobro.

Cambiar el día desplaza la próxima entrega PROGRAMADA al día elegido, nunca al
pasado; las siguientes se calculan desde esa fecha. No modifica entregas ARMADAS,
ENVIADAS ni ENTREGADAS. La preferencia de día no fuerza que los intervalos de 15
y 31 días caigan siempre en el mismo día de la semana.

El proceso bloquea cada suscripción dentro de una transacción. La base de datos
impide repetir el número de ciclo por suscripción. La migración conserva registros
antiguos sin propietario con suscripcionId nulo y copia sus vínculos anteriores.

Validación: npm test -- --runInBand y npm run build.
