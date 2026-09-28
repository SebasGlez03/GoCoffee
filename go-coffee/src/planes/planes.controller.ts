import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Res} from '@nestjs/common';
import { PlanesService } from './planes.service';
import { PlanMapper } from './mapper/PlanMapper';
import { PlanNoEncontradoError } from './errores/errores';
import type { CrearPlanDTO } from './dto/crearPlanDto';
import type {Response} from 'express';
import type { ModificarPlanDTO } from './dto/modificarPlanDTO';
import { EstadoPlan } from '../dominio/tipos';

@Controller('planes')
export class PlanesController {

    constructor(private readonly servicio: PlanesService) {}

    @Get(':id')
    async buscar(@Param('id') id: string) {
        try{
           const plan = await this.servicio.buscarPlanPorId(Number(id));
           return PlanMapper.toDto(plan);
        }
        catch(error){
            if (error instanceof PlanNoEncontradoError) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }

    @Get()
    async listar() {
        const lista = await this.servicio.buscarTodosLosPlanes();
        return lista.map(plan => PlanMapper.toDto(plan));
    }

    @Post()
    @HttpCode(201)
    async crear(
        @Body() dto: CrearPlanDTO,
        @Res({passthrough: true}) res: Response,
    ){
        try{
            const nuevoPlan = await this.servicio.guardarNuevoPlan(dto);
            res.setHeader('location',`/planes/${nuevoPlan.idPlan}`);
            return PlanMapper.toDto(nuevoPlan);
        } catch(error){
            if(error instanceof Error){
                throw new BadRequestException(error.message);
            }
        }
    }

    @Put()
    async modificar(
        @Body() dto: ModificarPlanDTO,
        @Res({ passthrough: true }) res: Response,
    ){
        try{
            const planModificado = await this.servicio.modificarNuevoPlan(dto);
            res.setHeader('location',`/planes/${dto.id}`);
            return PlanMapper.toDto(planModificado);
        } catch(error){
            if(error instanceof PlanNoEncontradoError){
                throw new NotFoundException(`No existe el plan con el id: ${dto.id}`);
            }

            if(error instanceof Error){
                throw new BadRequestException(error.message);
            }
        }
    }

    @Delete(':id')
    async cancelar(@Param('id') id: string) {
        try{
            await this.servicio.eliminarPlan(Number(id));
        }catch(error){
            if(error instanceof PlanNoEncontradoError){
                throw new NotFoundException(`No existe el plan con el id: ${id}`);
            }

            if(error instanceof Error){
                throw new BadRequestException(error.message);
            }
        }
    }

    @Get('estado/:estado')
    async buscarPorEstado(@Param('estado') estado: string) {
        try {
            const planes = await this.servicio.buscarPlanesPorEstado(estado as EstadoPlan);
            return planes.map(plan => PlanMapper.toDto(plan));
        } catch (error) {
            if (error instanceof Error) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

}
