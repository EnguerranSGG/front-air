import { Component } from '@angular/core';
import { GovernanceComponent } from '../governance/governance.component';
import { NewsComponent } from '../news/news.component';
import { FlyerComponent } from '../flyer/flyer.component';
import { CertificateComponent } from '../certificate/certificate.component';
import { HomeIllustrationComponent } from '../home-illustration/home-illustration.component';
import { FleIllustrationComponent } from '../fle-illustration/fle-illustration.component';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GovernanceComponent,
    NewsComponent,
    FlyerComponent,
    CertificateComponent,
    HomeIllustrationComponent,
    FleIllustrationComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor() {}

}
