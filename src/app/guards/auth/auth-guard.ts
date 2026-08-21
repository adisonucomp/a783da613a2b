import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from '../../services/core/auth-session/auth-session';

export const authGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const authSession = inject(AuthSession);

  return authSession.isAuthenticated() || inject(Router).createUrlTree(['/login']);
};
