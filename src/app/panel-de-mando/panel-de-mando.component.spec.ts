import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDeMandoComponent } from './panel-de-mando.component';

describe('PanelDeMandoComponent', () => {
  let component: PanelDeMandoComponent;
  let fixture: ComponentFixture<PanelDeMandoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelDeMandoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelDeMandoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
