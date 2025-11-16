import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageLoaderService } from '../../services/page-loader.service';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss']
})
export class PageLoaderComponent implements OnInit, OnDestroy {
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private pageLoaderService: PageLoaderService
  ) {}

  ngOnInit(): void {
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
          this.pageLoaderService.reset();
          this.isLoading = true;
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          // Le service gère automatiquement le masquage du loader
        }
      });

    // Réinitialiser au chargement initial
    this.pageLoaderService.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

