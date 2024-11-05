import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraciasTelemedicinaComponent } from './gracias-telemedicina.component';

describe('GraciasTelemedicinaComponent', () => {
  let component: GraciasTelemedicinaComponent;
  let fixture: ComponentFixture<GraciasTelemedicinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraciasTelemedicinaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraciasTelemedicinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
