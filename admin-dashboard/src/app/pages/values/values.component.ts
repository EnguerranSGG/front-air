import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValueService } from '../../services/value.service';
import { Value } from '../../models/value.model';
import { ToastService } from '../../utils/toast/toast.service';

@Component({
  selector: 'app-value',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './values.component.html',
  styleUrls: ['./values.component.scss']
})
export class ValuesComponent implements OnInit {
  values: Value[] = [];
  editingValueId: number | null = null;
  isCreating = false;

  createForm!: FormGroup;
  editForm!: FormGroup;

  constructor(
    private valueService: ValueService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadValues();
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      image_url: ['', [Validators.maxLength(500)]],
    });
  }

  loadValues(): void {
    this.valueService.getAll().subscribe(data => {
      this.values = data;
    });
  }

  startCreate(): void {
    this.isCreating = true;
    this.createForm.reset();
  }

  cancelCreate(): void {
    this.isCreating = false;
  }

  addValue(): void {
    if (this.createForm.valid) {
      this.valueService.create(this.createForm.value).subscribe({
        next: () => {
          this.loadValues();
          this.isCreating = false;
          this.toastService.show('Valeur ajoutée avec succès ✅');
        },
        error: err => console.error('Erreur lors de l’ajout:', err)
      });
    }
  }

  startEdit(value: Value): void {
    this.editingValueId = value.value_id;
    this.editForm = this.fb.group({
      name: [value.name, [Validators.required, Validators.maxLength(100)]],
      image_url: [value.image_url, [Validators.maxLength(500)]],
    });
  }

  cancelEdit(): void {
    this.editingValueId = null;
  }

  saveEdit(value: Value): void {
    const updated = this.editForm.value;
    this.valueService.update(value.value_id, updated).subscribe({
      next: updatedValue => {
        const index = this.values.findIndex(v => v.value_id === value.value_id);
        if (index !== -1) {
          this.values[index] = { ...this.values[index], ...updatedValue };
        }
        this.editingValueId = null;
        this.loadValues();
        this.toastService.show('Valeur modifiée avec succès ✏️');
      },
      error: err => console.error('Erreur de mise à jour:', err)
    });
  }

  deleteValue(value_id: number): void {
    if (confirm('Supprimer cette valeur ?')) {
      this.valueService.delete(value_id).subscribe(() => {
        this.loadValues();
        this.toastService.show('Valeur supprimée avec succès 🗑️');
      });
    }
  }
}
