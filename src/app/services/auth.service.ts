// src/app/services/auth.service.ts (CORREGIDO COMPLETAMENTE)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserEntity } from '../models/user.entity';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { LoginResponse, RegisterResponse } from '../models/auth-response.model';
import { RegisterUserDTO } from '../models/register.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private userSubject = new BehaviorSubject<UserEntity | null>(null);
  private requires2FASubject = new BehaviorSubject<boolean>(false);
  
  user$ = this.userSubject.asObservable();
  requires2FA$ = this.requires2FASubject.asObservable();

  // Datos temporales para el flujo de 2FA
  private tempAuthData: {
    email?: string;
    tempToken?: string;
    requiresPasswordChange?: boolean;
  } = {};

  constructor(private http: HttpClient, private router: Router) {
    // Cargar usuario desde localStorage al inicializar
    this.loadUserFromStorage();
  }

  // ✅ CORREGIDO: Método para cargar usuario desde localStorage
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userSubject.next(user);
        console.log('👤 Usuario cargado desde localStorage:', user.email);
      } catch (error) {
        console.error('❌ Error al cargar usuario desde localStorage:', error);
        localStorage.removeItem('usuario');
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    console.log('🔐 Iniciando login para:', email);
    
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(response => {
        console.log('🔐 Respuesta completa de login:', response);
        
        if (response.requires2FA) {
          console.log('🔒 Login requiere 2FA');
          // Usuario tiene 2FA habilitado, necesita verificación
          this.requires2FASubject.next(true);
          this.tempAuthData = {
            email: response.email || email,
            tempToken: response.tempToken,
            requiresPasswordChange: response.needsPasswordChange
          };
          
          // Guardar datos temporales en sessionStorage para persistencia
          const emailToStore = this.tempAuthData.email || email;
          const tokenToStore = this.tempAuthData.tempToken || '';
          
          sessionStorage.setItem('tempAuthEmail', emailToStore);
          sessionStorage.setItem('tempAuthToken', tokenToStore);
          
          console.log('💾 Datos temporales 2FA guardados:', {
            email: emailToStore,
            hasToken: !!tokenToStore
          });
          
          if (this.tempAuthData.requiresPasswordChange) {
            sessionStorage.setItem('needsPasswordChange', 'true');
          }
        } else if (response.jwt || response.sessionToken) {
          console.log('✅ Login exitoso sin 2FA');
          // Login exitoso sin 2FA
          this.handleSuccessfulLogin(response);
        } else {
          console.warn('⚠️ Respuesta de login sin JWT ni 2FA:', response);
        }
      }),
      catchError(error => {
        console.error('❌ Error en login:', error);
        throw error;
      })
    );
  }

  verify2FALogin(code: string): Observable<LoginResponse> {
    const tempToken = this.tempAuthData.tempToken || sessionStorage.getItem('tempAuthToken') || '';
    const email = this.tempAuthData.email || sessionStorage.getItem('tempAuthEmail') || '';
    
    console.log('🔐 Verificando 2FA:', {
      email: email,
      hasToken: !!tempToken,
      hasCode: !!code
    });
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/verify-2fa`, {
      tempToken,
      code,
      email
    }).pipe(
      tap(response => {
        console.log('🔐 Respuesta de verificación 2FA:', response);
        
        if (response.jwt || response.sessionToken) {
          console.log('✅ Verificación 2FA exitosa');
          this.handleSuccessfulLogin(response);
          this.clearTempAuthData();
          this.requires2FASubject.next(false);
        } else {
          console.warn('⚠️ Verificación 2FA sin JWT en respuesta:', response);
        }
      }),
      catchError(error => {
        console.error('❌ Error en verificación 2FA:', error);
        throw error;
      })
    );
  }

  private handleSuccessfulLogin(response: LoginResponse): void {
    console.log('✅ Procesando login exitoso:', response);
    
    // Guardar token
    if (response.jwt) {
      localStorage.setItem('token', response.jwt);
      console.log('🔑 Token JWT guardado');
    } else if (response.sessionToken) {
      localStorage.setItem('sessionToken', response.sessionToken);
      console.log('🔑 Session Token guardado');
    }
    
    // ✅ MEJORADO: Guardar usuario con validación más robusta
    if (response.user) {
      console.log('👤 Usuario recibido en respuesta:', response.user);
      this.setUser(response.user);
      console.log('👤 Usuario guardado exitosamente:', response.user.email);
    } else {
      console.warn('⚠️ PROBLEMA: No se recibió información del usuario en la respuesta de login');
      console.warn('⚠️ Respuesta completa:', JSON.stringify(response, null, 2));
      
      // ✅ MEJORADO: Intentar obtener el usuario usando el token recién guardado
      const token = response.jwt || response.sessionToken;
      if (token) {
        console.log('🔄 Intentando obtener usuario usando /users/profile...');
        this.refreshUser().subscribe({
          next: (userResponse) => {
            console.log('✅ Usuario obtenido desde /users/profile:', userResponse);
            if (userResponse.user) {
              console.log('✅ Usuario establecido desde profile:', userResponse.user.email);
              this.setUser(userResponse.user);
            }
          },
          error: (err) => {
            console.error('❌ Error obteniendo usuario desde /users/profile:', err);
            // Como último recurso, crear un usuario básico usando la información disponible
            if (this.tempAuthData.email || sessionStorage.getItem('tempAuthEmail')) {
              const basicUser: UserEntity = {
                email: this.tempAuthData.email || sessionStorage.getItem('tempAuthEmail') || '',
                firstName: 'Usuario',
                lastName: 'Anónimo',
                twoFactorEnabled: response.twoFactorEnabled || false
              };
              console.warn('⚠️ Creando usuario básico como fallback:', basicUser);
              this.setUser(basicUser);
            }
          }
        });
      }
    }
    
    // Guardar expiración de sesión
    if (response.sessionExpires) {
      localStorage.setItem('sessionExpires', response.sessionExpires);
    }
    
    // Verificar si necesita cambio de contraseña
    const needsPasswordChange = this.tempAuthData.requiresPasswordChange || 
                               sessionStorage.getItem('needsPasswordChange') === 'true' ||
                               response.needsPasswordChange;
    
    // Verificar si debe habilitar 2FA después del registro
    const enableTwoFactorAfterLogin = sessionStorage.getItem('enableTwoFactorAfterLogin');
    
    // ✅ MEJORADO: Navegación con mejor lógica
    setTimeout(() => {
      if (needsPasswordChange) {
        sessionStorage.removeItem('needsPasswordChange');
        console.log('🔄 Redirigiendo a cambio de contraseña');
        this.router.navigate(['/change-password']);
      } else if (enableTwoFactorAfterLogin === 'true') {
        sessionStorage.removeItem('enableTwoFactorAfterLogin');
        console.log('🔄 Redirigiendo a configuración 2FA');
        this.router.navigate(['/dashboard/security-settings'], {
          queryParams: { setup2fa: 'true' }
        });
      } else {
        console.log('🔄 Redirigiendo al dashboard');
        this.router.navigate(['/dashboard/dashboard-home'], {
          queryParams: { loginSuccess: 'true' }
        });
      }
    }, 100); // Pequeño delay para asegurar que los datos se guarden
  }

  // ✅ CORREGIDO: Método de registro con tipado correcto
  register(user: RegisterUserDTO): Observable<RegisterResponse> {
    console.log('📝 Enviando datos de registro al backend:', { ...user, password: '***' });
    
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, user).pipe(
      tap(response => {
        console.log('✅ Respuesta de registro:', response);
        
        // ✅ MEJORADO: Verificar que el registro fue exitoso antes del auto-login
        if (response && (response.numOfErrors === 0 || !response.numOfErrors)) {
          console.log('🔄 Registro exitoso, iniciando login automático...');
          
          // Delay más corto y mejor manejo de errores
          setTimeout(() => {
            this.login(user.email, user.password).subscribe({
              next: (loginResponse) => {
                console.log('✅ Login automático exitoso después del registro');
              },
              error: (loginError) => {
                console.error('❌ Error en login automático:', loginError);
                // Mejor mensaje de error
                alert('Registro exitoso. Por favor, inicia sesión manualmente.');
                this.router.navigate(['/landing/login-cana']);
              }
            });
          }, 500); // Delay reducido
        } else {
          console.warn('⚠️ Registro con errores, no se ejecutará login automático:', response);
        }
      }),
      catchError(error => {
        console.error('❌ Error en registro:', error);
        throw error;
      })
    );
  }

  registerAdmin(user: RegisterUserDTO): Observable<RegisterResponse> {
    console.log('📝 Registrando administrador:', { ...user, password: '***' });
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register-admin`, user);
  }

  setUser(user: UserEntity): void {
    console.log('👤 Estableciendo usuario:', user.email);
    this.userSubject.next(user);
    localStorage.setItem('usuario', JSON.stringify(user));
    
    // ✅ MEJORADO: Verificar que se guardó correctamente
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('✅ Usuario verificado en localStorage:', parsedUser.email);
      } catch (e) {
        console.error('❌ Error verificando usuario guardado:', e);
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token') || localStorage.getItem('sessionToken');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    
    console.log('🔍 Verificando autenticación - Token:', !!token, 'Usuario:', !!user);
    
    if (!token || !user) {
      console.log('❌ No hay token o usuario');
      return false;
    }
    
    const sessionExpires = localStorage.getItem('sessionExpires');
    if (sessionExpires) {
      const expirationDate = new Date(sessionExpires);
      if (expirationDate < new Date()) {
        console.log('❌ Sesión expirada');
        this.logout();
        return false;
      }
    }
    
    console.log('✅ Usuario autenticado');
    return true;
  }

  logout(): Observable<any> {
    const token = this.getToken();
    
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }).pipe(
      tap(() => {
        this.clearLocalData();
        this.router.navigate(['/landing/login-cana']);
      }),
      catchError(error => {
        // Incluso si falla el logout en el servidor, limpiar datos locales
        console.warn('⚠️ Error en logout del servidor, limpiando datos locales:', error);
        this.clearLocalData();
        this.router.navigate(['/landing/login-cana']);
        throw error;
      })
    );
  }

  private clearLocalData(): void {
    console.log('🧹 Limpiando datos de autenticación');
    localStorage.removeItem('token');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('usuario');
    localStorage.removeItem('sessionExpires');
    this.clearTempAuthData();
    this.userSubject.next(null);
    this.requires2FASubject.next(false);
    
    // Notificar limpieza de cache
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  private clearTempAuthData(): void {
    this.tempAuthData = {};
    sessionStorage.removeItem('tempAuthToken');
    sessionStorage.removeItem('tempAuthEmail');
    sessionStorage.removeItem('needsPasswordChange');
  }

  getUser(): UserEntity | null {
    const user = this.userSubject.value;
    console.log('👤 Obteniendo usuario actual:', user?.email || 'No hay usuario');
    return user;
  }

  // ✅ MEJORADO: Método para refrescar información del usuario
  refreshUser(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    console.log('🔄 Refrescando información del usuario...');
    return this.http.get<any>('http://localhost:8080/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(response => {
        console.log('🔄 Respuesta del servidor al refrescar usuario:', response);
        
        if (response.user) {
          console.log('🔄 Usuario actualizado desde servidor:', response.user.email);
          this.setUser(response.user);
        } else if (response.email) {
          // Si la respuesta no tiene .user pero tiene datos del usuario directamente
          console.log('🔄 Usuario actualizado desde respuesta directa:', response.email);
          this.setUser(response);
        } else {
          console.warn('⚠️ No se recibió información del usuario en la respuesta');
        }
      }),
      catchError(error => {
        console.error('❌ Error al refrescar usuario:', error);
        throw error;
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const token = this.getToken();
    return this.http.post('http://localhost:8080/users/change-password', {
      currentPassword,
      newPassword
    }, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  }

  checkUserExists(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-user/${email}`);
  }

  // Métodos específicos para el flujo de 2FA
  get isWaitingFor2FA(): boolean {
    return this.requires2FASubject.value;
  }

  get tempAuthEmail(): string | null {
    return this.tempAuthData.email || sessionStorage.getItem('tempAuthEmail');
  }

  // Cancelar proceso de 2FA
  cancel2FAProcess(): void {
    this.clearTempAuthData();
    this.requires2FASubject.next(false);
    this.router.navigate(['/landing/login-cana']);
  }

  // Verificar si el usuario tiene 2FA habilitado
  has2FAEnabled(): boolean {
    const user = this.getUser();
    return user?.twoFactorEnabled === true;
  }

  // Método para configurar la preferencia de habilitar 2FA después del login
  setEnable2FAAfterLogin(enable: boolean): void {
    if (enable) {
      sessionStorage.setItem('enableTwoFactorAfterLogin', 'true');
    } else {
      sessionStorage.removeItem('enableTwoFactorAfterLogin');
    }
  }
}