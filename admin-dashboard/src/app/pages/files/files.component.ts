import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-file',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
})
export class FileComponent implements OnInit {
  fileForm!: FormGroup;
  files: any[] = [];
  selectedFile: File | null = null;
  editingFileId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fileForm = this.fb.group({
      name: ['', Validators.required],
      file: [null, Validators.required],
    });

    this.getFiles();
  }

  getFiles(): void {
    this.fileService.getAll().subscribe({
      next: (files) => (this.files = files),
      error: () => this.toastService.show('Erreur lors du chargement des fichiers'),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileForm.patchValue({ file: this.selectedFile });
    }
  }

  onSubmit(): void {
    if (!this.fileForm.valid || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Ajout du nom uniquement si on crée un fichier
    if (!this.editingFileId) {
      formData.append('name', this.fileForm.value.name);
    }

    const request = this.editingFileId
      ? this.fileService.update(this.editingFileId, formData)
      : this.fileService.create(formData);

    request.subscribe({
      next: () => {
        this.toastService.show(`Fichier ${this.editingFileId ? 'modifié' : 'créé'} avec succès`);
        this.getFiles();
        this.resetForm();
      },
      error: () => this.toastService.show("Erreur lors de l'envoi du fichier"),
    });
  }

  onEdit(file: any): void {
    this.editingFileId = file.file_id;
    this.fileForm.patchValue({ name: file.name }); // affiché, mais pas modifiable
  }

  onDelete(id: number): void {
    this.fileService.delete(id).subscribe({
      next: () => {
        this.toastService.show('Fichier supprimé avec succès');
        this.getFiles();
      },
      error: () => this.toastService.show('Erreur lors de la suppression'),
    });
  }

  onDownload(file: any): void {
    this.fileService.download(file.file_id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
   

  resetForm(): void {
    this.fileForm.reset();
    this.selectedFile = null;
    this.editingFileId = null;
  }
}
