export interface Endereco {
  cep: string;
  logradouro: string;
  bairro: string;
  estado: string;
  localidade: string;
  complemento: string;
}

export interface Cliente {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  endereco: Endereco;
}
