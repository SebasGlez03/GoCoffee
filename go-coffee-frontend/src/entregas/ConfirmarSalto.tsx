import { Confirmar } from '../compartido/componentes/Confirmar';
import { fechaLarga } from '../compartido/formato';
import type { FilaEntrega } from './ListaEntregas';
import { fechaDeCiclo } from './reglasEntrega';

export function ConfirmarSalto({
  fila,
  ocupado,
  onConfirmar,
  onCancelar,
}: {
  fila: FilaEntrega;
  ocupado: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <Confirmar
      titulo="¿Saltar esta entrega?"
      textoConfirmar="Sí, saltar entrega"
      ocupado={ocupado}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    >
      <p>
        No recibirás la entrega del <strong>{fechaLarga(fechaDeCiclo(fila.ciclo))}</strong> (ciclo #
        {fila.ciclo.numCiclo}) y <strong>no se te cobrará</strong> ese ciclo.
      </p>
      <p>Tus siguientes entregas siguen igual. Un salto no se puede deshacer.</p>
    </Confirmar>
  );
}
