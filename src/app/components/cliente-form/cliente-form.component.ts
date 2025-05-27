import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../models/cliente.model';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cliente-form.component.html',
})
export class ClienteFormComponent {
  @Output() submitCliente = new EventEmitter<Cliente>();

  cliente: Cliente = {
    id: 0,
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    endereco: {
      cep: '',
      logradouro: '',
      bairro: '',
      estado: '',
      localidade: '',
      complemento: ''
    }
  };

  constructor(private http: HttpClient) {}

  buscarEnderecoPorCep() {
    const cep = this.cliente.endereco.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (data) => {
        if (data.erro) return;
        this.cliente.endereco.logradouro = data.logradouro;
        this.cliente.endereco.bairro = data.bairro;
        this.cliente.endereco.estado = data.uf;
        this.cliente.endereco.localidade = data.localidade;
        this.cliente.endereco.complemento = data.complemento;
      },
      error: (err) => console.error('Erro ao buscar CEP:', err)
    });
  }

  enviarFormulario() {
    if (!this.cliente.nome || !this.cliente.email || !this.cliente.telefone) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const clienteCopiado = { ...this.cliente };
    this.submitCliente.emit(clienteCopiado);
    this.resetarFormulario();
  }

  resetarFormulario() {
    this.cliente = {
      id: 0,
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      endereco: {
        cep: '',
        logradouro: '',
        bairro: '',
        estado: '',
        localidade: '',
        complemento: ''
      }
    };
  }
}
