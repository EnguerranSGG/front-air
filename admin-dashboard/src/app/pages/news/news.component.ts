import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../services/news.service';
import { News } from '../../models/news.model';
import { ToastService } from '../../utils/toast/toast.service';
import { environment } from '../../../environments/environment';
import { FileEntity } from '../../models/file.model';
import { FileSelectorComponent } from '../files/files-selector.component';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-news',
  imports: [CommonModule, ReactiveFormsModule, FileSelectorComponent],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  apiUrl = environment.API_URL;
  files: FileEntity[] = [];
  newsList: News[] = [];
  isCreating = false;
  editingNewsId: number | null = null;

  createForm!: FormGroup;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private toast: ToastService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.loadNews();
    this.createForm = this.buildForm();
    this.getFiles();
  }

  buildForm(news?: News): FormGroup {
    return this.fb.group({
      title: [news?.title || '', [Validators.required, Validators.maxLength(100)]],
      content: [news?.content || '', [Validators.required]],
      file_id: [news?.file?.file_id || null]
    });
  }

  getFiles(): void {
    this.fileService.getAll().subscribe({
      next: (files) => (this.files = files),
      error: () => this.toast.show('Erreur lors du chargement des fichiers'),
    });
  }

  onFileSelect(fileId: number): void {
    if (this.editingNewsId !== null) {
      this.editForm.patchValue({ file_id: fileId });
    } else {
      this.createForm.patchValue({ file_id: fileId });
    }
  }

  loadNews(): void {
    this.newsService.getAll().subscribe(data => {
      this.newsList = data.sort((a, b) => a.title.localeCompare(b.title));
    });
  }

  startCreate(): void {
    this.isCreating = true;
    this.createForm = this.buildForm();
  }

  cancelCreate(): void {
    this.isCreating = false;
  }

  addNews(): void {
    if (this.createForm.valid) {
      this.newsService.create(this.createForm.value).subscribe({
        next: () => {
          this.toast.show('Actualité ajoutée');
          this.loadNews();
          this.isCreating = false;
        },
        error: () => this.toast.show('Erreur lors de l’ajout'),
      });
    }
  }

  startEdit(news: News): void {
    this.editingNewsId = news.news_id;
    this.editForm = this.buildForm(news);
  }

  cancelEdit(): void {
    this.editingNewsId = null;
  }

  saveEdit(news: News): void {
    if (this.editForm.valid) {
      this.newsService.update(news.news_id, this.editForm.value).subscribe({
        next: () => {
          this.toast.show('Actualité modifiée');
          this.editingNewsId = null;
          this.loadNews();
        },
        error: () => this.toast.show('Erreur lors de la modification'),
      });
    }
  }

  deleteNews(id: number): void {
    if (confirm('Supprimer cette actualité ?')) {
      this.newsService.delete(id).subscribe(() => {
        this.toast.show('Actualité supprimée');
        this.loadNews();
      });
    }
  }
}
