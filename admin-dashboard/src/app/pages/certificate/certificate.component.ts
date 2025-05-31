import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SanitizePipe, PdfViewerModule],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss'],
})
export class CertificateComponent implements OnInit {
  certificateId = 18;
  certificateUrl = '';
  selectedFile: File | null = null;
  isModalOpen = false;

  constructor(private fileService: FileService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refreshCertificate();
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  updateCertificate(): void {

    if (!this.selectedFile) {
      this.toast.show('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.fileService.update(this.certificateId, formData).subscribe({
      next: () => {
        this.toast.show('Certificat mis à jour');
        this.refreshCertificate();
        this.selectedFile = null;
        this.closeModal();
      },
      error: () => this.toast.show('Erreur lors de la mise à jour'),
    });
  }

  refreshCertificate(): void {
    this.certificateUrl = `${this.fileService.getApiUrl()}/${
      this.certificateId
    }/download?ts=${Date.now()}`;
  }
}
