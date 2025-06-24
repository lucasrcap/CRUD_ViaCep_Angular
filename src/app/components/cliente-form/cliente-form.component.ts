import { Component, EventEmitter, Input, Output, ViewEncapsulation, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Cliente } from '../../models/cliente.model';
import { MatStepper, MatStepperModule, MatStepperPrevious } from '@angular/material/stepper';
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

export class ClienteFormComponent implements OnChanges {
  @Input() clienteEditavel: Cliente | null = null;
  @Output() submitCliente = new EventEmitter<Cliente>();


    personalForm!: FormGroup;
    addressForm!: FormGroup;

    @ViewChild('stepper') stepper!: MatStepper;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clienteEditavel'] && this.clienteEditavel) {
      const c = this.clienteEditavel;

      this.personalForm.patchValue({
        nome: c.nome,
        sobrenome: c.sobrenome,
        email: c.email,
        telefone: c.telefone,
        dataNascimento: c.dataNascimento
      });

      this.addressForm.patchValue({
        cep: c.endereco?.cep || '',
        logradouro: c.endereco?.logradouro || '',
        bairro: c.endereco?.bairro || '',
        estado: c.endereco?.estado || '',
        localidade: c.endereco?.localidade || '',
        complemento: c.endereco?.complemento || ''
      });

      // Voltar para o primeiro passo ao editar
      setTimeout(() => {
        if (this.stepper) {
          this.stepper.selectedIndex = 0;
        }
      });
    }
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

    const cliente = {
    ...this.personalForm.value,
    endereco: this.addressForm.value,
    id: this.clienteEditavel?.id
  };

  this.submitCliente.emit(cliente);
  this.personalForm.reset();
  this.addressForm.reset();
  this.clienteEditavel = null;

  if (this.stepper) {
      this.stepper.reset();
    }
}
}

