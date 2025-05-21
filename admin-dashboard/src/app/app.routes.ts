import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HistoryComponent } from './pages/history/history.component';
import { ValuesComponent } from './pages/values/values.component';
import { AuthGuard } from './auth.guard';
import { StructureComponent } from './pages/structures/structures.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { StepComponent } from './pages/steps/steps.component';
import { JobComponent } from './pages/jobs/jobs.component';
import { JobOfferComponent } from './pages/job-offers/job-offers.component';
import { FileComponent } from './pages/files/files.component';
import { NewsComponent } from './pages/news/news.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
  { path: 'values', component: ValuesComponent, canActivate: [AuthGuard] },
  { path: 'structures', component: StructureComponent, canActivate: [AuthGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'steps', component: StepComponent, canActivate: [AuthGuard] },
  { path: 'jobs', component: JobComponent, canActivate: [AuthGuard] },
  { path: 'files', component: FileComponent, canActivate: [AuthGuard] },
  { path: 'job-offers', component: JobOfferComponent, canActivate: [AuthGuard] },
  { path: 'news', component: NewsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
