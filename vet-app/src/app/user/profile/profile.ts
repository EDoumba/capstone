import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService, UserProfile, Pet } from '../../core/services/user';


@Component({
  selector: 'app-profile',
  standalone : false,
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  

})
export class Profile implements OnInit {
  profileForm: FormGroup;
  petForm: FormGroup;
  userProfile: UserProfile | null = null;
  loading = false;
  addingPet = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['']
    });

    this.petForm = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      breed: [''],
      age: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue(profile);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.userService.updateProfile(this.profileForm.value).subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  addPet(): void {
    if (this.petForm.valid) {
      this.loading = true;
      this.userService.addPet(this.petForm.value).subscribe({
        next: (pet) => {
          if (this.userProfile) {
            this.userProfile.pets.push(pet);
          }
          this.petForm.reset();
          this.addingPet = false;
          this.snackBar.open('Pet added successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to add pet', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  deletePet(petId: number): void {
    this.loading = true;
    this.userService.deletePet(petId).subscribe({
      next: () => {
        if (this.userProfile) {
          this.userProfile.pets = this.userProfile.pets.filter(pet => pet.id !== petId);
        }
        this.snackBar.open('Pet removed successfully', 'Close', { duration: 3000 });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to remove pet', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}