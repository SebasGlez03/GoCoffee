import { api, type Sobre } from './api.ts'; 
import type {Plan} from '../tipos/tipos.ts';

export async function traerPlanes(): Promise<Plan[]>{
    const respuesta = await api.get<Sobre<Plan[]>>('/planes');
    return respuesta.data.data;
}
