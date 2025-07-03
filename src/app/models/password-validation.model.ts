// models/password-validation.model.ts
export interface PasswordStrength {
  score: number;
  strengthText: string;
  strengthLevel: string;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  hasMinLength: boolean;
  hasMaxLength: boolean;
  suggestions: string[];
  estimatedCrackTime: string;
  meetsAllRequirements: boolean;
  isValid: boolean;
  errors?: string[];
}