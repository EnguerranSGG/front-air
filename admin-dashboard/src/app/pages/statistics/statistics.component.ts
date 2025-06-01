import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatisticService } from '../../services/statistic.service';
import { ToastService } from '../../utils/toast/toast.service';
import { StatisticTypeService } from '../../services/statistic-type.service';
import { Statistic, StatisticType } from '../../models/statistic.modele';
import { SanitizePipe } from '../../utils/sanitize/sanitize.pipe';
import { sanitizeFormValue } from '../../utils/sanitize/sanitize';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SanitizePipe],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  statistics: Statistic[] = [];
  types: StatisticType[] = [];
  filteredType: number | null = null;
  createForm!: FormGroup;
  editingId: number | null = null;
  editForm!: FormGroup;
  showCreate = false;

  constructor(
    private fb: FormBuilder,
    private statisticService: StatisticService,
    private toast: ToastService,
    private statisticTypeService: StatisticTypeService
  ) {}

  ngOnInit(): void {
    this.loadTypes();
    this.loadStatistics();
    this.createForm = this.buildForm();
  }

  buildForm(statistic?: Statistic): FormGroup {
    return this.fb.group({
      label: [
        statistic?.label || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      value: [
        statistic?.value || 0,
        [Validators.required, Validators.min(0)], 
      ],
      year: [
        statistic?.year || new Date().getFullYear(),
        [Validators.required, Validators.min(1900), Validators.max(2200)],
      ],
      is_percentage: [
        statistic?.is_percentage ?? false,
        [Validators.required],
      ],
      type_id: [
        statistic?.type_id || null,
        [Validators.required, Validators.min(1)], 
      ],
    });
  }
  

  onTypeFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.filteredType = selectedValue ? Number(selectedValue) : null;
    this.loadStatistics();
  }
  

  loadStatistics(): void {
    this.statisticService.getAll().subscribe(data => {
      this.statistics = data;
    });
  }

  loadTypes(): void {
    this.statisticTypeService.getAll().subscribe(data => {
      this.types = data;
    });
  }  

  get filteredStatistics(): Statistic[] {
    if (!this.filteredType) return this.statistics;
    return this.statistics.filter(s => s.type_id === this.filteredType);
  }

  startEdit(stat: Statistic): void {
    this.editingId = stat.statistic_id;
    this.editForm = this.buildForm(stat);
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(statistic_id: number): void {
    if (this.editForm.invalid) {
      this.toast.show('Veuillez corriger le formulaire avant de sauvegarder.');
      return;
    }
  
    const payload = {
      ...this.editForm.value,
      value: Number(this.editForm.value.value),
      year: Number(this.editForm.value.year),
      type_id: Number(this.editForm.value.type_id),
    };
  
    const sanitizedPayload = sanitizeFormValue(payload);
  
    this.statisticService.update(statistic_id, sanitizedPayload).subscribe(() => {
      this.toast.show('Statistique mise à jour');
      this.editingId = null;
      this.loadStatistics();
    });
  }
  
  
  addStatistic(): void {
    if (this.createForm.valid) {
      const payload = {
        ...this.createForm.value,
        value: Number(this.createForm.value.value),
        year: Number(this.createForm.value.year),
        type_id: Number(this.createForm.value.type_id),
      };

      const sanitizedPayload = sanitizeFormValue(payload);
  
      this.statisticService.create(sanitizedPayload).subscribe(() => {
        this.toast.show('Statistique ajoutée');
        this.createForm.reset();
        this.showCreate = false;
        this.loadStatistics();
      });
    }
  }
  

  deleteStatistic(id: number): void {
    if (confirm('Supprimer cette statistique ?')) {
      this.statisticService.delete(id).subscribe(() => {
        this.toast.show('Statistique supprimée');
        this.loadStatistics();
      });
    }
  }
}
