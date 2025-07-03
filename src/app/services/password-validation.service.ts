// services/password-validation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';
import { PasswordStrength } from '../models/password-validation.model';

@Injectable({
  providedIn: 'root'
})
export class PasswordValidationService {
  private apiUrl = 'http://localhost:8080/password-validation';

  constructor(private http: HttpClient) {}

  // Validación en el servidor
  validatePassword(password: string): Observable<PasswordStrength> {
    return this.http.post<PasswordStrength>(`${this.apiUrl}/validate`, { password })
      .pipe(
        debounceTime(300),
        catchError(() => of(this.getDefaultStrength()))
      );
  }

  // Verificar fortaleza de contraseña en el servidor
  checkPasswordStrength(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-strength`, { password })
      .pipe(
        catchError(() => of({ meets_requirements: false, is_secure: false }))
      );
  }

  // Validación rápida en el cliente para feedback inmediato
  validatePasswordLocally(password: string): PasswordStrength {
    const result: PasswordStrength = {
      score: 0,
      strengthText: 'Muy Débil',
      strengthLevel: 'very-weak',
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumbers: false,
      hasSpecialChars: false,
      hasMinLength: false,
      hasMaxLength: true,
      suggestions: [],
      estimatedCrackTime: 'Instantáneo',
      meetsAllRequirements: false,
      isValid: false,
      errors: []
    };

    if (!password) {
      result.suggestions.push('La contraseña es requerida');
      result.errors?.push('La contraseña es requerida');
      return result;
    }

    // Verificar longitud mínima y máxima
    result.hasMinLength = password.length >= 8;
    result.hasMaxLength = password.length <= 16;
    
    if (!result.hasMinLength) {
      result.suggestions.push('Usa al menos 8 caracteres');
      result.errors?.push('La contraseña debe tener al menos 8 caracteres');
    } else {
      result.score += 15;
    }
    
    if (!result.hasMaxLength) {
      result.suggestions.push('La contraseña no debe exceder 16 caracteres');
      result.errors?.push('La contraseña no debe exceder 16 caracteres');
      result.score = Math.max(0, result.score - 20);
    }

    // Verificar mayúsculas
    result.hasUpperCase = /[A-Z]/.test(password);
    if (!result.hasUpperCase) {
      result.suggestions.push('Agrega al menos una letra mayúscula');
      result.errors?.push('Debe incluir al menos una letra mayúscula');
    } else {
      result.score += 20;
    }

    // Verificar minúsculas
    result.hasLowerCase = /[a-z]/.test(password);
    if (!result.hasLowerCase) {
      result.suggestions.push('Agrega al menos una letra minúscula');
      result.errors?.push('Debe incluir al menos una letra minúscula');
    } else {
      result.score += 20;
    }

    // Verificar números
    result.hasNumbers = /\d/.test(password);
    if (!result.hasNumbers) {
      result.suggestions.push('Agrega al menos un número');
      result.errors?.push('Debe incluir al menos un número');
    } else {
      result.score += 20;
    }

    // Verificar caracteres especiales - OBLIGATORIO
    result.hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!result.hasSpecialChars) {
      result.suggestions.push('Agrega al menos un carácter especial (!@#$%^&*...)');
      result.errors?.push('Debe incluir al menos un carácter especial (!@#$%^&*...)');
    } else {
      result.score += 25;
    }

    // Verificar si cumple TODOS los requisitos
    result.meetsAllRequirements = result.hasMinLength && result.hasMaxLength &&
                                 result.hasUpperCase && result.hasLowerCase && 
                                 result.hasNumbers && result.hasSpecialChars;
    
    result.isValid = result.meetsAllRequirements;

    // Ajustar el nivel de fortaleza
    if (!result.meetsAllRequirements) {
      // Si no cumple todos los requisitos, máximo puede ser "Débil"
      result.score = Math.min(result.score, 39);
    }

    // Determinar nivel de fortaleza
    if (result.score >= 80 && result.meetsAllRequirements) {
      result.strengthText = 'Muy Fuerte';
      result.strengthLevel = 'very-strong';
      result.estimatedCrackTime = 'Siglos';
    } else if (result.score >= 60 && result.meetsAllRequirements) {
      result.strengthText = 'Fuerte';
      result.strengthLevel = 'strong';
      result.estimatedCrackTime = 'Años';
    } else if (result.score >= 40) {
      result.strengthText = 'Media';
      result.strengthLevel = 'medium';
      result.estimatedCrackTime = 'Meses';
    } else if (result.score >= 20) {
      result.strengthText = 'Débil';
      result.strengthLevel = 'weak';
      result.estimatedCrackTime = 'Días';
    }

    // Limpiar arrays vacíos
    if (result.errors?.length === 0) {
      delete result.errors;
    }

    return result;
  }

  // Verificar si la contraseña cumple con TODOS los requisitos obligatorios
  meetsRequirements(strength: PasswordStrength): boolean {
    return strength.hasMinLength && 
           strength.hasMaxLength &&
           strength.hasUpperCase && 
           strength.hasLowerCase && 
           strength.hasNumbers && 
           strength.hasSpecialChars;
  }

  // Generar una contraseña segura aleatoria
  generateSecurePassword(): string {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Asegurar al menos uno de cada tipo
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Completar hasta 12 caracteres con caracteres aleatorios
    const allChars = upperCase + lowerCase + numbers + specialChars;
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar la contraseña
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private getDefaultStrength(): PasswordStrength {
    return {
      score: 0,
      strengthText: 'Error',
      strengthLevel: 'error',
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumbers: false,
      hasSpecialChars: false,
      hasMinLength: false,
      hasMaxLength: true,
      suggestions: ['Error al validar la contraseña'],
      estimatedCrackTime: 'Desconocido',
      meetsAllRequirements: false,
      isValid: false
    };
  }
}