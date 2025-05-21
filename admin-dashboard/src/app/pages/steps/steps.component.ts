import { Component, OnInit } from '@angular/core';
import { StepService } from '../../services/step.service';
import { Step } from '../../models/step.model';
import { Path } from '../../models/path.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../utils/toast/toast.service';
import { PathService } from '../../services/path.service';
import { environment } from '../../../environments/environment';
import { FileEntity } from '../../models/file.model';
import { FileService } from '../../services/file.service';
import { FileSelectorComponent } from '../files/files-selector.component';

@Component({
  selector: 'app-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FileSelectorComponent],
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})
export class StepComponent implements OnInit {
  apiUrl = environment.API_URL;
  files: FileEntity[] = [];
  steps: Step[] = [];
  paths: Path[] = [];
  pathIdFilter: number | null = null;

  createForm!: FormGroup;
  editForm!: FormGroup;
  editingId: number | null = null;

  constructor(
    private stepService: StepService,
    private pathService: PathService,
    private fb: FormBuilder,
    private toast: ToastService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.createForm = this.buildForm();
    this.loadSteps();
    this.loadPaths();
    this.getFiles();
  }

  buildForm(step?: Step): FormGroup {
    return this.fb.group({
      name: [step?.name || '', [Validators.required]],
      description: [step?.description || '', [Validators.required]],
      path_id: [step?.path_id || null, [Validators.required]],
      file: [step?.file?.file_id || null]
    });
  }

  getFiles(): void {
    this.fileService.getAll().subscribe({
      next: (files) => (this.files = files),
      error: () => this.toast.show('Erreur lors du chargement des fichiers'),
    });
  }

  loadSteps(): void {
    if (this.pathIdFilter) {
      this.stepService.getByPathId(this.pathIdFilter).subscribe(data => this.steps = data);
    } else {
      this.stepService.getAll().subscribe(data => this.steps = data);
    }
  }

  loadPaths(): void {
    this.pathService.getAll().subscribe(paths => {
      this.paths = paths;
    });
  }

  onPathSelectChange(path: any): void {
    this.createForm.patchValue({ path_id: path.path_id });
  }

  getPathName(pathId: number): string {
    const path = this.paths.find(p => p.path_id === pathId);
    return path ? path.name : 'Inconnu';
  }

  onPathFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.pathIdFilter = value ? Number(value) : null;
    this.loadSteps();
  }

  addStep(): void {
    if (this.createForm.valid) {
      this.stepService.create(this.createForm.value).subscribe(() => {
        this.toast.show('Étape ajoutée');
        this.createForm.reset();
        this.loadSteps();
      });
    }
  }

  startEdit(step: Step): void {
    this.editingId = step.step_id;
    this.editForm = this.buildForm(step);
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(step: Step): void {
    if (this.editForm.valid) {
      this.stepService.update(step.step_id, this.editForm.value).subscribe(() => {
        this.toast.show('Étape modifiée');
        this.editingId = null;
        this.loadSteps();
      });
    }
  }

  deleteStep(id: number): void {
    if (confirm('Supprimer cette étape ?')) {
      this.stepService.delete(id).subscribe(() => {
        this.toast.show('Étape supprimée');
        this.loadSteps();
      });
    }
  }

  onFileSelect(fileId: number): void {
    if (this.editingId) {
      this.editForm.patchValue({ file_id: fileId });
    } else {
      this.createForm.patchValue({ file_id: fileId });
    }
  }
}
