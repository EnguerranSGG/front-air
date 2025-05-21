import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  onSelect(id: number): void {
    this.fileSelected.emit(id);
  }
}
