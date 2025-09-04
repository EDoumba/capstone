import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { VetGuard } from './core/guards/vet-guard';
import { AdminGuard } from './core/guards/admin-guard';
import { environment } from './environments/environment';




const routes: Routes = [
  { path: '', redirectTo: '/vets', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import(`${this.apiUrl}`./auth/auth-module`).then(m => m.AuthModule) 
  },
  { 
    path: 'user', 
    loadChildren: () => import('./user/user-module').then(m => m.UserModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'vets', 
    loadChildren: () => import('./vets/vets-module').then(m => m.VetsModule) 
  },
  { 
    path: 'appointments', 
    loadChildren: () => import('./appointments/appointments-module').then(m => m.AppointmentsModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'chat', 
    loadChildren: () => import('./chat/chat-module').then(m => m.ChatModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: '**', redirectTo: '/vets' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { private apiUrl = environment.apiUrl;  }