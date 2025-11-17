import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PresentationService } from '../../services/presentation.service';
import { Presentation } from '../../models/presentation.model';
import { ToastService } from '../../utils/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PageLoaderService } from '../../services/page-loader.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-presentation-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './presentation-edit.component.html',
  styleUrls: ['./presentation-edit.component.scss'],
})
export class PresentationEditComponent implements OnInit {
  @Input() presentationId?: number;

  presentation: Presentation | null = null;
  editForm!: FormGroup;
  isLoading = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private presentationService: PresentationService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private pageLoaderService: PageLoaderService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPresentation();
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      presentation_text: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1200),
        ],
      ],
    });
  }

  private loadPresentation(): void {
    // Si l'ID est passé en props, on l'utilise, sinon on le récupère depuis l'URL
    const id =
      this.presentationId || Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.toast.show('ID de présentation manquant');
      return;
    }

    this.isLoading = true;

    // Enregistrer la promesse de chargement pour le système de chargement global
    const presentationPromise = firstValueFrom(
      this.presentationService.getById(id)
    );
    this.pageLoaderService.registerPageLoad(presentationPromise);

    presentationPromise.then(
      (presentation) => {
        this.presentation = presentation;
        this.editForm.patchValue({
          presentation_text: presentation.presentation_text,
        });
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement de la présentation:', error);
        this.toast.show('Erreur lors du chargement de la présentation');
        this.isLoading = false;
      }
    );
  }

  onSubmit(): void {
    if (this.editForm.invalid || !this.presentation) {
      return;
    }

    // Vérifier l'authentification
    if (!this.authService.isAuthenticated()) {
      this.toast.show('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    // Vérifier le token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.toast.show("Token d'accès manquant. Veuillez vous reconnecter.");
      return;
    }

    this.isSaving = true;
    const updatedPresentation: Partial<Presentation> = {
      presentation_text: this.editForm.value.presentation_text,
    };

    this.presentationService
      .update(this.presentation.presentation_id, updatedPresentation)
      .subscribe({
        next: (updatedPresentation) => {
          this.presentation = updatedPresentation;
          this.toast.show('Présentation mise à jour avec succès');
          this.isSaving = false;
        },
        error: (error) => {
          let errorMessage = 'Impossible de sauvegarder la présentation.';
          if (error.status === 401) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          } else if (error.status === 403) {
            errorMessage = 'Accès interdit.';
          } else if (error.status === 404) {
            errorMessage = 'Présentation non trouvée.';
          }
          this.toast.show(errorMessage);
          this.isSaving = false;
        },
      });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'Ce champ est requis';
      }
      if (field.errors['minlength']) {
        return `Ce champ doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      }
      if (field.errors['maxlength']) {
        return `Ce champ ne doit pas dépasser ${field.errors['maxlength'].requiredLength} caractères`;
      }
    }
    return '';
  }

  getCharacterCount(): number {
    const value = this.editForm.get('presentation_text')?.value || '';
    return value.length;
  }

  isOverLimit(): boolean {
    return this.getCharacterCount() > 1200;
  }

  getReturnRoute(): string {
    const presentationId =
      this.presentation?.presentation_id ||
      Number(this.route.snapshot.paramMap.get('id'));

    // Déterminer la page de retour selon l'ID de la présentation
    switch (presentationId) {
      case 1:
        return '/dashboard';
      case 2:
        return '/history';
      case 3:
        return '/job-offers';
      default:
        return '/dashboard'; // Route par défaut
    }
  }

  getReturnButtonText(): string {
    const presentationId =
      this.presentation?.presentation_id ||
      Number(this.route.snapshot.paramMap.get('id'));

    // Déterminer le texte du bouton selon l'ID de la présentation
    switch (presentationId) {
      case 1:
        return 'Retour au tableau de bord';
      case 2:
        return "Retour à l'historique";
      case 3:
        return "Retour aux offres d'emploi";
      default:
        return 'Retour au tableau de bord';
    }
  }

  goBack(): void {
    this.router.navigate([this.getReturnRoute()]);
  }
}
