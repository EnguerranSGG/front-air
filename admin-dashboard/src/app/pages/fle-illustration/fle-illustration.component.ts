import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { FileEntity } from '../../models/file.model';
import { PageLoaderService } from '../../services/page-loader.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-fle-illustration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SanitizePipe],
  templateUrl: './fle-illustration.component.html',
  styleUrls: ['./fle-illustration.component.scss'],
})
export class FleIllustrationComponent implements OnInit, AfterViewInit {
  @ViewChild('fleImage', { static: false })
  fleImage!: ElementRef<HTMLImageElement>;

  fleIllustrationId = 11;
  fleIllustrationUrl = '';
  fleIllustrationFile: FileEntity | null = null;
  selectedFile: File | null = null;
  isModalOpen = false;
  updateForm!: FormGroup;

  constructor(
    private fileService: FileService,
    private toast: ToastService,
    private fb: FormBuilder,
    private pageLoaderService: PageLoaderService
  ) {}

  ngOnInit(): void {
    this.refreshFleIllustration();
    this.loadFileInfo();
    this.initForm();
  }

  ngAfterViewInit(): void {
    // Attendre un peu pour que l'URL soit définie et que l'image commence à charger
    setTimeout(() => {
      if (this.fleImage?.nativeElement && this.fleIllustrationUrl) {
        const imageLoadPromise = new Promise<void>((resolve, reject) => {
          const img = this.fleImage.nativeElement;
          if (img.complete && img.naturalHeight !== 0) {
            // Image déjà chargée
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => reject();
            // Timeout de sécurité pour éviter que la promesse reste en attente indéfiniment
            setTimeout(() => resolve(), 10000);
          }
        });
        this.pageLoaderService.registerPageLoad(imageLoadPromise);
      }
    }, 100);
  }

  initForm(): void {
    this.updateForm = this.fb.group({
      title: [''],
    });
  }

  loadFileInfo(): void {
    const filePromise = firstValueFrom(
      this.fileService.getById(this.fleIllustrationId)
    );
    this.pageLoaderService.registerPageLoad(filePromise);

    filePromise.then(
      (file) => {
        this.fleIllustrationFile = file;
        // Mettre à jour le formulaire avec le titre actuel
        this.updateForm.patchValue({
          title: file.title || '',
        });
      },
      () => {
        // Silent error, file info is not critical
      }
    );
  }

  openModal(): void {
    this.isModalOpen = true;
    // Réinitialiser le formulaire avec les valeurs actuelles
    this.updateForm.patchValue({
      title: this.fleIllustrationFile?.title || '',
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

  updateFleIllustration(): void {
    const title = this.updateForm.get('title')?.value;
    const originalTitle = this.fleIllustrationFile?.title || '';

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
      this.fileService
        .updateMetadata(this.fleIllustrationId, title || '')
        .subscribe({
          next: () => {
            this.toast.show('Titre mis à jour');
            this.loadFileInfo();
            this.closeModal();
          },
          error: () =>
            this.toast.show('Erreur lors de la mise à jour du titre'),
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

    this.fileService.update(this.fleIllustrationId, formData).subscribe({
      next: () => {
        this.toast.show('Image du FLE mise à jour');
        this.refreshFleIllustration();
        this.loadFileInfo();
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
