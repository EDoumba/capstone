import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Vets } from './vets';
import { VetList } from './vet-list/vet-list';
import { VetDetail } from './vet-detail/vet-detail';




const routes: Routes = [
  { path: '', component: VetList },
  { path: ':id', component: VetDetail },
  { path: '', component: Vets }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VetsRoutingModule { }