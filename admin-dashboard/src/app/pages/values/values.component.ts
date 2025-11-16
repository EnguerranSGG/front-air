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
import { PageLoaderService } from '../../services/page-loader.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-value',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileSelectorComponent,
  ],
  templateUrl: './values.component.html',
  styleUrls: ['./values.component.scss'],
})
export class ValuesComponent implements OnInit {
  apiUrl = environment.API_URL;
  files: FileEntity[] = [];
  values: Value[] = [];
  isCreating = false;
  editingValueId: number | null = null;
  isLoading = false;
  isLoadingFiles = false;
  isInitialLoading = true; // Spinner global pour le chargement initial

  createForm!: FormGroup;
  editForm!: FormGroup;
  showForm = false;
  showCreateFileSelector = false;
  showEditFileSelector = false;

  constructor(
    private fb: FormBuilder,
    private valueService: ValueService,
    private toast: ToastService,
    private fileService: FileService,
    private pageLoaderService: PageLoaderService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.createForm = this.buildForm();
  }

  private loadInitialData(): void {
    this.isInitialLoading = true;

    // Charger les valeurs et les fichiers en parallèle
    const valuesPromise = firstValueFrom(this.valueService.getAll());
    const filesPromise = firstValueFrom(this.fileService.getAll());

    // Créer la promesse combinée et l'enregistrer immédiatement
    const allDataPromise = Promise.all([valuesPromise, filesPromise]);
    this.pageLoaderService.registerPageLoad(allDataPromise);

    allDataPromise
      .then(([valuesData, filesData]) => {
        this.values = (valuesData || []).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        this.files = filesData || [];
        this.isInitialLoading = false;
      })
      .catch((error) => {
        console.error('Erreur lors du chargement initial:', error);
        this.toast.show('Erreur lors du chargement des données');
        this.isInitialLoading = false;
      });
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

  onFileSelect(fileId: number): void {
    if (this.editingValueId !== null) {
      this.editForm.patchValue({ file_id: fileId });
    } else {
      this.createForm.patchValue({ file_id: fileId });
    }
  }

  private loadValues(): void {
    this.isLoading = true;
    this.valueService.getAll().subscribe({
      next: (data) => {
        this.values = data.sort((a, b) => a.name.localeCompare(b.name));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
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
