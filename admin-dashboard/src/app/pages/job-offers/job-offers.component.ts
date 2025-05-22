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

@Component({
  selector: 'app-job-offer',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FileSelectorComponent
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
      name: ['', Validators.required],
      job_type: ['', Validators.required],
      city: [''],
      file_id: [null],
      link: [''],
      description: ['', Validators.required],
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

  selectFile(id: number): void {
    this.form.patchValue({ image_file_id: id });
  }

  loadOffers() {
    this.service.getAll().subscribe({
      next: (data) => {
        console.log('Offres chargées :', data); 
        this.jobOffers = data;
      },
      error: () => this.toast.show("Erreur lors du chargement"),
    });
  }
  

  onSubmit() {
    if (this.form.invalid) return;

    const action = this.editingId
      ? this.service.update(this.editingId, this.form.value)
      : this.service.create(this.form.value);

    action.subscribe({
      next: () => {
        this.toast.show(`Offre ${this.editingId ? 'modifiée' : 'créée'} avec succès`);
        this.loadOffers();
        this.reset();
      },
      error: () => this.toast.show("Erreur lors de l'enregistrement"),
    });
  }

  edit(offer: any) {
    this.editingId = offer.job_offer_id;
    this.form.patchValue(offer);
  }

  delete(id: number) {
    this.service.delete(id).subscribe({
      next: () => {
        this.toast.show("Offre supprimée");
        this.loadOffers();
      },
      error: () => this.toast.show("Erreur lors de la suppression"),
    });
  }

  reset() {
    this.editingId = null;
    this.form.reset();
  }
}
