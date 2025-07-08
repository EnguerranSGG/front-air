import { Component, OnInit } from '@angular/core';
import { CounselorService } from '../../services/counselor.service';
import { ToastService } from '../../utils/toast/toast.service';
import { Counselor } from '../../models/counselor.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { sanitizeFormValue } from '../../utils/sanitize/sanitize';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './counselor.component.html',
  styleUrls: ['./counselor.component.scss'],
})
export class CounselorComponent implements OnInit {
  counselors: Counselor[] = [];
  editingCounselorId: number | null = null;
  editForm!: FormGroup;
  createForm!: FormGroup;
  isCreating = false;

  constructor(
    private counselorService: CounselorService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCounselors();
    this.createForm = this.fb.group({
      counselor_firstname: ['', [Validators.required, Validators.maxLength(30)]],
      counselor_lastname: ['', [Validators.required, Validators.maxLength(30)]],
      counselor_function: ['', [Validators.required, Validators.maxLength(50)]],
      counselor_presentation: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  loadCounselors(): void {
    this.counselorService.getAll().subscribe((data) => {
      this.counselors = data.sort((a, b) => b.counselor_id - a.counselor_id);
    });
  }

  startCreate(): void {
    this.isCreating = true;
    this.createForm.reset();
  }

  cancelCreate(): void {
    this.isCreating = false;
  }

  addCounselor(): void {
    if (this.createForm.invalid) {
      this.toastService.show(
        'Veuillez corriger le formulaire avant de soumettre.'
      );
      return;
    }

    const sanitizedPayload = sanitizeFormValue(this.createForm.value);
    this.counselorService.create(sanitizedPayload).subscribe({
      next: () => {
        this.loadCounselors();
        this.isCreating = false;
        this.createForm.reset();
        this.toastService.show('Conseiller ajouté avec succès ✅');
      },
      error: (err) => console.error('Erreur lors de l’ajout:', err),
    });
  }

  startEdit(counselor: Counselor): void {
    this.editingCounselorId = counselor.counselor_id;
    this.editForm = this.fb.group({
      counselor_firstname: [
        counselor.counselor_firstname,
        [Validators.required, Validators.maxLength(30)],
      ],
      counselor_lastname: [
        counselor.counselor_lastname,
        [Validators.required, Validators.maxLength(30)],
      ],
      counselor_function: [
        counselor.counselor_function,
        [Validators.required, Validators.maxLength(50)],
      ],
      counselor_presentation: [
        counselor.counselor_presentation,
        [Validators.required, Validators.maxLength(200)],
      ],
    });
  }

  cancelEdit(): void {
    this.editingCounselorId = null;
  }

  saveEdit(counselor: Counselor): void {
    if (this.editForm.invalid) {
      this.toastService.show(
        'Veuillez corriger le formulaire avant de soumettre.'
      );
      return;
    }
    const sanitizedPayload = sanitizeFormValue(this.editForm.value);

    this.counselorService.update(counselor.counselor_id, sanitizedPayload).subscribe({
      next: (updatedCounselor) => {
        console.log('Mise à jour réussie:', updatedCounselor);
        const index = this.counselors.findIndex((c) => c.counselor_id === counselor.counselor_id);
        if (index !== -1) {
          this.counselors[index] = { ...this.counselors[index], ...updatedCounselor };
        }
        this.editingCounselorId = null;
        this.loadCounselors();
        this.editForm.reset();
        this.toastService.show('Conseiller modifié avec succès ✏️');
      },
      error: () => console.error('Erreur lors de la modification:'),
    });
  }

  deleteCounselor(counselor_id: number): void {
    if (confirm('Supprimer ce conseiller ?')) {
      this.counselorService.delete(counselor_id).subscribe(() => this.loadCounselors());
      this.toastService.show('Conseiller supprimé avec succès 🗑️');
    }
  }
}
