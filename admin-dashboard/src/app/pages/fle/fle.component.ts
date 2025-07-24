import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';
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
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFleItems();
  }

  initForm(): void {
    this.updateForm = this.fb.group({
      title: [''],
      description: ['']
    });
  }

  loadFleItems(): void {
    this.isLoading = true;
    
    // IDs des fichiers FLE basés sur le composant FleSection.astro
    const fleFileIds = [
      { id: 11, title: 'Image principale FLE', description: 'Image principale de la section FLE' },
      { id: 26, title: 'Satisfaction des stagiaires', description: 'Graphique de satisfaction des stagiaires FLE' },
      { id: 27, title: 'Code de la route 1', description: 'Première image du code de la route' },
      { id: 28, title: 'Code de la route 2', description: 'Deuxième image du code de la route' },
      { id: 29, title: 'FLE pro et numérique 1', description: 'Première image FLE pro et numérique' },
      { id: 30, title: 'FLE pro et numérique 2', description: 'Deuxième image FLE pro et numérique' }
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
      title: item.title || '',
      description: item.description || ''
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
      this.selectedFile = input.files[0];
    }
  }

  updateFleItem(): void {
    if (!this.selectedItem) return;

    const title = this.updateForm.get('title')?.value;
    const description = this.updateForm.get('description')?.value;
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

    this.fileService.update(this.selectedItem.id, formData).subscribe({
      next: () => {
        this.toast.show('Élément FLE mis à jour');
        this.loadFleItems(); // Recharger pour mettre à jour l'affichage
        this.selectedFile = null;
        this.closeModal();
      },
      error: () => this.toast.show('Erreur lors de la mise à jour'),
    });
  }

  refreshImage(item: FleItem): void {
    item.imageUrl = `${this.fileService.getApiUrl()}/${item.id}/download?ts=${Date.now()}`;
  }
} 