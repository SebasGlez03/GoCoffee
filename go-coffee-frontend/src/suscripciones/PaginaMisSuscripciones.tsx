import { Link } from 'react-router';
import { EncabezadoPagina } from '../compartido/componentes/EncabezadoPagina';
import { EstadoConsulta } from '../compartido/componentes/EstadoConsulta';
import { EstadoVacio } from '../compartido/componentes/EstadoVacio';
import { useConsulta } from '../compartido/hooks/useConsulta';
import { ordenarSuscripciones } from './reglasSuscripcion';
import { traerMisSuscripciones } from './suscripciones.servicio';
import { TarjetaSuscripcion } from './TarjetaSuscripcion';
import './suscripciones.css';

export function PaginaMisSuscripciones() {
  const suscripciones = useConsulta('mis-suscripciones', traerMisSuscripciones);

  return (
    <div className="gc-pagina">
      <EncabezadoPagina
        etiqueta="Tu café, a tu ritmo"
        titulo="Mis suscripciones"
        acciones={
          <Link className="gc-boton gc-boton--secundario" to="/planes">
            Explorar planes
          </Link>
        }
      >
        Revisa el estado de cada suscripción y entra a administrarla: pausar, cambiar de plan o
        cancelar.
      </EncabezadoPagina>

      <EstadoConsulta
        consulta={suscripciones}
        textoCarga="Cargando tus suscripciones…"
        estaVacio={(lista) => lista.length === 0}
        vacio={
          <EstadoVacio
            titulo="Aún no tienes suscripciones"
            accion={
              <Link className="gc-boton" to="/planes">
                Elegir mi plan
              </Link>
            }
          >
            Cuando te suscribas a un plan, aquí podrás ver tus entregas y administrarlo.
          </EstadoVacio>
        }
      >
        {(lista) => (
          <div className="gc-rejilla">
            {ordenarSuscripciones(lista).map((suscripcion) => (
              <TarjetaSuscripcion key={suscripcion.id} suscripcion={suscripcion} />
            ))}
          </div>
        )}
      </EstadoConsulta>
    </div>
  );
}
