import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StructureService } from '../../services/structure.service';
import { StructureTypeService } from '../../services/structure-type.service';
import { Structure, StructureType } from '../../models/structure.model';
import { ToastService } from '../../utils/toast/toast.service';
import { environment } from '../../../environments/environment';
import { FileEntity } from '../../models/file.model';
import { FileSelectorComponent } from '../files/files-selector.component';
import { FileService } from '../../services/file.service';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { sanitize } from 'class-sanitizer';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FileSelectorComponent, SanitizePipe, SpinnerComponent],
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.scss'],
})
export class StructureComponent implements OnInit {
  apiUrl = environment.API_URL;
  files: FileEntity[] = [];
  structures: Structure[] = [];
  structureTypes: StructureType[] = [];
  showForm = false;
  editingStructureId: number | null = null;
  showCreateFileSelector = false;
  showEditFileSelector = false;
  selectedTypeFilter: string = 'all';
  isLoading = false;
  isLoadingFiles = false;
  isLoadingTypes = false;
  isInitialLoading = true; // Spinner global pour le chargement initial

  createForm!: FormGroup;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private structureService: StructureService,
    private structureTypeService: StructureTypeService,
    private toast: ToastService,
    private fileService: FileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.createForm = this.buildForm();
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isInitialLoading = true;
    
    // Charger les types, fichiers et structures en parallèle
    const typesPromise = this.structureTypeService.getAllWithFallback().toPromise();
    const filesPromise = this.fileService.getAll().toPromise();
    
    Promise.all([typesPromise, filesPromise])
      .then(([typesData, filesData]) => {
        this.structureTypes = typesData || [];
        this.files = filesData || [];
        
        // Maintenant charger les structures une fois que les types sont disponibles
        return this.structureService.getAll().toPromise();
      })
      .then((structuresData) => {
        this.structures = (structuresData || []).sort((a, b) => a.structure_id - b.structure_id);
        
        // Peupler les objets structure_type manuellement
        this.structures.forEach(structure => {
          if (structure.structure_type_id && !structure.structure_type) {
            const type = this.structureTypes.find(t => t.structure_type_id === structure.structure_type_id);
            if (type) {
              structure.structure_type = type;
            }
          }
        });
        
        this.isInitialLoading = false;
      })
      .catch((error) => {
        console.error('Erreur lors du chargement initial:', error);
        this.toast.show('Erreur lors du chargement des données');
        this.isInitialLoading = false;
      });
  }

  buildForm(structure?: Structure): FormGroup {
    return this.fb.group({
      name: [structure?.name || '', [Validators.required, Validators.maxLength(60)]],
      description: [structure?.description || '', [Validators.required, Validators.maxLength(330)]],
      address: [structure?.address || '', [Validators.maxLength(255)]],
      phone_number: [structure?.phone_number || '', [Validators.maxLength(25)]],
      link: [structure?.link || '', [Validators.maxLength(255), Validators.pattern(/https?:\/\/.+/)]],
      file_id: [structure?.file?.file_id || null],
      structure_type_id: [structure?.structure_type_id || null, [Validators.required]],
      missions: this.fb.array(
        structure?.missions?.map(m => this.fb.control(m.content, [Validators.maxLength(250)])) || []
      ),
    });
  }

  onFileSelect(fileId: number): void {
    const targetForm = this.editingStructureId !== null ? this.editForm : this.createForm;
    targetForm.patchValue({ file_id: fileId });
  }

  private loadStructures(): void {
    this.isLoading = true;
    this.structureService.getAll().subscribe({
      next: data => {
        this.structures = data.sort((a, b) => a.structure_id - b.structure_id);
        
        // Peupler les objets structure_type manuellement
        this.structures.forEach(structure => {
          if (structure.structure_type_id && !structure.structure_type) {
            const type = this.structureTypes.find(t => t.structure_type_id === structure.structure_type_id);
            if (type) {
              structure.structure_type = type;
            }
          }
        });
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('Erreur lors du chargement des structures');
        this.isLoading = false;
      },
    });
  }

  getFilteredStructures(): Structure[] {
    if (this.selectedTypeFilter === 'all') {
      return this.structures;
    }
    
    if (this.selectedTypeFilter === 'no-type') {
      return this.structures.filter(structure => !structure.structure_type?.name);
    }
    
    const filtered = this.structures.filter(structure => {
      if (!structure.structure_type?.name) {
        return false;
      }
      const matches = structure.structure_type.name === this.selectedTypeFilter;
      return matches;
    });
    
    return filtered;
  }

  onTypeFilterChange(): void {
    // Forcer la détection de changement pour que le getter getFilteredStructures() soit recalculé
    this.cdr.detectChanges();
  }

  addStructure(): void {
    if (this.createForm.invalid) {
      this.toast.show('Veuillez corriger le formulaire avant de soumettre.');
      return;
    }

    const payload = this.preparePayload(this.createForm.value);

    this.structureService.create(payload).subscribe({
      next: () => {
        this.toast.show('Structure ajoutée avec succès');
        this.loadStructures();
        this.showForm = false;
        this.createForm.reset();
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
    const sanitized = {
      ...formValue,
      name: sanitize(formValue.name),
      description: sanitize(formValue.description),
      address: formValue.address ? sanitize(formValue.address) : null,
      phone_number: formValue.phone_number ? sanitize(formValue.phone_number) : null,
      link: formValue.link ? sanitize(formValue.link) : null,
      structure_type_id: formValue.structure_type_id,
      missions: (formValue.missions || []).map((content: string) => {
        return { content: sanitize(content) };
      }),
    };
  
    return sanitized;
  }
}
