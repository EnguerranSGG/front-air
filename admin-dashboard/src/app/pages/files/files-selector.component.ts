import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { FileEntity } from '../../models/file.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-file-selector',
  templateUrl: './files-selector.component.html',
  styleUrls: ['./files-selector.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class FileSelectorComponent {
  apiUrl = environment.API_URL;

  @Input() files: FileEntity[] = [];
  @Input() selectedFileId: number | null = null;
  @Output() fileSelected = new EventEmitter<number>();

  // Filtrage des fichiers protégés (même logique que dans files.component.ts)
  private readonly PROTECTED_FILE_IDS = [8, 11, 16, 17, 18, 26, 27, 28, 29, 30];
  
  // Propriété computed qui filtre automatiquement les fichiers protégés
  filteredFiles = computed(() => {
    return this.files.filter(file => !this.PROTECTED_FILE_IDS.includes(file.file_id));
  });

  onSelect(id: number): void {
    this.fileSelected.emit(id);
  }
}
