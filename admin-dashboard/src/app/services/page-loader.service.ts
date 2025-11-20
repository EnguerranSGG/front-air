import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageLoaderService {
  private loadingPromises: Promise<any>[] = [];
  private loadingState$ = new Subject<boolean>();
  private isChecking = false;

  constructor() {
    // Initialiser window.pageLoadPromises pour compatibilité
    if (typeof window !== 'undefined') {
      (window as any).pageLoadPromises = this.loadingPromises;
      (window as any).registerPageLoad = (promise: Promise<any>) => {
        this.registerPageLoad(promise);
      };
    }

    // Démarrer la vérification après un court délai pour laisser le temps aux composants de s'initialiser
    setTimeout(() => {
      if (this.loadingPromises.length > 0) {
        this.startChecking();
      } else {
        // Si aucune promesse n'est enregistrée après 2 secondes, masquer le loader
        setTimeout(() => {
          if (this.loadingPromises.length === 0) {
            this.loadingState$.next(false);
          }
        }, 2000);
      }
    }, 500);
  }

  registerPageLoad(promise: Promise<any>): void {
    this.loadingPromises.push(promise);
    this.startChecking();
  }

  getLoadingState(): Observable<boolean> {
    return this.loadingState$.asObservable();
  }

  private startChecking(): void {
    if (this.isChecking) {
      return;
    }

    this.isChecking = true;

    // Attendre que le nombre de promesses se stabilise (réduire les délais)
    let initialCheckCount = 0;
    const waitForStable = setInterval(() => {
      initialCheckCount++;

      // Réduire le timeout (de 10 à 5 checks = 1.5s au lieu de 3s)
      if (initialCheckCount > 5) {
        clearInterval(waitForStable);
        this.checkAllLoaded();
      } else if (initialCheckCount > 2) {
        // Réduire le délai (de 5 à 2 checks)
        const stableCheck = this.loadingPromises.length;
        setTimeout(() => {
          if (this.loadingPromises.length === stableCheck && stableCheck > 0) {
            clearInterval(waitForStable);
            this.checkAllLoaded();
          }
        }, 200); // Réduire de 500ms à 200ms
      }
    }, 300);
  }

  private async checkAllLoaded(): Promise<void> {
    if (this.loadingPromises.length === 0) {
      setTimeout(() => {
        this.loadingState$.next(false);
        this.isChecking = false;
      }, 500);
      return;
    }

    let lastPromiseCount = this.loadingPromises.length;
    let stableCount = 0;
    let consecutiveStableChecks = 0;

    const checkInterval = setInterval(async () => {
      const promises = [...this.loadingPromises];

      if (promises.length !== lastPromiseCount) {
        lastPromiseCount = promises.length;
        stableCount = 0;
        consecutiveStableChecks = 0;
        return;
      }

      stableCount++;

      // Réduire le nombre de vérifications stables nécessaires (de 5 à 2)
      if (stableCount < 2) {
        return;
      }

      if (promises.length > 0) {
        const allSettled = await Promise.allSettled(promises);

        // Promise.allSettled attend toujours que toutes les promesses soient résolues
        // donc toutes sont forcément fulfilled ou rejected, jamais pending
        const allResolved = true; // Toujours vrai pour Promise.allSettled

        consecutiveStableChecks++;

        // Réduire le nombre de vérifications stables consécutives nécessaires (de 3 à 1)
        if (consecutiveStableChecks >= 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));

          if (this.loadingPromises.length === promises.length) {
            clearInterval(checkInterval);
            this.loadingState$.next(false);
            this.isChecking = false;
          } else {
            lastPromiseCount = this.loadingPromises.length;
            stableCount = 0;
            consecutiveStableChecks = 0;
          }
        }
      }
    }, 300);

    // Timeout de sécurité
    setTimeout(() => {
      clearInterval(checkInterval);
      this.loadingState$.next(false);
      this.isChecking = false;
    }, 15000);
  }

  reset(): void {
    this.loadingPromises = [];
    if (typeof window !== 'undefined') {
      (window as any).pageLoadPromises = this.loadingPromises;
    }
    this.loadingState$.next(true);
    this.isChecking = false;
  }
}
