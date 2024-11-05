import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroTelemedicinaComponent } from './registro-telemedicina.component';

describe('RegistroTelemedicinaComponent', () => {
  let component: RegistroTelemedicinaComponent;
  let fixture: ComponentFixture<RegistroTelemedicinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroTelemedicinaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroTelemedicinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
