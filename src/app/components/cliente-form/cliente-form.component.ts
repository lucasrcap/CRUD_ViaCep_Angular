import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Cliente } from '../../models/cliente.model';
import { MatStepperModule, MatStepperPrevious } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';


@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgxMaskDirective
  ],
  providers: [provideNgxMask()],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css'],
  encapsulation: ViewEncapsulation.None, 
})

export class ClienteFormComponent {
  @Output() submitCliente = new EventEmitter<Cliente>();

    personalForm!: FormGroup;
    addressForm!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.initForms();
  }

  private initForms() {
    this.personalForm = this.fb.group({
      nome: ['', Validators.required],
      sobrenome: [''],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      dataNascimento: ['']
    });

    this.addressForm = this.fb.group({
      cep: ['', Validators.required],
      logradouro: [''],
      bairro: [''],
      estado: [''],
      localidade: [''],
      complemento: ['']
    });
  }

  buscarEnderecoPorCep() {
    const cep = this.addressForm.get('cep')?.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (data) => {
        if (data.erro) return;
        this.addressForm.patchValue({
          logradouro: data.logradouro,
          bairro: data.bairro,
          estado: data.uf,
          localidade: data.localidade,
          complemento: data.complemento
        });
      },
      error: (err) => console.error('Erro ao buscar CEP:', err)
    });
  }

  enviarFormulario() {
    if (this.personalForm.invalid || this.addressForm.invalid) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const cliente: Cliente = {
      id: 0,
      ...this.personalForm.value,
      endereco: this.addressForm.value
    };

    this.submitCliente.emit(cliente);

    this.personalForm.reset();
    this.addressForm.reset();
  }
}