import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import type { CredencialesCuerpo } from '../../contrato/contrato';

/**
 * Registro público. Ya no acepta "rol": toda cuenta nueva es CLIENTE.
 * Los administradores se crean con el seed (src/datos/seed.ts).
 */
export class RegisterDto implements CredencialesCuerpo {
  @IsEmail({}, { message: 'Escribe un correo válido.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Escribe una contraseña.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password!: string;
}
