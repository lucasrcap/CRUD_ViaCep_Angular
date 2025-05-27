import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ 
    name: 'telefoneFormatado',
    standalone: true
 })
export class TelefonePipe implements PipeTransform {
  transform(value: string): string {
    // Exemplo simples de máscara
    return value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
}
