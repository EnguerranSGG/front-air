import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';

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
  selectedFile: File | null = null;
  isModalOpen = false;

  constructor(private fileService: FileService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refreshFlyer();
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

  updateFlyer(): void {

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
