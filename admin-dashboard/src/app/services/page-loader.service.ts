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
    console.log(
      "[PageLoaderService] 📝 Enregistrement d'une nouvelle promesse, total avant:",
      this.loadingPromises.length
    );
    this.loadingPromises.push(promise);
    console.log(
      '[PageLoaderService] ✅ Promesse enregistrée, total maintenant:',
      this.loadingPromises.length
    );
    this.startChecking();
  }

  getLoadingState(): Observable<boolean> {
    return this.loadingState$.asObservable();
  }

  private startChecking(): void {
    if (this.isChecking) {
      console.log(
        '[PageLoaderService] ⚠️ startChecking() déjà en cours, ignoré'
      );
      return;
    }

    console.log(
      '[PageLoaderService] 🚀 startChecking() démarré, nombre de promesses:',
      this.loadingPromises.length
    );
    this.isChecking = true;

    // Attendre que le nombre de promesses se stabilise
    let initialCheckCount = 0;
    const waitForStable = setInterval(() => {
      initialCheckCount++;
      console.log(
        '[PageLoaderService] ⏳ Attente stabilisation, check:',
        initialCheckCount,
        'promesses:',
        this.loadingPromises.length
      );

      if (initialCheckCount > 10) {
        // 3 secondes
        console.log(
          '[PageLoaderService] ⏰ Timeout atteint (10 checks), démarrage de checkAllLoaded()'
        );
        clearInterval(waitForStable);
        this.checkAllLoaded();
      } else if (initialCheckCount > 5) {
        const stableCheck = this.loadingPromises.length;
        console.log(
          '[PageLoaderService] 🔍 Vérification de stabilité, nombre actuel:',
          stableCheck
        );
        setTimeout(() => {
          if (this.loadingPromises.length === stableCheck && stableCheck > 0) {
            console.log(
              '[PageLoaderService] ✅ Nombre stable détecté, démarrage de checkAllLoaded()'
            );
            clearInterval(waitForStable);
            this.checkAllLoaded();
          } else {
            console.log(
              '[PageLoaderService] ⚠️ Nombre changé pendant la vérification:',
              stableCheck,
              '->',
              this.loadingPromises.length
            );
          }
        }, 500);
      }
    }, 300);
  }

  private async checkAllLoaded(): Promise<void> {
    console.log(
      '[PageLoaderService] 🔍 checkAllLoaded() appelé, nombre de promesses:',
      this.loadingPromises.length
    );

    if (this.loadingPromises.length === 0) {
      console.log(
        '[PageLoaderService] ⚠️ Aucune promesse, masquage du loader dans 500ms'
      );
      setTimeout(() => {
        console.log(
          '[PageLoaderService] ✅ Masquage du loader (aucune promesse)'
        );
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
        console.log(
          '[PageLoaderService] 📊 Nombre de promesses changé:',
          lastPromiseCount,
          '->',
          promises.length
        );
        lastPromiseCount = promises.length;
        stableCount = 0;
        consecutiveStableChecks = 0;
        return;
      }

      stableCount++;

      if (stableCount < 5) {
        return;
      }

      if (promises.length > 0) {
        console.log(
          '[PageLoaderService] 🔄 Vérification de',
          promises.length,
          'promesse(s)...'
        );
        const allSettled = await Promise.allSettled(promises);
        const fulfilled = allSettled.filter(
          (r) => r.status === 'fulfilled'
        ).length;
        const rejected = allSettled.filter(
          (r) => r.status === 'rejected'
        ).length;

        console.log('[PageLoaderService] 📊 État des promesses:', {
          fulfilled,
          rejected,
          total: allSettled.length,
        });

        // Promise.allSettled attend toujours que toutes les promesses soient résolues
        // donc toutes sont forcément fulfilled ou rejected, jamais pending
        const allResolved = true; // Toujours vrai pour Promise.allSettled

        consecutiveStableChecks++;
        console.log(
          '[PageLoaderService] ✅ Toutes les promesses résolues (fulfilled ou rejected), vérifications stables consécutives:',
          consecutiveStableChecks,
          'sur 3 requises'
        );

        if (consecutiveStableChecks >= 3) {
          console.log(
            '[PageLoaderService] ⏳ Attente de 500ms avant de masquer le loader...'
          );
          await new Promise((resolve) => setTimeout(resolve, 500));

          if (this.loadingPromises.length === promises.length) {
            console.log(
              '[PageLoaderService] 🎉 Masquage du loader ! Nombre de promesses final:',
              promises.length
            );
            console.log(
              '[PageLoaderService] 📊 Détails des promesses résolues:',
              {
                fulfilled: fulfilled,
                rejected: rejected,
                total: allSettled.length,
              }
            );
            clearInterval(checkInterval);
            this.loadingState$.next(false);
            this.isChecking = false;
          } else {
            console.log(
              '[PageLoaderService] ⚠️ Nouvelles promesses ajoutées, reprise des vérifications',
              promises.length,
              '->',
              this.loadingPromises.length
            );
            lastPromiseCount = this.loadingPromises.length;
            stableCount = 0;
            consecutiveStableChecks = 0;
          }
        } else {
          console.log(
            '[PageLoaderService] ⏳ Pas encore assez de vérifications stables, continuons...'
          );
        }
      }
    }, 300);

    // Timeout de sécurité
    setTimeout(() => {
      console.log(
        '[PageLoaderService] ⏰ Timeout de sécurité atteint (15s), masquage forcé du loader'
      );
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
