import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StructureService } from '../../services/structure.service';
import { Structure } from '../../models/structure.model';
import { ToastService } from '../../utils/toast/toast.service';
import { environment } from '../../../environments/environment';
import { FileEntity } from '../../models/file.model';
import { FileSelectorComponent } from '../files/files-selector.component';
import { FileService } from '../../services/file.service';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { sanitize } from 'class-sanitizer';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileSelectorComponent, SanitizePipe],
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.scss'],
})
export class StructureComponent implements OnInit {
  apiUrl = environment.API_URL;
  files: FileEntity[] = [];
  structures: Structure[] = [];
  showForm = false;
  editingStructureId: number | null = null;
  showCreateFileSelector = false;
  showEditFileSelector = false;

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
      link: [structure?.link || '', [Validators.maxLength(255), Validators.pattern(/https?:\/\/.+/)]],
      file_id: [structure?.file?.file_id || null],
      missions: this.fb.array(
        structure?.missions?.map(m => this.fb.control(m.content, [Validators.maxLength(250)])) || []
      ),
    });
  }

  onFileSelect(fileId: number): void {
    const targetForm = this.editingStructureId !== null ? this.editForm : this.createForm;
    targetForm.patchValue({ file_id: fileId });
  }

  getFiles(): void {
    this.fileService.getAll().subscribe({
      next: files => this.files = files,
      error: () => this.toast.show('Erreur lors du chargement des fichiers'),
    });
  }

  loadStructures(): void {
    this.structureService.getAll().subscribe(data => {
      this.structures = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  addStructure(): void {
    if (this.createForm.invalid) {
      this.toast.show('Veuillez corriger le formulaire avant de soumettre.');
      return;
    }

    const payload = this.preparePayload(this.createForm.value);

    this.structureService.create(payload).subscribe({      next: () => {
        this.toast.show('Structure ajoutée avec succès');
        this.loadStructures();
        this.showForm = false;
      },
      error: () => this.toast.show("Erreur lors de l'ajout"),
    });
  }

  startEdit(structure: Structure): void {
    this.editingStructureId = structure.structure_id;
    this.editForm = this.buildForm(structure);
    this.showEditFileSelector = false;
  }

  cancelEdit(): void {
    this.editingStructureId = null;
  }

  saveEdit(structure: Structure): void {
    if (this.editForm.invalid) {
      this.toast.show('Veuillez corriger le formulaire avant de soumettre.');
      return;
    }

    const payload = this.preparePayload(this.editForm.value);

    this.structureService.update(structure.structure_id, payload).subscribe({
      next: () => {
        this.toast.show('Structure modifiée avec succès');
        this.editingStructureId = null;
        this.loadStructures();
      },
      error: () => this.toast.show('Erreur lors de la modification'),
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
    return this.editForm?.get('missions') as FormArray;
  }

  addMission(form: FormGroup): void {
    (form.get('missions') as FormArray).push(this.fb.control('', [Validators.maxLength(250)]));
  }

  removeMission(form: FormGroup, index: number): void {
    (form.get('missions') as FormArray).removeAt(index);
  }

  private preparePayload(formValue: any): any {
    console.log('preparePayload | formValue:', formValue);
    console.log('preparePayload | typeof missions:', typeof formValue.missions);
    console.log('preparePayload | missions:', formValue.missions);
  
    const sanitized = {
      ...formValue,
      name: sanitize(formValue.name),
      description: sanitize(formValue.description),
      address: formValue.address ? sanitize(formValue.address) : null,
      phone_number: formValue.phone_number ? sanitize(formValue.phone_number) : null,
      link: formValue.link ? sanitize(formValue.link) : null,
      missions: (formValue.missions || []).map((content: string) => {
        console.log('preparePayload | mapping content:', content);
        return { content: sanitize(content) };
      }),
    };
  
    console.log('preparePayload | sanitized:', sanitized);
    return sanitized;
  }
  
   
  
}
