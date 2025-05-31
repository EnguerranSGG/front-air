import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../services/news.service';
import { ToastService } from '../../utils/toast/toast.service';
import { environment } from '../../../environments/environment';
import { FileEntity } from '../../models/file.model';
import { News } from '../../models/news.model';
import { FileSelectorComponent } from '../files/files-selector.component';
import { FileService } from '../../services/file.service';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { sanitizeFormValue } from '../../utils/sanitize/sanitize';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileSelectorComponent,
    SanitizePipe,
  ],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  apiUrl = environment.API_URL;
  newsList: News[] = [];
  files: FileEntity[] = [];

  isEditModalOpen = false;

  // Forms
  editForm!: FormGroup;

  // Editing state
  editingNewsId: number | null = null;
  showCreateFileSelector = false;
  showEditFileSelector = false;

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private toast: ToastService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.loadNews();
    this.getFiles();
    this.editForm = this.buildForm();
  }

  private buildForm(news?: News): FormGroup {
    return this.fb.group({
      name: [
        news?.name || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      description: [news?.description || '', [Validators.required]],
      link: [
        news?.link || '',
        [
          Validators.maxLength(255),
          Validators.pattern(/https?:\/\/.+/), // Vérifie que le lien commence par http/https
        ],
      ],
      file_id: [news?.file?.file_id || null],
    });
  }

  // 📥 Load News & Files
  private loadNews(): void {
    this.newsService.getAll().subscribe({
      next: (data) =>
        (this.newsList = data.sort((a, b) => a.name.localeCompare(b.name))),
      error: () => this.toast.show('Erreur lors du chargement des actualités'),
    });
  }

  private getFiles(): void {
    this.fileService.getAll().subscribe({
      next: (files) => (this.files = files),
      error: () => this.toast.show('Erreur lors du chargement des fichiers'),
    });
  }

  // 📎 File Selection
  onFileSelect(fileId: number): void {
    if (this.isEditModalOpen && this.editingNewsId !== null) {
      this.editForm.patchValue({ file_id: fileId });
    }
  }

  // ✏️ Edit News
  openEditModal(news: News): void {
    this.isEditModalOpen = true;
    this.editingNewsId = news.news_id;
    this.editForm = this.buildForm(news);
    this.showEditFileSelector = false;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingNewsId = null;
  }

  saveEdit(): void {
    if (this.editForm.invalid || this.editingNewsId === null) {
      this.toast.show('Le formulaire est invalide.');
      return;
    }

    const sanitizedData = sanitizeFormValue(this.editForm.value);

    this.newsService.update(this.editingNewsId, sanitizedData).subscribe({
      next: () => {
        this.toast.show('Actualité modifiée');
        this.loadNews();
        this.closeEditModal();
      },
      error: () => this.toast.show('Erreur lors de la modification'),
    });
  }
}
