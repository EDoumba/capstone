import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { Auth } from './auth';
import { Login } from './login/login';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register},
  { path: 'forgot-password', component: ForgotPassword }
  //{ path: '', component: Auth }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
