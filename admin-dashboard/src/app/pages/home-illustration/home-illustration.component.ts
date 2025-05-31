import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';

@Component({
  selector: 'app-home-illustration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SanitizePipe],
  templateUrl: './home-illustration.component.html',
  styleUrls: ['./home-illustration.component.scss'],
})
export class HomeIllustrationComponent implements OnInit {
  homeIllustrationId = 8;
  homeIllustrationUrl = '';
  selectedFile: File | null = null;
  isModalOpen = false;

  constructor(private fileService: FileService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refreshHomeIllustration();
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

  updateHomeIllustration(): void {

    if (!this.selectedFile) {
      this.toast.show('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.fileService.update(this.homeIllustrationId, formData).subscribe({
      next: () => {
        this.toast.show('Image d\'accueil mis à jour');
        this.refreshHomeIllustration();
        this.selectedFile = null;
        this.closeModal();
      },
      error: () => this.toast.show('Erreur lors de la mise à jour'),
    });
  }

  refreshHomeIllustration(): void {
    this.homeIllustrationUrl = `${this.fileService.getApiUrl()}/${
      this.homeIllustrationId
    }/download?ts=${Date.now()}`;
  }
}
