import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Pages d'authentification qui ne nécessitent pas d'être connecté
    const publicAuthPages = ['/login', '/forgot-password', '/reset-password'];
    const currentPath = route.routeConfig?.path || '';
    
    // Si c'est une page d'authentification publique, permettre l'accès
    if (publicAuthPages.some(page => currentPath === page || route.url.some(segment => segment.path === page.replace('/', '')))) {
      return true;
    }
    
    // Pour toutes les autres pages, vérifier l'authentification
    if (this.authService.isAuthenticated()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
