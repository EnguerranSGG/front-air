import { Component, OnInit } from '@angular/core';
import { PartnerService } from '../../services/partner.service';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { Partner } from '../../models/partner.model';
import { FileEntity } from '../../models/file.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { sanitizeFormValue } from '../../utils/sanitize/sanitize';
import { FileSelectorComponent } from '../files/files-selector.component';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';
import { environment } from '../../../environments/environment';
import { PageLoaderService } from '../../services/page-loader.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FileSelectorComponent,
    SpinnerComponent,
  ],
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss'],
})
export class PartnersComponent implements OnInit {
  partners: Partner[] = [];
  files: FileEntity[] = [];
  editingPartnerId: number | null = null;
  editForm!: FormGroup;
  createForm!: FormGroup;
  showForm = false;
  showCreateFileSelector = false;
  showEditFileSelector = false;
  isInitialLoading = true;
  apiUrl = environment.API_URL;

  constructor(
    private partnerService: PartnerService,
    private fileService: FileService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private pageLoaderService: PageLoaderService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private initForms(): void {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      file_id: [null],
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      file_id: [null],
    });
  }

  private async loadData(): Promise<void> {
    try {
      this.isInitialLoading = true;

      // Charger les partenaires et les fichiers en parallèle
      const loadPromise = Promise.all([
        firstValueFrom(this.partnerService.getAll()),
        firstValueFrom(this.fileService.getAll()),
      ]);

      // Enregistrer la promesse dans le service de chargement
      this.pageLoaderService.registerPageLoad(loadPromise);

      const [partnersData, filesData] = await loadPromise;

      this.partners = partnersData || [];
      this.files = filesData || [];
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.toastService.show('Erreur lors du chargement des données');
    } finally {
      this.isInitialLoading = false;
    }
  }

  onFileSelect(fileId: number): void {
    if (this.showCreateFileSelector) {
      this.createForm.patchValue({ file_id: fileId });
    } else if (this.showEditFileSelector) {
      this.editForm.patchValue({ file_id: fileId });
    }
  }

  addPartner(): void {
    if (this.createForm.valid) {
      const formData = this.createForm.value;
      const sanitizedData = {
        name: sanitizeFormValue(formData.name),
        file_id: formData.file_id,
      };

      this.partnerService.create(sanitizedData).subscribe({
        next: () => {
          this.toastService.show('Partenaire créé avec succès');
          this.createForm.reset();
          this.showForm = false;
          this.showCreateFileSelector = false;
          this.loadData();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.toastService.show('Erreur lors de la création du partenaire');
        },
      });
    }
  }

  startEdit(partner: Partner): void {
    this.editingPartnerId = partner.parteners_id;
    this.editForm.patchValue({
      name: partner.name,
      file_id: partner.file_id,
    });
    this.showEditFileSelector = false;
  }

  saveEdit(partner: Partner): void {
    if (this.editForm.valid) {
      const formData = this.editForm.value;
      const sanitizedData = {
        name: sanitizeFormValue(formData.name),
        file_id: formData.file_id,
      };

      this.partnerService
        .update(partner.parteners_id, sanitizedData)
        .subscribe({
          next: () => {
            this.toastService.show('Partenaire modifié avec succès');
            this.cancelEdit();
            this.loadData();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
            this.toastService.show(
              'Erreur lors de la modification du partenaire'
            );
          },
        });
    }
  }

  cancelEdit(): void {
    this.editingPartnerId = null;
    this.editForm.reset();
    this.showEditFileSelector = false;
  }

  deletePartner(partnerId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      this.partnerService.delete(partnerId).subscribe({
        next: () => {
          this.toastService.show('Partenaire supprimé avec succès');
          this.loadData();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastService.show('Erreur lors de la suppression du partenaire');
        },
      });
    }
  }
}
