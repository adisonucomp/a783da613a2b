import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthSession } from '../../services/core/auth-session/auth-session';

export const authErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const platformId = inject(PLATFORM_ID);
  const authSession = inject(AuthSession);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = request.url.includes('/api/auth/login');
      if (isPlatformBrowser(platformId) && error.status === 401 && !isLoginRequest) {
        authSession.clear();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
