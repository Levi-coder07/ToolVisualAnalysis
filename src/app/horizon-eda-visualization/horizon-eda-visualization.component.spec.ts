import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonEdaVisualizationComponent } from './horizon-eda-visualization.component';

describe('HorizonEdaVisualizationComponent', () => {
  let component: HorizonEdaVisualizationComponent;
  let fixture: ComponentFixture<HorizonEdaVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizonEdaVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HorizonEdaVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
