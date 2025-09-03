import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Appointments } from './appointments';

const routes: Routes = [{ path: '', component: Appointments }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }
