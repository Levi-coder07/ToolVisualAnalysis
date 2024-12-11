import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSparkboxExplorationComponent } from './new-sparkbox-exploration.component';

describe('NewSparkboxExplorationComponent', () => {
  let component: NewSparkboxExplorationComponent;
  let fixture: ComponentFixture<NewSparkboxExplorationComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSparkboxExplorationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewSparkboxExplorationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});


