import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetList } from './vet-list';

describe('VetList', () => {
  let component: VetList;
  let fixture: ComponentFixture<VetList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VetList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
