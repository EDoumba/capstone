import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Vets } from './vets';

describe('Vets', () => {
  let component: Vets;
  let fixture: ComponentFixture<Vets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Vets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Vets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
