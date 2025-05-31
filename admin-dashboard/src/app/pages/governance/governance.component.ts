import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';

@Component({
  selector: 'app-governance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SanitizePipe],
  templateUrl: './governance.component.html',
  styleUrls: ['./governance.component.scss'],
})
export class GovernanceComponent implements OnInit {
  organigramId = 17;
  organigramUrl = '';
  selectedFile: File | null = null;
  isModalOpen = false;

  constructor(private fileService: FileService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refreshOrganigram();
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

  updateOrganigram(): void {
    console.log('updateOrganigram() called');

    if (!this.selectedFile) {
      this.toast.show('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.fileService.update(this.organigramId, formData).subscribe({
      next: () => {
        this.toast.show('Organigramme mis à jour');
        this.refreshOrganigram();
        this.selectedFile = null;
        this.closeModal();
      },
      error: () => this.toast.show('Erreur lors de la mise à jour'),
    });
  }

  refreshOrganigram(): void {
    this.organigramUrl = `${this.fileService.getApiUrl()}/${
      this.organigramId
    }/download?ts=${Date.now()}`;
  }
}
