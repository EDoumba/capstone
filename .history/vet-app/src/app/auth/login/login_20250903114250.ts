import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
  loginForm: FormGroup;
  loading = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Redirect URL after login
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  ngOnInit(): void {
    // If user is already logged in, redirect
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        // Save token and user are already handled by AuthService
        this.snackBar.open(`Welcome ${response.user.first_name}!`, 'Close', { duration: 3000 });

        // Redirect to dashboard or returnUrl
        this.router.navigate([this.returnUrl]);
        this.loading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.snackBar.open(
          error.error?.message || 'Login failed. Please check your credentials.',
          'Close',
          { duration: 5000 }
        );
        this.loading = false;
      }
    });
  }
}
