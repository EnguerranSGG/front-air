import { Component, OnInit } from '@angular/core';
import { GovernanceComponent } from '../governance/governance.component';
import { NewsComponent } from '../news/news.component';
import { FlyerComponent } from '../flyer/flyer.component';
import { CertificateComponent } from '../certificate/certificate.component';
import { HomeIllustrationComponent } from '../home-illustration/home-illustration.component';
import { FleIllustrationComponent } from '../fle-illustration/fle-illustration.component';
import { PresentationService } from '../../services/presentation.service';
import { Presentation } from '../../models/presentation.model';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GovernanceComponent,
    NewsComponent,
    FlyerComponent,
    CertificateComponent,
    HomeIllustrationComponent,
    FleIllustrationComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  presentation: Presentation | null = null;
  isLoading = false;

  constructor(private presentationService: PresentationService) {}

  ngOnInit(): void {
    this.loadPresentation();
  }

  private loadPresentation(): void {
    this.isLoading = true;
    this.presentationService.getById(1).subscribe({
      next: (presentation) => {
        this.presentation = presentation;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la présentation:', error);
        this.isLoading = false;
      }
    });
  }
}
