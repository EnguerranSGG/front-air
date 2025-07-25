import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { FileEntity } from '../../models/file.model';
import { firstValueFrom } from 'rxjs';

interface FleItem {
  id: number;
  title: string;
  description: string;
  file: FileEntity | null;
  imageUrl: string;
}

@Component({
  selector: 'app-fle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SanitizePipe],
  templateUrl: './fle.component.html',
  styleUrls: ['./fle.component.scss'],
})
export class FleComponent implements OnInit {
  fleItems: FleItem[] = [];
  selectedItem: FleItem | null = null;
  selectedFile: File | null = null;
  isModalOpen = false;
  updateForm!: FormGroup;
  isLoading = true;

  constructor(
    private fileService: FileService, 
    private authService: AuthService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFleItems();
  }

  initForm(): void {
    this.updateForm = this.fb.group({
      title: ['']
    });
  }

  loadFleItems(): void {
    this.isLoading = true;
    
    // IDs des fichiers FLE basés sur le composant FleSection.astro
    const fleFileIds = [
      { id: 11, title: 'Image principale FLE', description: 'Image principale de la section FLE. Pas de PDF.' },
      { id: 26, title: 'Satisfaction des stagiaires', description: 'Tableau de satisfaction des stagiaires FLE. Pas de PDF.' },
      { id: 27, title: 'Code de la route 1', description: 'Tableau des auto-évaluations du code de la route. Pas de PDF.' },
      { id: 28, title: 'Code de la route 2', description: 'Tableau des d\'acquisitions de compétences du code de la route. Pas de PDF.' },
      { id: 29, title: 'FLE pro et numérique 1', description: 'Tableau des auto-évaluations du FLE pro et numérique. Pas de PDF.' },
      { id: 30, title: 'FLE pro et numérique 2', description: 'Tableau des d\'acquisitions de compétences du FLE pro et numérique. Pas de PDF.' },
      { id: 16, title: 'Flyer FLE', description: 'Flyer de présentation du FLE. PDF uniquement.' },
      { id: 18, title: 'Certification FLE', description: 'Certification Qualiopi du FLE. PDF uniquement.' }
    ];

    // Charger les informations de chaque fichier
    const loadPromises = fleFileIds.map(item => 
      firstValueFrom(this.fileService.getById(item.id))
        .then(file => ({
          id: item.id,
          title: file?.title || item.title,
          description: item.description,
          file: file || null,
          imageUrl: `${this.fileService.getApiUrl()}/${item.id}/download?ts=${Date.now()}`
        }))
        .catch(() => ({
          id: item.id,
          title: item.title,
          description: item.description,
          file: null,
          imageUrl: ''
        }))
    );

    Promise.all(loadPromises).then(items => {
      this.fleItems = items;
      this.isLoading = false;
    });
  }

  openModal(item: FleItem): void {
    this.selectedItem = item;
    this.isModalOpen = true;
    this.selectedFile = null;
    
    // Remplir le formulaire avec les valeurs actuelles
    this.updateForm.patchValue({
      title: item.title || ''
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedItem = null;
    this.selectedFile = null;
    this.updateForm.reset();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validation de la taille du fichier (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        this.toast.show('Fichier trop volumineux. Taille maximum : 10MB');
        input.value = '';
        this.selectedFile = null;
        return;
      }
      
      this.selectedFile = file;
    }
  }

  updateFleItem(): void {
    if (!this.selectedItem) return;

    // Vérifier l'authentification
    if (!this.authService.isAuthenticated()) {
      this.toast.show('Session expirée. Veuillez vous reconnecter.');
      this.authService.logout();
      return;
    }

    const title = this.updateForm.get('title')?.value;
    const originalTitle = this.selectedItem.file?.title || '';
    
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
      this.fileService.updateMetadata(this.selectedItem.id, title || '').subscribe({
        next: () => {
          this.toast.show('Titre mis à jour');
          this.loadFleItems(); // Recharger pour mettre à jour l'affichage
          this.closeModal();
        },
        error: () => {
          this.toast.show('Erreur lors de la mise à jour du titre');
        },
      });
      return;
    }

    // Si un fichier est sélectionné (avec ou sans changement de titre)
    const formData = new FormData();
    
    // Toujours ajouter le titre (même s'il est vide) pour s'assurer qu'il est mis à jour
    formData.append('title', title || '');

    // Ajouter le fichier
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.fileService.update(this.selectedItem.id, formData).subscribe({
      next: () => {
        this.toast.show('Élément FLE mis à jour');
        this.loadFleItems(); // Recharger pour mettre à jour l'affichage
        this.selectedFile = null;
        this.closeModal();
      },
      error: (error) => {
        // Gestion spécifique des erreurs
        if (error.status === 403) {
          this.toast.show('Accès interdit. Vérifiez vos permissions.');
        } else if (error.status === 413) {
          this.toast.show('Fichier trop volumineux. Réduisez la taille du fichier.');
        } else if (error.status === 401) {
          this.toast.show('Session expirée. Veuillez vous reconnecter.');
        } else {
          this.toast.show('Erreur lors de la mise à jour');
        }
      },
    });
  }

  refreshImage(item: FleItem): void {
    item.imageUrl = `${this.fileService.getApiUrl()}/${item.id}/download?ts=${Date.now()}`;
  }

  isPdfFile(item: FleItem): boolean {
    // Les IDs 16 (flyer) et 18 (certificat) sont des fichiers PDF
    return item.id === 16 || item.id === 18;
  }

  getFileAcceptType(): string {
    if (this.selectedItem && this.isPdfFile(this.selectedItem)) {
      return '.pdf,application/pdf';
    }
    return 'image/*';
  }
} 