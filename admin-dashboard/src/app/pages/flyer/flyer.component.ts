import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FileEntity } from '../../models/file.model';

@Component({
  selector: 'app-flyer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SanitizePipe, PdfViewerModule],
  templateUrl: './flyer.component.html',
  styleUrls: ['./flyer.component.scss'],
})
export class FlyerComponent implements OnInit {
  flyerId = 16;
  flyerUrl = '';
  flyerFile: FileEntity | null = null;
  selectedFile: File | null = null;
  isModalOpen = false;
  updateForm!: FormGroup;

  constructor(
    private fileService: FileService, 
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.refreshFlyer();
    this.loadFileInfo();
    this.initForm();
  }

  initForm(): void {
    this.updateForm = this.fb.group({
      // Pas de champ titre pour le flyer
    });
  }

  loadFileInfo(): void {
    this.fileService.getById(this.flyerId).subscribe({
      next: (file) => {
        this.flyerFile = file;
      },
      error: () => {
        // Silent error, file info is not critical
      }
    });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedFile = null;
    this.updateForm.reset();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  updateFlyer(): void {
    // Vérifier qu'un fichier est sélectionné
    if (!this.selectedFile) {
      this.toast.show('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.fileService.update(this.flyerId, formData).subscribe({
      next: () => {
        this.toast.show('Flyer mis à jour');
        this.refreshFlyer();
        this.loadFileInfo();
        this.selectedFile = null;
        this.closeModal();
      },
      error: () => this.toast.show('Erreur lors de la mise à jour'),
    });
  }

  refreshFlyer(): void {
    this.flyerUrl = `${this.fileService.getApiUrl()}/${
      this.flyerId
    }/download?ts=${Date.now()}`;
  }
}
