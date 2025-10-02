import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { sanitizeFormValue } from '../../utils/sanitize/sanitize';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('ResetPasswordComponent constructor called');
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    console.log('ResetPasswordComponent ngOnInit called');
    
    // Récupérer le token depuis l'URL (query param ou param de route)
    this.token = this.route.snapshot.queryParamMap.get('token') || 
                 this.route.snapshot.paramMap.get('token');
    
    console.log('Reset password token:', this.token);
    console.log('Current URL:', this.router.url);
    console.log('Query params:', this.route.snapshot.queryParamMap);
    console.log('Route params:', this.route.snapshot.paramMap);
    
    if (!this.token) {
      this.errorMessage = 'Le lien de réinitialisation est invalide ou a expiré.';
    }
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    const sanitizedData = sanitizeFormValue(this.resetForm.value);
    const { newPassword } = sanitizedData;

    if (!newPassword) {
      this.errorMessage = 'Nouveau mot de passe requis';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response) => {
        this.successMessage = 'Mot de passe réinitialisé avec succès ! Vous allez être redirigé vers la page de connexion.';
        this.isLoading = false;
        
        // Redirection vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur lors de la réinitialisation:', err);
        
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.error && err.error.error) {
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la réinitialisation. Veuillez réessayer.';
        }
      }
    });
  }

  // Méthodes pour accéder aux contrôles du formulaire dans le template
  get newPassword() { return this.resetForm.get('newPassword'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }

  // Méthode pour vérifier si un champ a des erreurs
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.resetForm.get(fieldName);
    if (!field) return false;
    
    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    
    return field.invalid && (field.dirty || field.touched);
  }

  // Méthode pour obtenir le message d'erreur d'un champ
  getErrorMessage(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'Ce champ est requis';
    }
    
    if (field.errors['minlength']) {
      return `Le mot de passe doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
    }
    
    if (field.errors['maxlength']) {
      return `Le mot de passe ne peut pas dépasser ${field.errors['maxlength'].requiredLength} caractères`;
    }
    
    if (field.errors['passwordMismatch']) {
      return 'Les mots de passe ne correspondent pas';
    }

    return '';
  }
}
