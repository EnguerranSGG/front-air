import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageLoaderService } from '../../services/page-loader.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss']
})
export class PageLoaderComponent implements OnInit, OnDestroy {
  isLoading = true;
  hasHeader = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Vérifier si le header doit être affiché
    this.updateHeaderState();

    // Écouter l'état de chargement du service
    this.pageLoaderService.getLoadingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      });

    // Réinitialiser le loader à chaque navigation
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.updateHeaderState();
          this.pageLoaderService.reset();
          this.isLoading = true;
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.updateHeaderState();
          // Le service gère automatiquement le masquage du loader
        }
      });

    // Réinitialiser au chargement initial
    this.pageLoaderService.reset();
  }

  private updateHeaderState(): void {
    const authPages = ['/login', '/forgot-password', '/reset-password'];
    const currentPath = this.router.url.split('?')[0];
    const isAuthPage = authPages.some(page => currentPath === page);
    this.hasHeader = !isAuthPage && this.authService.isAuthenticated();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

