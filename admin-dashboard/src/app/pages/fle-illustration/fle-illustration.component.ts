import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';

@Component({
  selector: 'app-fle-illustration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SanitizePipe],
  templateUrl: './fle-illustration.component.html',
  styleUrls: ['./fle-illustration.component.scss'],
})
export class FleIllustrationComponent implements OnInit {
  fleIllustrationId = 11;
  fleIllustrationUrl = '';
  selectedFile: File | null = null;
  isModalOpen = false;

  constructor(private fileService: FileService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refreshFleIllustration();
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

  updateFleIllustration(): void {

    if (!this.selectedFile) {
      this.toast.show('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.fileService.update(this.fleIllustrationId, formData).subscribe({
      next: () => {
        this.toast.show('Image du FLE mise à jour');
        this.refreshFleIllustration();
        this.selectedFile = null;
        this.closeModal();
      },
      error: () => this.toast.show('Erreur lors de la mise à jour'),
    });
  }

  refreshFleIllustration(): void {
    this.fleIllustrationUrl = `${this.fileService.getApiUrl()}/${
      this.fleIllustrationId
    }/download?ts=${Date.now()}`;
  }
}
