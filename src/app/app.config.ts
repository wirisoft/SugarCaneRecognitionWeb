import { ApplicationConfig } from '@angular/core';
import { provideRouter, Router, Routes } from '@angular/router';
import { httpInterceptor } from './interceptors/http.interceptor';
import { routes } from './app.routes';
import { HttpClientModule, provideHttpClient, withInterceptors } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpInterceptor])),
  ],
};
