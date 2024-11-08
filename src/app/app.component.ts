import { Component , ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
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
import { MatOptionSelectionChange } from '@angular/material/core';
import { isNgContainer } from '@angular/compiler';
import { NgModule } from '@angular/core';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,TimeSeriesChartComponent, RouterLink, OverviewEdaVisualizationComponent, MatGridListModule, MatSelectModule ,HorizonEdaVisualizationComponent,NgFor,DynamicHostDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'visual-analysis-tool';
  @ViewChild(DynamicHostDirective, { static: true }) dynamicHost!: DynamicHostDirective;
  options = ['pca', 'tsne'];
  selectedOption: string = this.options[0];
  componentInstance: any;
  selectedButton: typeof PcaVisualizationComponent | null = PcaVisualizationComponent;
  buttons = [
    { imgSrc: 'assets/img/visualization1.png', altText: 'Visualization 1', component: OverviewEdaVisualizationComponent },
    { imgSrc: 'assets/img/visualization2.png', altText: 'Visualization 2', component: PcaVisualizationComponent }
  ];

  constructor() {}

  ngOnInit() {
    this.createComponent(OverviewEdaVisualizationComponent);
  }

  onButtonClick(component: any) {
    this.createComponent(component);
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
  onOptionChange(option: string) {
    
    this.componentInstance.option = this.selectedOption;
    if (this.componentInstance) {
      this.componentInstance.optionChanged();
    }
  }
}

