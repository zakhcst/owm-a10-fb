import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../modules/shared.module';
import { StatsComponent } from './stats.component';
import { ResolverCitiesService } from '../../modules/routing-resolvers/resolver-cities.service';
import { ResolverIpService } from '../../modules/routing-resolvers/resolver-ip.service';
import { ResolverStatsService } from '../../modules/routing-resolvers/resolver-stats.service';

const componentRoutes: Routes = [
  {
    path: '',
    component: StatsComponent,
    resolve: {
      ip: ResolverIpService,
      cities: ResolverCitiesService,
      stats: ResolverStatsService,
    }
  }
];

@NgModule({
  declarations: [StatsComponent],
  imports: [
    RouterModule.forChild(componentRoutes),
    SharedModule,
  ],
  exports: [RouterModule]
})
export class StatsModule { }