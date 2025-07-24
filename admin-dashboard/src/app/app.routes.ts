import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HistoryComponent } from './pages/history/history.component';
import { ValuesComponent } from './pages/values/values.component';
import { AuthGuard } from './auth.guard';
import { StructureComponent } from './pages/structures/structures.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { JobOfferComponent } from './pages/job-offers/job-offers.component';
import { FileComponent } from './pages/files/files.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CounselorComponent } from './pages/counselor/counselor.component';
import { PresentationEditComponent } from './pages/presentation/presentation-edit.component';
import { FleComponent } from './pages/fle/fle.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
  { path: 'values', component: ValuesComponent, canActivate: [AuthGuard] },
  { path: 'structures', component: StructureComponent, canActivate: [AuthGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'files', component: FileComponent, canActivate: [AuthGuard] },
  { path: 'job-offers', component: JobOfferComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'counselors', component: CounselorComponent, canActivate: [AuthGuard] },
  { path: 'presentation/edit/:id', component: PresentationEditComponent, canActivate: [AuthGuard] },
  { path: 'fle', component: FleComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
