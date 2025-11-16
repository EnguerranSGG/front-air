import { Component, OnInit } from '@angular/core';
import { TimeService } from '../../services/time.service';
import { ToastService } from '../../utils/toast/toast.service';
import { Time } from '../../models/time.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { sanitizeFormValue } from '../../utils/sanitize/sanitize';
import { RouterModule } from '@angular/router';
import { PresentationService } from '../../services/presentation.service';
import { Presentation } from '../../models/presentation.model';
import { PageLoaderService } from '../../services/page-loader.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SanitizePipe, RouterModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  times: Time[] = [];
  editingTimeId: number | null = null;
  editForm!: FormGroup;
  createForm!: FormGroup;
  isCreating = false;
  presentation: Presentation | null = null;
  isLoadingPresentation = false;

  constructor(
    private timeService: TimeService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private presentationService: PresentationService,
    private pageLoaderService: PageLoaderService
  ) {}

  ngOnInit(): void {
    this.loadTimes();
    this.loadPresentation();
    this.createForm = this.fb.group({
      year: [
        '',
        [Validators.required, Validators.min(1900), Validators.max(2200)],
      ],
      event_description: ['', [Validators.required, Validators.maxLength(175)]],
    });
  }

  loadTimes(): void {
    const timesPromise = firstValueFrom(this.timeService.getAll());
    this.pageLoaderService.registerPageLoad(timesPromise);

    timesPromise.then(
      (data) => {
        this.times = data.sort((a, b) => b.year - a.year);
      },
      (error) => {
        console.error('Erreur lors du chargement des événements:', error);
      }
    );
  }

  private loadPresentation(): void {
    this.isLoadingPresentation = true;
    const presentationPromise = firstValueFrom(
      this.presentationService.getById(2)
    );
    this.pageLoaderService.registerPageLoad(presentationPromise);

    presentationPromise.then(
      (presentation) => {
        this.presentation = presentation;
        this.isLoadingPresentation = false;
      },
      (error) => {
        console.error('Erreur lors du chargement de la présentation:', error);
        this.isLoadingPresentation = false;
      }
    );
  }

  startCreate(): void {
    this.isCreating = true;
    this.createForm.reset();
  }

  cancelCreate(): void {
    this.isCreating = false;
  }

  addTime(): void {
    if (this.createForm.invalid) {
      this.toastService.show(
        'Veuillez corriger le formulaire avant de soumettre.'
      );
      return;
    }

    const sanitizedPayload = sanitizeFormValue(this.createForm.value);
    this.timeService.create(sanitizedPayload).subscribe({
      next: () => {
        this.loadTimes();
        this.isCreating = false;
        this.createForm.reset();
        this.toastService.show('Evénement ajouté avec succès ✅');
      },
      error: (err) => console.error("Erreur lors de l'ajout:", err),
    });
  }

  startEdit(time: Time): void {
    this.editingTimeId = time.time_id;
    this.editForm = this.fb.group({
      year: [
        time.year,
        [Validators.required, Validators.min(1900), Validators.max(2200)],
      ],
      event_description: [
        time.event_description,
        [Validators.required, Validators.maxLength(175)],
      ],
    });
  }

  cancelEdit(): void {
    this.editingTimeId = null;
  }

  saveEdit(time: Time): void {
    if (this.editForm.invalid) {
      this.toastService.show(
        'Veuillez corriger le formulaire avant de soumettre.'
      );
      return;
    }
    const sanitizedPayload = sanitizeFormValue(this.editForm.value);

    this.timeService.update(time.time_id, sanitizedPayload).subscribe({
      next: (updatedTime) => {
        console.log('Mise à jour réussie:', updatedTime);
        const index = this.times.findIndex((t) => t.time_id === time.time_id);
        if (index !== -1) {
          this.times[index] = { ...this.times[index], ...updatedTime };
        }
        this.editingTimeId = null;
        this.loadTimes();
        this.editForm.reset();
        this.toastService.show('Événement modifié avec succès ✏️');
      },
      error: () => console.error('Erreur lors de la modification:'),
    });
  }

  deleteTime(time_id: number): void {
    if (confirm('Supprimer cet événement ?')) {
      this.timeService.delete(time_id).subscribe(() => this.loadTimes());
      this.toastService.show('Événement supprimé avec succès 🗑️');
    }
  }
}
