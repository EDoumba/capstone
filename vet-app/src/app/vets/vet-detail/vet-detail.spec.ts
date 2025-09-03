import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetDetail } from './vet-detail';

describe('VetDetail', () => {
  let component: VetDetail;
  let fixture: ComponentFixture<VetDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VetDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
