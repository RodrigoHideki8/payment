import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { cpf, cnpj } from 'cpf-cnpj-validator';

let msg = 'CPF/CNPJ inválidos';

@ValidatorConstraint({ name: 'isValidateCNPJCPF', async: false })
export class IsValidateCNPJCPF implements ValidatorConstraintInterface {
  validate(cpfOrCnpj: string) {
    if (cpfOrCnpj.length === 11) {
      msg = 'CPF inválido';
      return cpf.isValid(cpfOrCnpj);
    }

    msg = 'CNPJ inválido';
    return cnpj.isValid(cpfOrCnpj);
  }

  defaultMessage() {
    return msg;
  }
}
