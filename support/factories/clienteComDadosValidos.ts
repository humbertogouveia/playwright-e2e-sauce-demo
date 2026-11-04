// support/factories/cliente.ts
import { faker } from '@faker-js/faker';

export type Cliente = {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
};

export function criarCliente(sobrescrever: Partial<Cliente> = {}): Cliente {
  const nome = faker.person.firstName();
  const sobrenome = faker.person.lastName();
  return {
    nome,
    sobrenome,
    email: faker.internet.email({ firstName: nome, lastName: sobrenome }).toLowerCase(),
    senha: faker.internet.password({ length: 12 }),
    ...sobrescrever,
  };
}
