import { Component , ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TimeSeriesChartComponent } from './time-series-chart/time-series-chart.component';
import { OverviewEdaVisualizationComponent } from './overview-eda-visualization/overview-eda-visualization.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { HorizonEdaVisualizationComponent } from "./horizon-eda-visualization/horizon-eda-visualization.component";
import { DynamicHostDirective } from './dynamic-host.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PcaVisualizationComponent } from './pca-visualization/pca-visualization.component';
import { MatOptionSelectionChange, MatPseudoCheckbox } from '@angular/material/core';
import { isNgContainer } from '@angular/compiler';
import { NgModule } from '@angular/core';
import { NewSparkboxExplorationComponent } from "./new-sparkbox-exploration/new-sparkbox-exploration.component";
import { AeVisualizationComponent } from './ae-visualization/ae-visualization.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPseudoCheckboxModule } from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatCheckboxModule,RouterOutlet, TimeSeriesChartComponent, AeVisualizationComponent,NewSparkboxExplorationComponent, RouterLink, OverviewEdaVisualizationComponent, MatGridListModule, MatSelectModule,HorizonEdaVisualizationComponent, NgFor, DynamicHostDirective, NewSparkboxExplorationComponent, NgIf, PcaVisualizationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  @ViewChild(DynamicHostDirective, { static: false }) dynamicHost!: DynamicHostDirective;
  showGrid = true;
  onToggleGrid(newValue: boolean): void {
    console.log('Toggle Grid:', newValue);
    this.showGrid = !this.showGrid;
  }
  title = 'visual-analysis-tool';
  selectedPrueba: string = 'TSST';
  options = ['pca', 'tsne'];
  selectedOption: string = this.options[0];
  autoencoder: string = "autoencoder";
  estadistico: string = "estadistico";
  componentInstance: any;
  @ViewChild('pcaVisualization') pcaVisualization!: PcaVisualizationComponent;
  @ViewChild('aeVisualization') aeVisualization!: AeVisualizationComponent;
  selectedButton: typeof PcaVisualizationComponent | null = PcaVisualizationComponent;
  buttons = [
    { imgSrc: 'assets/img/visualization1.png', altText: 'Visualization 1', component: OverviewEdaVisualizationComponent },
    { imgSrc: 'assets/img/visualization2.png', altText: 'Visualization 2', component: PcaVisualizationComponent }
  ];
  isEDASelected = false;
  isTEMPSelected = false;
  isBVPSelected = false;
  constructor() {}

  onInit() {
    
    
    
    
  }
  
  selectedCheckbox: string = "eda"; // Track which checkbox is selected

  onCheckboxChange(selected: string): void {
    // Update the selected checkbox
    this.selectedCheckbox = selected;
    console.log(`Selected checkbox: ${this.selectedCheckbox}`);
    if (this.pcaVisualization) {
      this.pcaVisualization.onSingalChange(this.selectedCheckbox);
    } // P
    if (this.aeVisualization) {
      this.aeVisualization.onSingalChange(this.selectedCheckbox);
    } // 
  }
  goBack() {
    this.showGrid = false; // Go back to the initial component
  }
  onRectangleClick(data: any) {
    console.log('Rectangle clicked:', data);
    this.showGrid = true; // Show the grid layout when a rectangle is clicked
  }

  createComponent(component: any) {
    if (this.dynamicHost) {
      const viewContainerRef = this.dynamicHost.viewContainerRef;
      viewContainerRef.clear();
      const ComponenRef = viewContainerRef.createComponent(component);
      this.componentInstance = ComponenRef.instance;
      (ComponenRef.instance as any).option = this.selectedOption;
    } else {
      console.error('DynamicHostDirective is not available.');
    }
    
  }
  onPruebaClicked(prueba: string) {
    console.log('Prueba clicked:', prueba);
    this.selectedPrueba = prueba;
    if (this.pcaVisualization) {
      this.pcaVisualization.onButtonClick(this.selectedPrueba);
    } // Pass the clicked "prueba" to the other component
    if (this.aeVisualization) {
      this.aeVisualization.onButtonClick(this.selectedPrueba);
    } 
  }
  onOptionChange(option: string) {
    
   
    if (this.pcaVisualization) {
      this.pcaVisualization.optionChanged(this.selectedOption);
    }
     
    this.aeVisualization.optionChanged(this.selectedOption);
  }
}

