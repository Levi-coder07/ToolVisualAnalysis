import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit , inject , PLATFORM_ID} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-time-series-chart',
  standalone: true,
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.css']
})
export class TimeSeriesChartComponent implements OnInit {
 
  private platformId: object;
  constructor() {
    this.platformId = inject(PLATFORM_ID);
    
  }
  private createChart() {
    // Your existing D3 code here
    // ...
    const margin = {top: 20, right: 20, bottom: 30, left: 50},
                  width = 960 - margin.left - margin.right,
                  height = 500 - margin.top - margin.bottom;
    


    const svg = d3.select("#chart").append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
   
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("assets/cluster_results.csv").then(function(data) {
      console.log("Data loaded:", data);
      const maxValuesCount = d3.max(data,d => Object.keys(d).filter(key => key.startsWith('Valor_')).length);
      
      const completeData = data.filter(d => Object.keys(d).filter(key => key.startsWith('Valor_')).length === maxValuesCount);
      const clusters = d3.group(completeData, d => d['clusterNumero']);
      console.log("Clusters:", clusters); 
      const min = d3.min(completeData, d => d3.min(Object.keys(d).filter(key => key.startsWith('Valor_')).map(key => +d[key])));
      const max = d3.max(completeData, d => d3.max(Object.keys(d).filter(key => key.startsWith('Valor_')).map(key => +d[key])));
      console.log("Min:", max as number); 
      const x = d3.scaleLinear()
                .domain([0, maxValuesCount as number - 1])
                .range([0, width]);
      const y = d3.scaleLinear()
                .domain([min as number,
                         max as number])
                .nice()
                .range([height, 0]);

                const line = d3.line<number>()
  .x((d, i) => x(i)) // Use xScale for x-coordinate
  .y(d => y(d));  // Map the entire time series value
             // cessing the second element of the tuple
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        
        clusters.forEach((values, cluster) => {
          const clusterGroup = svg.append("g");x

          for (let i = 0; i < values.length; i++) {
              const d = values[i];
              const timeSeries = Object.keys(d)
                  .filter(key => key.startsWith('Valor_')  && +d[key] !== 0 )
                  .map(key => +d[key]);
              
             
              clusterGroup.append("path")
                  .datum(timeSeries)
                  .attr("class", "line")
                  .attr("d", line )
                  .attr("stroke", color(cluster))
                  .style("fill","none")
                  .attr("data-subject", d['Sujeto']); 
                clusterGroup.append("text")
                .attr("x", width - 120)
                .attr("y", y(d3.mean(values, d => +d['Valor_0']) as number))
                .attr("dy", ".35em")
                .attr("fill", color(cluster))
                .text(`Sujeto ${d['Sujeto']}`);
                   

          }

          clusterGroup.append("text")
              .attr("x", width - 40)
              .attr("y", y(d3.mean(values, d => +d['Valor_0']) as number))
              .attr("dy", ".35em")
              .attr("fill", color(cluster))
              .text(`Cluster ${cluster}`);
              
      });
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  svg.append("g")
      .call(d3.axisLeft(y));

    })
    

  }
ngOnInit(): void {
  if(isPlatformBrowser(this.platformId)){
    this.createChart();
  }
  
}
}