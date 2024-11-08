import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewEdaVisualizationComponent } from './overview-eda-visualization.component';

describe('OverviewEdaVisualizationComponent', () => {
  let component: OverviewEdaVisualizationComponent;
  let fixture: ComponentFixture<OverviewEdaVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewEdaVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OverviewEdaVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
