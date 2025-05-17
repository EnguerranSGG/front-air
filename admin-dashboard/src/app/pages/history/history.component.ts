import { Component, OnInit } from '@angular/core';
import { TimeService } from '../../services/time.service';
import { Time } from '../../models/time.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  times: Time[] = [];
  editingTimeId: number | null = null;
  editForm!: FormGroup;

  constructor(private timeService: TimeService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadTimes();
  }

  loadTimes(): void {
    this.timeService.getAll().subscribe(data => this.times = data);
  }

  startEdit(time: Time): void {
    this.editingTimeId = time.time_id;
    this.editForm = this.fb.group({
      year: [time.year],
      event_description: [time.event_description]
    });
  }

  cancelEdit(): void {
    this.editingTimeId = null;
  }

  saveEdit(time: Time): void {
    const updated = this.editForm.value;
    this.timeService.update(time.time_id, updated).subscribe(() => {
      this.editingTimeId = null;
      this.loadTimes();
    });
  }

  deleteTime(time_id: number): void {
    if (confirm('Supprimer cet événement ?')) {
      this.timeService.delete(time_id).subscribe(() => this.loadTimes());
    }
  }
}
