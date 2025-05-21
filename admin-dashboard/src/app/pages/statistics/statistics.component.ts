import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatisticService } from '../../services/statistic.service';
import { ToastService } from '../../utils/toast/toast.service';
import { StatisticTypeService } from '../../services/statistic-type.service';
import { Statistic, StatisticType } from '../../models/statistic.modele';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
      label: [statistic?.label || '', Validators.required],
      value: [statistic?.value || 0, [Validators.required, Validators.min(0)]],
      year: [statistic?.year || new Date().getFullYear(), Validators.required],
      type_id: [null, Validators.required],
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

  saveEdit(stat: Statistic): void {
    if (this.editForm.valid) {
      const payload = {
        ...this.editForm.value,
        type_id: Number(this.editForm.value.type_id),
      };
  
      this.statisticService.update(stat.statistic_id, payload).subscribe(() => {
        this.toast.show('Statistique mise à jour');
        this.editingId = null;
        this.loadStatistics();
      });
    }
  }
  
  addStatistic(): void {
    if (this.createForm.valid) {
      const payload = {
        ...this.createForm.value,
        type_id: Number(this.createForm.value.type_id),
      };
  
      this.statisticService.create(payload).subscribe(() => {
        this.toast.show('Statistique ajoutée');
        this.createForm.reset();
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
