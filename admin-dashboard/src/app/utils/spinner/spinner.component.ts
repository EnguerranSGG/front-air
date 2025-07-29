import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.overlay]="overlay">
      <div class="spinner" [class.small]="size === 'small'" [class.medium]="size === 'medium'" [class.large]="size === 'large'"></div>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    .spinner-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      z-index: 999;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #0046a4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .spinner.small {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .spinner.medium {
      width: 40px;
      height: 40px;
      border-width: 4px;
    }

    .spinner.large {
      width: 60px;
      height: 60px;
      border-width: 6px;
    }

    .spinner-message {
      color: #666;
      font-size: 1rem;
      margin: 0;
      font-weight: 500;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class SpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message: string = '';
  @Input() overlay: boolean = false;
} 