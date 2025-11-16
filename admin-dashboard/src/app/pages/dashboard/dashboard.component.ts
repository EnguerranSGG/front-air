import { Component, OnInit } from '@angular/core';
import { NewsComponent } from '../news/news.component';
import { HomeIllustrationComponent } from '../home-illustration/home-illustration.component';
import { FleIllustrationComponent } from '../fle-illustration/fle-illustration.component';
import { PresentationService } from '../../services/presentation.service';
import { Presentation } from '../../models/presentation.model';
import { PageLoaderService } from '../../services/page-loader.service';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NewsComponent,
    HomeIllustrationComponent,
    FleIllustrationComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  presentation: Presentation | null = null;
  isLoading = false;

  constructor(
    private presentationService: PresentationService,
    private pageLoaderService: PageLoaderService
  ) {}

  ngOnInit(): void {
    this.loadPresentation();
  }

  private loadPresentation(): void {
    this.isLoading = true;
    
    // Enregistrer la promesse de chargement
    const presentationPromise = firstValueFrom(this.presentationService.getById(1));
    this.pageLoaderService.registerPageLoad(presentationPromise);
    
    presentationPromise.then(
      (presentation) => {
        this.presentation = presentation;
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement de la présentation:', error);
        this.isLoading = false;
      }
    );
  }
}
