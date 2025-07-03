// models/register.model.ts
export interface RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phoneNumber?: string | null;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
  profileImage?: string | null;
}

export interface RegisterFormData extends RegisterUserDTO {
  confirmPassword: string;
  acceptTerms: boolean;
  enableTwoFactor: boolean;
}