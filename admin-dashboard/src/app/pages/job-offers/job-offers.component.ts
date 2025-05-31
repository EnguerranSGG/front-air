import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../utils/toast/toast.service';
import { JobOfferService } from '../../services/job-offers.service';
import { FileService } from '../../services/file.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FileEntity } from '../../models/file.model';
import { FileSelectorComponent } from '../../pages/files/files-selector.component';
import { environment } from '../../../environments/environment';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { sanitizeFormValue } from '../../utils/sanitize/sanitize';

@Component({
  selector: 'app-job-offer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FileSelectorComponent,
    SanitizePipe
  ],
  templateUrl: './job-offers.component.html',
  styleUrls: ['./job-offers.component.scss']
})
export class JobOfferComponent implements OnInit {
  apiUrl = environment.API_URL;  
  form!: FormGroup;
  jobOffers: any[] = [];
  editingId: number | null = null;
  files: FileEntity[] = [];
  showForm = false;
  showFileSelector = false;

  constructor(
    private fb: FormBuilder,
    private service: JobOfferService,
    private fileService: FileService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      job_type: ['', [Validators.required, Validators.maxLength(60)]],
      city: ['', [Validators.maxLength(50)]],
      file_id: [null], // Optionnel, pas de validateurs
      link: ['', [Validators.maxLength(255), Validators.pattern(/https?:\/\/.+/)]],
      description: ['', [Validators.required, Validators.maxLength(350)]],
    });

    this.loadOffers();
    this.getFiles();
  }

  getFiles(): void {
    this.fileService.getAll().subscribe({
      next: (files) => (this.files = files),
      error: () => this.toast.show('Erreur lors du chargement des fichiers'),
    });
  }

  loadOffers(): void {
    this.service.getAll().subscribe({
      next: (data) => {
        this.jobOffers = data;
      },
      error: () => this.toast.show("Erreur lors du chargement des offres"),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toast.show('Veuillez corriger le formulaire avant de soumettre.');
      return;
    }

    const sanitizedData = sanitizeFormValue(this.form.value);

    const action = this.editingId
      ? this.service.update(this.editingId, sanitizedData)
      : this.service.create(sanitizedData);

    action.subscribe({
      next: () => {
        this.toast.show(`Offre ${this.editingId ? 'modifiée' : 'créée'} avec succès`);
        this.loadOffers();
        this.reset();
      },
      error: () => this.toast.show("Erreur lors de l'enregistrement"),
    });
  }

  edit(offer: any): void {
    this.editingId = offer.job_offer_id;
    this.form.patchValue({
      name: offer.name,
      job_type: offer.job_type,
      city: offer.city || '',
      file_id: offer.file?.file_id || null,
      link: offer.link || '',
      description: offer.description,
    });
    this.showForm = true;
  }

  delete(id: number): void {
    if (confirm('Supprimer cette offre ?')) {
      this.service.delete(id).subscribe({
        next: () => {
          this.toast.show("Offre supprimée");
          this.loadOffers();
        },
        error: () => this.toast.show("Erreur lors de la suppression"),
      });
    }
  }

  reset(): void {
    this.editingId = null;
    this.form.reset();
    this.showForm = false;
    this.showFileSelector = false;
  }

  onFileSelect(fileId: number): void {
    this.form.patchValue({ file_id: fileId });
  }
}
