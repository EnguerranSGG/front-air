import { Injectable } from '@angular/core';
import { ToastComponent } from './toast.component';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastRef?: ToastComponent;

  register(toast: ToastComponent) {
    this.toastRef = toast;
  }

  show(message: string, duration: number = 3000) {
    this.toastRef?.show(message, duration);
  }
}
