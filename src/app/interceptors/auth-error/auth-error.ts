import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionTimer } from '../../services/core/session-timer/session-timer';

export const authErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const platformId = inject(PLATFORM_ID);
  const sessionTimer = inject(SessionTimer);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest = request.url.includes('/api/auth/login') || request.url.includes('/api/auth/refresh');
      if (isPlatformBrowser(platformId) && error.status === 401 && !isAuthRequest) {
        sessionTimer.logout();
      }

      return throwError(() => error);
    }),
  );
};
