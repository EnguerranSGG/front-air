import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { PageLoaderService } from '../../services/page-loader.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
})
export class FileComponent implements OnInit {
  fileForm!: FormGroup;
  files: any[] = [];
  selectedFile: File | null = null;
  editingFileId: number | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private toastService: ToastService,
    private pageLoaderService: PageLoaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getFiles();
  }

  // Initialisation du formulaire
  private initForm(): void {
    this.fileForm = this.fb.group({
      name: ['', Validators.required],
      file: [null, Validators.required],
    });
  }

  // Récupère les fichiers existants
  getFiles(): void {
    const PROTECTED_FILE_IDS = [8, 11, 16, 17, 18, 26, 27, 28, 29, 30];

    this.isLoading = true;
    const filesPromise = firstValueFrom(this.fileService.getAll());
    
    // Créer une promesse qui attend que tout soit vraiment chargé et visible
    // C'est la SEULE promesse qu'on enregistre dans le PageLoaderService
    const domReadyPromise = filesPromise
      .then(async (files) => {
        this.files = files.filter(
          (file) => !PROTECTED_FILE_IDS.includes(file.file_id)
        );

        // Forcer la détection de changement
        this.cdr.detectChanges();
        
        // Attendre que le navigateur ait rendu le DOM (comme côté vitrine)
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve(undefined);
            });
          });
        });
        
        // Mettre isLoading à false
        this.isLoading = false;
        
        // Forcer à nouveau la détection de changement
        this.cdr.detectChanges();
        
        // Attendre que le contenu soit visible dans le DOM
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Délai supplémentaire pour garantir que le contenu est visible
              setTimeout(() => resolve(undefined), 200);
            });
          });
        });
      })
      .catch((error) => {
        this.toastService.show('Erreur lors du chargement des fichiers');
        this.isLoading = false;
        throw error;
      });

    // Enregistrer cette promesse finale qui attend que le DOM soit vraiment prêt
    this.pageLoaderService.registerPageLoad(domReadyPromise);
  }

  // Gère la sélection de fichier
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileForm.patchValue({ file: this.selectedFile });

      // Nom automatique du fichier (non modifiable)
      this.fileForm.patchValue({ name: this.selectedFile.name });

      // Forcer la mise à jour du champ name
      this.fileForm.get('name')?.updateValueAndValidity();
    }
  }

  // Crée ou met à jour un fichier
  onSubmit(): void {
    if (!this.fileForm.valid || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Pour la création seulement, ajouter le nom
    if (!this.editingFileId) {
      formData.append('name', this.selectedFile.name);
    }

    const request = this.editingFileId
      ? this.fileService.update(this.editingFileId, formData)
      : this.fileService.create(formData);

    request.subscribe({
      next: () => {
        this.toastService.show(
          `Fichier ${this.editingFileId ? 'modifié' : 'créé'} avec succès`
        );
        this.getFiles();
        this.resetForm();
      },
      error: () => this.toastService.show("Erreur lors de l'envoi du fichier"),
    });
  }

  // Prépare le formulaire pour modification
  onEdit(file: any): void {
    this.editingFileId = file.file_id;
    // Vider le champ nom - il sera rempli lors de la sélection du fichier
    this.fileForm.patchValue({ name: '' });

    // Scroll vers le haut - méthode simplifiée et fiable
    setTimeout(() => {
      const formElement = document.querySelector('.create-form');
      if (formElement) {
        formElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }, 100);
  }

  // Supprime un fichier
  onDelete(id: number): void {
    this.fileService.delete(id).subscribe({
      next: () => {
        this.toastService.show('Fichier supprimé avec succès');
        this.getFiles();
      },
      error: () => this.toastService.show('Erreur lors de la suppression'),
    });
  }

  // Télécharge un fichier
  onDownload(file: any): void {
    this.fileService.download(file.file_id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Réinitialise le formulaire
  resetForm(): void {
    this.fileForm.reset();
    this.selectedFile = null;
    this.editingFileId = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
