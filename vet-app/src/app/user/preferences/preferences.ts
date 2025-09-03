import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-preferences',
  standalone: false,
  templateUrl: './preferences.html',
  styleUrls: ['./preferences.scss'],
})
export class Preferences implements OnInit {
  preferencesForm!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.preferencesForm = this.fb.group({
      // Email Notifications
      emailAppointmentReminders: [true],
      emailPromotions: [false],
      emailNewsletter: [false],

      // Push Notifications
      pushAppointmentReminders: [true],
      pushMessages: [true],
      pushPromotions: [false],

      // Appearance
      theme: ['light', Validators.required],
      language: ['en', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.preferencesForm.invalid) return;

    this.loading = true;
    const preferences = this.preferencesForm.value;

    // Simulate save action
    setTimeout(() => {
      console.log('Preferences saved:', preferences);
      this.loading = false;
    }, 1000);
  }

  resetForm(): void {
    this.preferencesForm.reset({
      emailAppointmentReminders: true,
      emailPromotions: false,
      emailNewsletter: false,
      pushAppointmentReminders: true,
      pushMessages: true,
      pushPromotions: false,
      theme: 'light',
      language: 'en'
    });
  }
}
