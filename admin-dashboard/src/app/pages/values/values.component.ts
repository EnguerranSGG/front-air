import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValueService } from '../../services/value.service';
import { Value } from '../../models/value.model';
import { ToastService } from '../../utils/toast/toast.service';
import { environment } from '../../../environments/environment';
import { FileEntity } from '../../models/file.model';
import { FileSelectorComponent } from '../files/files-selector.component';
import { FileService } from '../../services/file.service';
import { sanitizeFormValue } from '../../utils/sanitize/sanitize';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';

@Component({
  selector: 'app-value',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileSelectorComponent, SanitizePipe],
  templateUrl: './values.component.html',
  styleUrls: ['./values.component.scss'],
})
export class ValuesComponent implements OnInit {
  apiUrl = environment.API_URL;
  files: FileEntity[] = [];
  values: Value[] = [];
  isCreating = false;
  editingValueId: number | null = null;

  createForm!: FormGroup;
  editForm!: FormGroup;
  showForm = false;
  showCreateFileSelector = false;
  showEditFileSelector = false;

  constructor(
    private fb: FormBuilder,
    private valueService: ValueService,
    private toast: ToastService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.loadValues();
    this.createForm = this.buildForm();
    this.getFiles();
  }

  buildForm(value?: Value): FormGroup {
    return this.fb.group({
      name: [
        value?.name || '',
        [Validators.required, Validators.maxLength(20)],
      ],
      file_id: [value?.file?.file_id || null],
    });
  }
  

  getFiles(): void {
    this.fileService.getAll().subscribe({
      next: (files) => (this.files = files),
      error: () => this.toast.show('Erreur lors du chargement des fichiers'),
    });
  }

  onFileSelect(fileId: number): void {
    if (this.editingValueId !== null) {
      this.editForm.patchValue({ file_id: fileId });
    } else {
      this.createForm.patchValue({ file_id: fileId });
    }
  }

  loadValues(): void {
    this.valueService.getAll().subscribe((data) => {
      this.values = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  startCreate(): void {
    this.isCreating = true;
    this.createForm = this.buildForm();
  }

  cancelCreate(): void {
    this.isCreating = false;
  }

  addValue(): void {
    if (this.createForm.valid) {

      const sanitizedPayload = sanitizeFormValue(this.createForm.value);

      this.valueService.create(sanitizedPayload).subscribe({
        next: () => {
          this.toast.show('Valeur ajoutée');
          this.loadValues();
          this.isCreating = false;
        },
        error: () => this.toast.show('Erreur lors de l’ajout'),
      });
    }
  }

  startEdit(value: Value): void {
    this.editingValueId = value.value_id;
    this.editForm = this.buildForm(value);
  }

  cancelEdit(): void {
    this.editingValueId = null;
  }

  saveEdit(value: Value): void {
    if (this.editForm.valid) {

      const sanitizedPayload = sanitizeFormValue(this.editForm.value);

      this.valueService.update(value.value_id, sanitizedPayload).subscribe({
        next: () => {
          this.toast.show('Valeur modifiée');
          this.editingValueId = null;
          this.loadValues();
        },
        error: () => this.toast.show('Erreur lors de la modification'),
      });
    }
  }

  deleteValue(id: number): void {
    if (confirm('Supprimer cette valeur ?')) {
      this.valueService.delete(id).subscribe(() => {
        this.toast.show('Valeur supprimée');
        this.loadValues();
      });
    }
  }
}
