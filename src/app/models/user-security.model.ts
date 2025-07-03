// user-security.model.ts - Nuevos modelos específicos para seguridad

export interface UserSecurityEntity {
  id?: number;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  roles?: any[];
  profileImage?: string;
  
  // Campos de seguridad
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  lastLoginIp?: string;
  accountLocked?: boolean;
  accountLockedUntil?: string;
  passwordChangedAt?: string;
  forcePasswordChange?: boolean;
  failedLoginAttempts?: number;
  needsPasswordChange?: boolean;
  activeSessions?: number;
}

export interface SecurityAuditEntity {
  id: number;
  user?: any;
  userId?: number;
  eventType: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  severity?: string;
  additionalData?: string;
}

export interface UserSecurityOverview {
  userId: number;
  email: string;
  isActive: boolean;
  accountLocked: boolean;
  accountLockedUntil?: string;
  failedLoginAttempts: number;
  lastLogin?: string;
  lastLoginIp?: string;
  passwordChangedAt?: string;
  needsPasswordChange: boolean;
  twoFactorEnabled: boolean;
  activeSessions: number;
  recentAudits?: SecurityAuditEntity[];
}

export interface SecurityStatistics {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  twoFactorEnabledUsers: number;
  onlineUsers: number;
  securityEvents24h?: Record<string, number>;
}

export interface UserSecurityFilters {
  search?: string;
  page?: number;
  size?: number;
  roleFilter?: string;
  statusFilter?: string;
  activityFilter?: string;
}

export interface UserSecurityResponse {
  users: UserSecurityEntity[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface AuditSearchParams {
  userId?: number;
  eventType?: string;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
  limit?: number;
}

export interface UserAuditResponse {
  userId: number;
  email: string;
  audits: SecurityAuditEntity[];
  totalAudits: number;
}