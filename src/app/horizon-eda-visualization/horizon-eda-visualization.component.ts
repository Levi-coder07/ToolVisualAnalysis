import { Component, inject,PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Location } from '@angular/common';
import * as d3 from 'd3';
interface SujetoData {
  Sujeto: string;
  Datos: number[];
  Fecha: Date[];
}

@Component({
  selector: 'app-horizon-eda-visualization',
  standalone: true,
  imports: [],
  templateUrl: './horizon-eda-visualization.component.html',
  styleUrl: './horizon-eda-visualization.component.css'
})

export class HorizonEdaVisualizationComponent {
  private platformId: object;
  private  margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width = 550 - this.margin.left - this.margin.right;
  private height = 450 - this.margin.top - this.margin.bottom;
  private data: SujetoData[] = [];
  private baseUrl = 'http://localhost:4200';
  constructor(private location:Location) {
    this.platformId = inject(PLATFORM_ID);
    
  }
  
  
  
  public loadData() {
    d3.json<SujetoData[]>('assets/eda_complete_A.json').then((data) => {
      if (data === undefined) {
        console.error("No data loaded.");
        return;
      }
      this.data = data;
      this.createChart();
      console.log(this.data);
    }).catch((error) => {
      console.error('Error loading JSON file:', error);
    });
  }

  private createChart() {
    const marginTop = 30;
  const marginRight = 10;
  const marginBottom = 0;
  const marginLeft = 10;
  const width = 928;
  const size = 25; // height of each band
  const padding = 1;
    const svg = d3.select("#chart-horizon").append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

      const sujetos = this.data.map(d => d.Sujeto);
    const sujetoDeseado = 'S5'; // Sujeto específico cuyo rango de fechas quieres usar
    const datoSujeto = this.data.find(d => d.Sujeto === sujetoDeseado);
    if (!datoSujeto) {
      console.error(`No se encontraron datos para el sujeto ${sujetoDeseado}.`);
      return;
    }
      
      const fechasSujeto = datoSujeto.Fecha.map(f => new Date(f));

      // Calcular el rango de fechas
      const fechaMinima = d3.min(fechasSujeto) as Date;
      const fechaMaxima = d3.max(fechasSujeto) as Date;
    console.log(fechaMaxima);

    const bands = 7;
      const xScale = d3.scaleUtc()
      .domain([fechaMinima, fechaMaxima])
      .range([0, this.width]);
    const yScale = d3.scaleLinear()
    .domain([0, d3.max(this.data, d => d3.max(d.Datos))!])
    .range([size, size - bands * (size - padding)]);
      
  
    const area = d3.area<number>()
    .defined(d => !isNaN(d))
    .x((_, i) => xScale((this.data[0].Fecha[i]))) // Assuming Fecha is an array of strings
    .y0(size)
    .y1(d => yScale(d));
   

      const uid = `O-${Math.random().toString(16).slice(2)}`;

      const g = svg.selectAll("g")
      .data(this.data)
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * size + marginTop})`);
  
    // Create defs for clipping and paths
    const defs = g.append("defs");
    defs.append("clipPath")
      .attr("id", (_, i) => `${uid}-clip-${i}`)
      .append("rect")
      .attr("y", padding)
      .attr("width", this.width)
      .attr("height", size - padding);
  
    defs.append("path")
      .attr("id", (_, i) => `${uid}-path-${i}`)
      .attr("d", d => area(d.Datos));
      const scheme = d3.schemeCategory10;
      const colors = scheme[Math.max(0,bands)].slice(Math.max(0,  bands));
    // Use elements for bands
    g.append("g")
    .attr("clip-path", (_, i) => `url(${new URL(`#${uid}-clip-${i}`,   this.baseUrl)})`)
    .selectAll("use")
    .data((_ ,i) => new Array(bands).fill(i))
    .enter().append("use")
      .attr("xlink:href", (i) => `${new URL(`#${uid}-path-${i}`,  this.baseUrl)}`)
      .attr("fill", (_, i) => colors[i])
      .attr("transform", (_, i) => `translate(0,${i * size})`);
  
    // Add labels
    g.append("text")
      .attr("x", 4)
      .attr("y", (size + padding) / 2)
      .attr("dy", "0.35em")
      .text(d => d.Sujeto);
  
    // Add axes
    svg.append("g")
    .attr("transform", `translate(0,${marginTop})`)
    .call(d3.axisTop(xScale).ticks(this.width / 40).tickSizeOuter(0))
    .call(g => g.selectAll<SVGGElement, Date | number>(".tick")
      .filter((d: Date | number) => {
        return xScale(d as Date) < 10 || xScale(d as Date) >= this.width - 10;
      })
      .remove())
    .call(g => g.select(".domain").remove());
  

  
  }
  ngOnInit(): void {
    
    
  }
  
}
  

