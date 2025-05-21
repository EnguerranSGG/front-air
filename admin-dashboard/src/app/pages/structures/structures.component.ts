import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StructureService } from '../../services/structure.service';
import { Structure } from '../../models/structure.model';
import { ToastService } from '../../utils/toast/toast.service';
import { environment } from '../../../environments/environment';
import { FileEntity } from '../../models/file.model';
import { FileSelectorComponent } from '../files/files-selector.component';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileSelectorComponent],
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.scss'],
})
export class StructureComponent implements OnInit {
  apiUrl = environment.API_URL;
  files: FileEntity[] = [];
  structures: Structure[] = [];
  isCreating = false;
  editingStructureId: number | null = null;

  createForm!: FormGroup;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private structureService: StructureService,
    private toast: ToastService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.loadStructures();
    this.createForm = this.buildForm();
    this.getFiles();
  }

  buildForm(structure?: Structure): FormGroup {
    return this.fb.group({
      name: [structure?.name || '', [Validators.required, Validators.maxLength(60)]],
      description: [structure?.description || '', [Validators.required, Validators.maxLength(330)]],
      address: [structure?.address || '', [Validators.maxLength(255)]],
      phone_number: [structure?.phone_number || '', [Validators.maxLength(25)]],
      link: [structure?.link || '', [Validators.maxLength(500)]],
      file: [structure?.file?.file_id || null],
      missions: this.fb.array(
        structure?.missions?.map(m => this.fb.control(m.content, [Validators.maxLength(250)])) || []
      ),
    });
  }

  onFileSelect(fileId: number): void {
    if (this.editingStructureId !== null) {
      this.editForm.patchValue({ file_id: fileId });
    } else {
      this.createForm.patchValue({ file_id: fileId });
    }
  }

  getFiles(): void {
    this.fileService.getAll().subscribe({
      next: (files) => (this.files = files),
      error: () => this.toast.show('Erreur lors du chargement des fichiers'),
    });
  }

  loadStructures(): void {
    this.structureService.getAll().subscribe(data => {
      this.structures = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  startCreate(): void {
    this.isCreating = true;
    this.createForm = this.buildForm();
  }

  cancelCreate(): void {
    this.isCreating = false;
  }

  addStructure(): void {
    const payload = this.formatMissions(this.createForm);
    this.structureService.create(payload).subscribe({
      next: () => {
        this.toast.show('Structure ajoutée avec succès');
        this.loadStructures();
        this.isCreating = false;
      },
      error: err => this.toast.show('Erreur lors de l’ajout'),
    });
  }

  startEdit(structure: Structure): void {
    this.editingStructureId = structure.structure_id;
    this.editForm = this.buildForm(structure);
  }

  cancelEdit(): void {
    this.editingStructureId = null;
  }

  saveEdit(structure: Structure): void {
    const payload = this.formatMissions(this.editForm);
    this.structureService.update(structure.structure_id, payload).subscribe({
      next: () => {
        this.toast.show('Structure modifiée avec succès');
        this.editingStructureId = null;
        this.loadStructures();
      },
      error: err => this.toast.show('Erreur lors de la modification'),
    });
  }

  deleteStructure(id: number): void {
    if (confirm('Supprimer cette structure ?')) {
      this.structureService.delete(id).subscribe(() => {
        this.toast.show('Structure supprimée');
        this.loadStructures();
      });
    }
  }

  get createMissions(): FormArray {
    return this.createForm.get('missions') as FormArray;
  }

  get editMissions(): FormArray {
    return this.editForm.get('missions') as FormArray;
  }

  addMission(form: FormGroup): void {
    const missions = form.get('missions') as FormArray;
    missions.push(this.fb.control('', [Validators.maxLength(250)]));
  }

  removeMission(form: FormGroup, index: number): void {
    const missions = form.get('missions') as FormArray;
    missions.removeAt(index);
  }

  private formatMissions(form: FormGroup): any {
    const values = { ...form.value };
    values.missions = (form.get('missions') as FormArray).controls
      .map(control => control.value)
      .filter((val: string) => val.trim() !== '')
      .map((val: string) => ({ content: val }));
    return values;
  }
}
