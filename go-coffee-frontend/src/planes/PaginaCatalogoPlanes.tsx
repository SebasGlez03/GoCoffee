import { EstadoConsulta } from '../compartido/componentes/EstadoConsulta';
import { EstadoVacio } from '../compartido/componentes/EstadoVacio';
import { useConsulta } from '../compartido/hooks/useConsulta';
import { PlanCard } from './PlanCard';
import { traerPlanesVigentes } from './planes.servicio';
import './planes.css';

const PASOS = [
  { icono: '🛒', titulo: 'Elige tu plan', texto: 'Compara cantidad, frecuencia y precio por entrega.' },
  { icono: '📅', titulo: 'Escoge tu día', texto: 'Indica tu dirección y el día de la semana en que quieres recibirlo.' },
  { icono: '☕', titulo: 'Recíbelo en casa', texto: 'Consulta tus entregas, pausa o salta una cuando lo necesites.' },
];

export function PaginaCatalogoPlanes() {
  const planes = useConsulta('planes-vigentes', traerPlanesVigentes);

  return (
    <div className="gc-pagina">
      <section className="gc-hero">
        <span className="gc-pagina__etiqueta">Suscripciones GoCoffee</span>
        <h1>Café recién tostado, en tu puerta y a tu ritmo</h1>
        <p>
          Elige un plan y recibe café de especialidad cada ciclo. Sin compras repetidas: pausa, salta
          una entrega o cambia de plan cuando lo necesites.
        </p>
      </section>

      <section aria-labelledby="titulo-planes">
        <h2 id="titulo-planes" className="gc-seccion__titulo">
          Nuestros planes
        </h2>
        <EstadoConsulta
          consulta={planes}
          textoCarga="Cargando los planes…"
          estaVacio={(lista) => lista.length === 0}
          vacio={
            <EstadoVacio icono="🫘" titulo="Por ahora no hay planes disponibles">
              Estamos preparando el catálogo de esta temporada. Vuelve pronto.
            </EstadoVacio>
          }
        >
          {(lista) => (
            <div className="gc-planes">
              {lista.map((plan) => (
                <PlanCard key={plan.idPlan} plan={plan} />
              ))}
            </div>
          )}
        </EstadoConsulta>
      </section>

      <section className="gc-pasos" aria-labelledby="titulo-pasos">
        <h2 id="titulo-pasos" className="gc-seccion__titulo">
          ¿Cómo funciona?
        </h2>
        <ol className="gc-pasos__lista">
          {PASOS.map((paso) => (
            <li key={paso.titulo} className="gc-tarjeta">
              <span className="gc-pasos__icono" aria-hidden="true">
                {paso.icono}
              </span>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
