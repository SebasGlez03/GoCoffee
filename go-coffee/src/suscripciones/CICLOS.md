# Programación de ciclos

El repositorio Prisma crea la suscripción y su primer ciclo con entrega PROGRAMADA
en la misma transacción. Los ciclos no se reciben del frontend. El cobro permanece
sin asignar hasta implementar el flujo de pagos; generar un ciclo no cobra dinero.

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

El módulo de cobros debe asociar su registro al ciclo mediante IdCobro y guardar
estadoCobro=PAGADO cuando el pago sea exitoso. FALLIDO o ausencia de cobro no
acreditan una entrega pagada. Al registrar pagos concurrentes, usar la misma
transacción y bloqueo de suscripción que la cancelación, y verificar su estado
antes de aceptar cobros nuevos.

La respuesta de suscripción incluye ultimaEntregaPagada (o null), con idEntrega,
numCiclo, fechaProgramada ISO y estadoEntrega. Se calcula por la fecha de entrega
más tardía entre las pagadas que no estén SALTADAS. El listado y el detalle muestran
este dato después de cancelar y también al volver a consultar la suscripción.

El módulo de entregas debe permitir completar las entregas pagadas ya existentes
aunque la suscripción esté CANCELADA. No debe generar nuevos ciclos para ella.
Este cambio no registra cobros, no simula pagos y no modifica el flujo de envío.

Cambiar el día desplaza la próxima entrega PROGRAMADA al día elegido, nunca al
pasado; las siguientes se calculan desde esa fecha. No modifica entregas ARMADAS,
ENVIADAS ni ENTREGADAS. La preferencia de día no fuerza que los intervalos de 15
y 31 días caigan siempre en el mismo día de la semana.

El proceso bloquea cada suscripción dentro de una transacción. La base de datos
impide repetir el número de ciclo por suscripción. La migración conserva registros
antiguos sin propietario con suscripcionId nulo y copia sus vínculos anteriores.

Validación: npm test -- --runInBand y npm run build.
