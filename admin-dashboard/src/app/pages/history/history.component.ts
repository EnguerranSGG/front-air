import { Component, OnInit } from '@angular/core';
import { TimeService } from '../../services/time.service';
import { ToastService } from '../../utils/toast/toast.service';
import { Time } from '../../models/time.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})

export class HistoryComponent implements OnInit {
  times: Time[] = [];
  editingTimeId: number | null = null;
  editForm!: FormGroup;
  createForm!: FormGroup;
  isCreating = false;

  constructor(private timeService: TimeService, private fb: FormBuilder, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadTimes();
    this.createForm = this.fb.group({
      year: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      event_description: ['', [Validators.required, Validators.maxLength(175)]],
    });
  }

  loadTimes(): void {
    this.timeService.getAll().subscribe((data) => {
      this.times = data.sort((a, b) => b.year - a.year);
    });
  }

  startCreate(): void {
    this.isCreating = true;
    this.createForm.reset();
  }

  cancelCreate(): void {
    this.isCreating = false;
  }

  addTime(): void {
    if (this.createForm.valid) {
      this.timeService.create(this.createForm.value).subscribe({
        next: () => {
          this.loadTimes();
          this.isCreating = false;
          this.toastService.show('Evénement ajouté avec succès ✅');
        },
        error: (err) => console.error('Erreur lors de l’ajout:', err),
      });
    }
  }

  startEdit(time: Time): void {
    this.editingTimeId = time.time_id;
    this.editForm = this.fb.group({
      year: [time.year, [Validators.required, Validators.min(1900), Validators.max(2100)]],
      event_description: [time.event_description, [Validators.required, Validators.maxLength(175)]],
    });
  }

  cancelEdit(): void {
    this.editingTimeId = null;
  }

  saveEdit(time: Time): void {
    if (this.editForm.valid) {
      const updated = this.editForm.value;
      this.timeService.update(time.time_id, updated).subscribe({
        next: (updatedTime) => {
          console.log('Mise à jour réussie:', updatedTime);
          const index = this.times.findIndex((t) => t.time_id === time.time_id);
          if (index !== -1) {
            this.times[index] = { ...this.times[index], ...updatedTime };
          }
          this.editingTimeId = null;
          this.loadTimes();
          this.toastService.show('Événement modifié avec succès ✏️');
        },
        error: (err) => {
          console.error('Erreur de mise à jour:', err);
        },
      });
    }
  }

  deleteTime(time_id: number): void {
    if (confirm('Supprimer cet événement ?')) {
      this.timeService.delete(time_id).subscribe(() => this.loadTimes());
      this.toastService.show('Événement supprimé avec succès 🗑️');
    }
  }
  
}