// src/app/models/two-factor.model.ts
export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  message: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  lastUsed?: string;
  createdAt?: string;
  enabledAt?: string;
  backupCodesRemaining?: number;
}

export interface TwoFactorVerifyRequest {
  code: string;
  tempToken?: string;
  email?: string;
}

export interface TwoFactorEnableRequest {
  code: string;
}

export interface TwoFactorDisableRequest {
  code: string;
}

export interface BackupCodeRegenerateRequest {
  code: string;
}

export interface BackupCodeRegenerateResponse {
  backupCodes: string[];
  message: string;
}