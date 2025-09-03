import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { VetService, Vet, VetSearchParams } from '../../core/services/vet';

@Component({
  selector: 'app-vet-list',
  standalone: false,
  templateUrl: './vet-list.html',
  styleUrls: ['./vet-list.scss']
})
export class VetList implements OnInit {
  vets: Vet[] = [];
  specialties: string[] = [];
  searchForm: FormGroup;
  loading = false;
  totalVets = 0;
  pageSize = 9;
  pageIndex = 0;

  getStars(rating: number): number[] {
  // Returns an array like [0,0,0,0,0] so you can *ngFor over it
  return Array(Math.round(rating)).fill(0);
}

getEmptyStars(rating: number): number[] {
  // Returns an array like [0,0,0,0,0] so you can *ngFor over it
  return Array(5 - Math.round(rating)).fill(0);
}


  constructor(
    private vetService: VetService,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      specialty: [''],
      rating: [''],
      name: ['']
    });
  }

  ngOnInit(): void {
    this.loadVets();
    this.loadSpecialties();
    
    this.searchForm.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.loadVets();
    });
  }

  loadVets(): void {
    this.loading = true;
    const params: VetSearchParams = {
      ...this.searchForm.value,
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    this.vetService.getVets(params).subscribe({
      next: (response) => {
        this.vets = response.vets;
        this.totalVets = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load vets:', error);
        this.loading = false;
      }
    });
  }

  loadSpecialties(): void {
    this.vetService.getVetSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties;
      },
      error: (error) => {
        console.error('Failed to load specialties:', error);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVets();
  }

  clearFilters(): void {
    this.searchForm.reset();
  }
}