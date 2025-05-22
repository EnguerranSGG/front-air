import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      mail: [''],
      password: ['']
    });
  }

  onSubmit(): void {
    const { mail, password } = this.loginForm.value;
    this.authService.login(mail, password).subscribe({
      next: (tokens) => {
        console.log('Access Token:', tokens.accessToken);
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        this.router.navigate(['/news']);
      },
      error: (err) => {
        this.errorMessage = 'Échec de la connexion';
        console.error(err);
      }
    });
  }
}
