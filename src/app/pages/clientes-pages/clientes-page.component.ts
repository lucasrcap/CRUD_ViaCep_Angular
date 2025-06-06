import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.services';
import { ClienteFormComponent } from '../../components/cliente-form/cliente-form.component';
import { TelefonePipe } from '../../pipe/telefone.pipe';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, ClienteFormComponent, TelefonePipe],
  templateUrl: './clientes-page.component.html',
})
export class ClientesPageComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = true;

  constructor(private clienteService: ClienteService) {}

  ngOnInit() {
    this.fetchClientes();
  }

  fetchClientes() {
    this.loading = true;
    this.clienteService.getClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (err) => console.error('Erro ao buscar clientes:', err),
      complete: () => this.loading = false
    });
  }

  onCreateCliente(cliente: Cliente) {
    this.clienteService.createCliente(cliente).subscribe({
      next: () => this.fetchClientes(),
      error: (err) => console.error('Erro ao criar cliente:', err)
    });
  }

  onDeleteCliente(id: number) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    this.clienteService.deleteCliente(id).subscribe({
      next: () => this.fetchClientes(),
      error: (err) => console.error('Erro ao excluir cliente:', err)
    });
  }
}


