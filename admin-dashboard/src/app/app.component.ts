import { Component, ViewChild } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './pages/header/header.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './utils/toast/toast.component';
import { ToastService } from './utils/toast/toast.service';
import { AuthService } from './services/auth.service';
import { PageLoaderComponent } from './components/page-loader/page-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    CommonModule,
    ToastComponent,
    PageLoaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild(ToastComponent) toast!: ToastComponent;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  shouldShowHeader(): boolean {
    // Pages d'authentification où le header ne doit pas s'afficher
    const authPages = ['/login', '/forgot-password', '/reset-password'];
    const currentPath = this.router.url.split('?')[0]; // Enlever les query parameters
    const isAuthPage = authPages.some((page) => currentPath === page);

    return !isAuthPage && this.authService.isAuthenticated();
  }

  shouldShowContent(): boolean {
    // Pages d'authentification qui peuvent être affichées sans être connecté
    const publicAuthPages = ['/login', '/forgot-password', '/reset-password'];
    const currentPath = this.router.url.split('?')[0]; // Enlever les query parameters
    const isPublicAuthPage = publicAuthPages.some(
      (page) => currentPath === page
    );

    return isPublicAuthPage || this.authService.isAuthenticated();
  }

  ngAfterViewInit(): void {
    this.toastService.register(this.toast);
  }
}
