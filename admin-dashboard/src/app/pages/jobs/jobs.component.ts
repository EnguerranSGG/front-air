import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { PositionService } from '../../services/position.service';
import { ToastService } from '../../utils/toast/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job',
  templateUrl: './jobs.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./jobs.component.scss'],
})
export class JobComponent implements OnInit {
  jobs: any[] = [];
  positions: any[] = [];
  filteredJobs: any[] = [];

  createForm!: FormGroup;
  editForm!: FormGroup;
  editingId: number | null = null;
  showCreate = false;

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private toast: ToastService,
    private positionService: PositionService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadPositions();

    this.createForm = this.fb.group({
      function: ['', Validators.required],
      position_id: [null, Validators.required],
    });

    this.editForm = this.fb.group({
      function: ['', Validators.required],
      position_id: [null, Validators.required],
    });
  }

  loadJobs(): void {
    this.jobService.getAll().subscribe((data) => {
      this.jobs = data;
      this.filteredJobs = data;
    });
  }

  loadPositions(): void {
    this.positionService.getAll().subscribe((data) => {
      this.positions = data;
    });
  }

  getPositionName(id: number): string {
    return this.positions.find((p) => p.position_id === id)?.name ?? 'N/A';
  }

  onPositionFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filteredJobs = value
      ? this.jobs.filter((j) => j.position_id === +value)
      : this.jobs;
  }

  addJob(): void {
    if (this.createForm.valid) {
      const data = {
        ...this.createForm.value,
        position_id: Number(this.createForm.value.position_id),
      };
      this.jobService.create(data).subscribe(() => {
        this.toast.show('Job ajouté');
        this.createForm.reset();
        this.loadJobs();
      });
    }
  }
  

  startEdit(job: any): void {
    this.editingId = job.job_id;
    this.editForm.patchValue(job);
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset();
  }

  saveEdit(job: any): void {
    if (this.editForm.valid) {
      const data = {
        ...this.editForm.value,
        position_id: Number(this.editForm.value.position_id),
      };
  
      this.jobService.update(job.job_id, data).subscribe(() => {
        this.toast.show('Job modifié');
        this.editingId = null;
        this.loadJobs();
      });
    }
  }
  

  deleteJob(id: number): void {
    this.jobService.delete(id).subscribe(() => {
      this.toast.show('Job supprimé');
      this.loadJobs();
    });
  }
}
