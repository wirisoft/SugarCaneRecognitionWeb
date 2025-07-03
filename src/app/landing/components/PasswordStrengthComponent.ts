// components/shared/password-strength/password-strength.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordStrength } from '../../models/password-validation.model';
import { PasswordValidationService } from '../../services/password-validation.service';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="password-strength-container" *ngIf="password">
      <!-- Barra de fortaleza -->
      <div class="strength-meter">
        <div class="strength-meter-fill" 
             [ngClass]="'strength-' + strength.strengthLevel"
             [style.width.%]="strength.score">
        </div>
      </div>
      
      <!-- Texto de fortaleza -->
      <div class="strength-text" [ngClass]="'text-' + strength.strengthLevel">
        {{ strength.strengthText }}
        <span class="crack-time" *ngIf="strength.estimatedCrackTime">
          (Tiempo estimado para descifrar: {{ strength.estimatedCrackTime }})
        </span>
      </div>
      
      <!-- Requisitos -->
      <div class="requirements">
        <h4>Requisitos de contraseña:</h4>
        <ul class="requirements-list">
          <li [class.met]="strength.hasMinLength">
            <i class="fas" [ngClass]="strength.hasMinLength ? 'fa-check-circle' : 'fa-times-circle'"></i>
            Al menos 8 caracteres
          </li>
          <li [class.met]="strength.hasUpperCase">
            <i class="fas" [ngClass]="strength.hasUpperCase ? 'fa-check-circle' : 'fa-times-circle'"></i>
            Una letra mayúscula
          </li>
          <li [class.met]="strength.hasLowerCase">
            <i class="fas" [ngClass]="strength.hasLowerCase ? 'fa-check-circle' : 'fa-times-circle'"></i>
            Una letra minúscula
          </li>
          <li [class.met]="strength.hasNumbers">
            <i class="fas" [ngClass]="strength.hasNumbers ? 'fa-check-circle' : 'fa-times-circle'"></i>
            Un número
          </li>
          <li [class.met]="strength.hasSpecialChars">
            <i class="fas" [ngClass]="strength.hasSpecialChars ? 'fa-check-circle' : 'fa-times-circle'"></i>
            Un carácter especial (!#$%^&*)
          </li>
        </ul>
      </div>
      
      <!-- Sugerencias -->
      <div class="suggestions" *ngIf="strength.suggestions.length > 0 && showSuggestions">
        <h4>Sugerencias para mejorar:</h4>
        <ul>
          <li *ngFor="let suggestion of strength.suggestions">
            <i class="fas fa-lightbulb"></i> {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .password-strength-container {
      margin-top: 10px;
    }

    .strength-meter {
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .strength-meter-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .strength-very-weak {
      background-color: #d32f2f;
    }

    .strength-weak {
      background-color: #f57c00;
    }

    .strength-medium {
      background-color: #fbc02d;
    }

    .strength-strong {
      background-color: #689f38;
    }

    .strength-very-strong {
      background-color: #388e3c;
    }

    .strength-text {
      font-weight: 600;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .text-very-weak { color: #d32f2f; }
    .text-weak { color: #f57c00; }
    .text-medium { color: #f9a825; }
    .text-strong { color: #689f38; }
    .text-very-strong { color: #388e3c; }

    .crack-time {
      font-size: 0.9em;
      font-weight: normal;
      opacity: 0.8;
    }

    .requirements {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .requirements h4 {
      margin: 0 0 10px 0;
      font-size: 0.95em;
      color: #333;
    }

    .requirements-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .requirements-list li {
      padding: 5px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      transition: color 0.3s ease;
    }

    .requirements-list li.met {
      color: #388e3c;
    }

    .requirements-list i {
      font-size: 1.1em;
    }

    .requirements-list .fa-check-circle {
      color: #388e3c;
    }

    .requirements-list .fa-times-circle {
      color: #d32f2f;
    }

    .suggestions {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 15px;
    }

    .suggestions h4 {
      margin: 0 0 10px 0;
      font-size: 0.95em;
      color: #856404;
    }

    .suggestions ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .suggestions li {
      padding: 5px 0;
      color: #856404;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .suggestions .fa-lightbulb {
      color: #f39c12;
    }
  `]
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() password: string = '';
  @Input() showSuggestions: boolean = true;
  @Input() validateOnServer: boolean = false;
  
  strength: PasswordStrength;

  constructor(private passwordValidationService: PasswordValidationService) {
    this.strength = this.passwordValidationService.validatePasswordLocally('');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password']) {
      this.validatePassword();
    }
  }

  private validatePassword(): void {
    if (this.validateOnServer && this.password.length >= 8) {
      // Validar en el servidor para obtener información más detallada
      this.passwordValidationService.validatePassword(this.password)
        .subscribe(
          strength => this.strength = strength,
          () => this.strength = this.passwordValidationService.validatePasswordLocally(this.password)
        );
    } else {
      // Validación local para feedback inmediato
      this.strength = this.passwordValidationService.validatePasswordLocally(this.password);
    }
  }

  isValid(): boolean {
    return this.passwordValidationService.meetsRequirements(this.strength);
  }
}