import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { map, take } from 'rxjs/operators';

export const adminAuthGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/admin/login']);
  }

  if (auth.admin()) {
    return true;
  }

  return auth.loadSession().pipe(
    take(1),
    map((admin) => (admin ? true : router.createUrlTree(['/admin/login'])))
  );
};

export const adminGuestGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return router.createUrlTree(['/admin']);
  }
  return true;
};
