import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { FileEntity } from '../../models/file.model';

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
  homeIllustrationFile: FileEntity | null = null;
  selectedFile: File | null = null;
  isModalOpen = false;
  updateForm!: FormGroup;

  constructor(
    private fileService: FileService, 
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.refreshHomeIllustration();
    this.loadFileInfo();
    this.initForm();
  }

  initForm(): void {
    this.updateForm = this.fb.group({
      title: ['']
    });
  }

  loadFileInfo(): void {
    this.fileService.getById(this.homeIllustrationId).subscribe({
      next: (file) => {
        this.homeIllustrationFile = file;
        this.updateForm.patchValue({
          title: file.title || ''
        });
      },
      error: () => {
        // Silent error, file info is not critical
      }
    });
  }

  openModal(): void {
    this.isModalOpen = true;
    this.updateForm.patchValue({
      title: this.homeIllustrationFile?.title || ''
    });
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

  updateHomeIllustration(): void {
    const title = this.updateForm.get('title')?.value;
    const originalTitle = this.homeIllustrationFile?.title || '';
    
    // Vérifier si le titre a changé
    const titleChanged = title !== originalTitle;
    const hasNewFile = this.selectedFile !== null;

    // Si aucun changement, ne rien faire
    if (!titleChanged && !hasNewFile) {
      this.toast.show('Aucun changement détecté');
      this.closeModal();
      return;
    }

    // Si seulement le titre a changé (pas de nouveau fichier)
    if (titleChanged && !hasNewFile) {
      this.fileService.updateMetadata(this.homeIllustrationId, title || '').subscribe({
        next: () => {
          this.toast.show('Titre mis à jour');
          this.loadFileInfo();
          this.closeModal();
        },
        error: () => this.toast.show('Erreur lors de la mise à jour du titre'),
      });
      return;
    }

    // Si un fichier est sélectionné (avec ou sans changement de titre)
    const formData = new FormData();
    
    // Ajouter le titre s'il est défini
    if (title) {
      formData.append('title', title);
    }

    // Ajouter le fichier
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.fileService.update(this.homeIllustrationId, formData).subscribe({
      next: () => {
        this.toast.show('Image d\'accueil mise à jour');
        this.refreshHomeIllustration();
        this.loadFileInfo();
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
