import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../models/cliente.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class ClienteService {
  private apiUrl = 'http://localhost:3000/api/clientes';  
  constructor(private http: HttpClient) {}

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }
}
