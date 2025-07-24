import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PresentationService } from '../../services/presentation.service';
import { Presentation } from '../../models/presentation.model';
import { ToastService } from '../../utils/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-presentation-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPresentation();
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      presentation_text: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadPresentation(): void {
    // Si l'ID est passé en props, on l'utilise, sinon on le récupère depuis l'URL
    const id = this.presentationId || Number(this.route.snapshot.paramMap.get('id'));
    
    if (!id) {
      this.toast.show('ID de présentation manquant');
      return;
    }

    this.isLoading = true;
    this.presentationService.getById(id).subscribe({
      next: (presentation) => {
        this.presentation = presentation;
        this.editForm.patchValue({
          presentation_text: presentation.presentation_text
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la présentation:', error);
        this.toast.show('Erreur lors du chargement de la présentation');
        this.isLoading = false;
      }
    });
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
      this.toast.show('Token d\'accès manquant. Veuillez vous reconnecter.');
      return;
    }

    this.isSaving = true;
    const updatedPresentation: Partial<Presentation> = {
      presentation_text: this.editForm.value.presentation_text
    };

    this.presentationService.update(this.presentation.presentation_id, updatedPresentation).subscribe({
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
      }
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
    }
    return '';
  }
} 