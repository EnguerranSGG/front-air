import { Component, ViewChild } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './utils/toast/toast.component';
import { ToastService } from './utils/toast/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(ToastComponent) toast!: ToastComponent;

  constructor(private router: Router, private toastService: ToastService) {}

  shouldShowHeader(): boolean {
    return this.router.url !== '/login';
  }

  ngAfterViewInit(): void {
    this.toastService.register(this.toast);
  }
}
