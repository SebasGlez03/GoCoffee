import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import type { CredencialesCuerpo } from '../../contrato/contrato';

export class LoginDto implements CredencialesCuerpo {
  @IsEmail({}, { message: 'Escribe un correo válido.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Escribe tu contraseña.' })
  password!: string;
}
