import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { sanitizeFormValue } from '../../utils/sanitize/sanitize';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.errorMessage = 'Veuillez saisir une adresse email valide';
      return;
    }

    const sanitizedData = sanitizeFormValue(this.forgotForm.value);
    const { email } = sanitizedData;

    if (!email) {
      this.errorMessage = 'Adresse email requise';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        // Toujours afficher le message de succès pour des raisons de sécurité
        // (même si l'email n'existe pas, on ne le révèle pas)
        this.successMessage = 'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation. Vérifiez votre boîte de réception et vos spams.';
        this.isLoading = false;
        
        // Optionnel : redirection vers la page de connexion après 5 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur lors de l\'envoi de l\'email:', err);
        
        // Pour des raisons de sécurité, on affiche toujours le même message
        // même en cas d'erreur (pour ne pas révéler si l'email existe ou non)
        this.successMessage = 'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation. Vérifiez votre boîte de réception et vos spams.';
        
        // Seulement en cas d'erreur serveur grave, on affiche une erreur
        if (err.status >= 500) {
          this.errorMessage = 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
        }
      }
    });
  }

  // Méthode pour vérifier si un champ a des erreurs
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.forgotForm.get(fieldName);
    if (!field) return false;
    
    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    
    return field.invalid && (field.dirty || field.touched);
  }

  // Méthode pour obtenir le message d'erreur d'un champ
  getErrorMessage(fieldName: string): string {
    const field = this.forgotForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'Ce champ est requis';
    }
    
    if (field.errors['email']) {
      return 'Veuillez saisir une adresse email valide';
    }
    
    if (field.errors['maxlength']) {
      return `L'email ne peut pas dépasser ${field.errors['maxlength'].requiredLength} caractères`;
    }

    return '';
  }
}