
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit , inject , PLATFORM_ID, Renderer2 , Input, numberAttribute} from '@angular/core';
import * as d3 from 'd3';
import { D3ZoomEvent } from 'd3';
import { DataService } from '../data-eda-b.service';
import { ZoomTransform } from 'd3';
import { MatCommonModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgModel, NgModelGroup } from '@angular/forms';
interface Cuestionarios {
  PANAS: number | null;
  STAI: number | null;
  DIM: number | null;
  SSSQ: number | null;
}
interface CuestionariosBase {
  Base: Cuestionarios;
  TSST: Cuestionarios;
  'Medi 1': Cuestionarios;
  Fun: Cuestionarios;
  'Medi 2': Cuestionarios;
}

interface SujetoQuestion {
  Sujeto: string;
  Cuestionarios: CuestionariosBase;
}

interface SujetoData {
  Sujeto: string;
  Datos: number[];
  Fecha: Date[];
}

export interface ClusterData {
  [key: string]: string[];
}
export interface ClusterInfo {
  type: string;
  metric: string;
  data: ClusterData;
}
interface IntervaloPrueba {
  Prueba: string;
  Inicio: string; // Date en formato string
  Fin: string; // Date en formato string
}
interface IntervalosPruebas {
  Subject: string;
  Pruebas: IntervaloPrueba[];
}
interface pca_data {
  Sujeto : string;
  Point : number[];
}
@Component({
  selector: 'app-pca-visualization',
  standalone: true,
  imports: [MatCommonModule,MatSelectModule,CommonModule],
  templateUrl: './pca-visualization.component.html',
  styleUrl: './pca-visualization.component.css',
  providers : [DataService]
})
export class PcaVisualizationComponent {
  @Input() option! : string;
  selectedClusterCount: number = 2; // Default cluster count
  selectedMetricType: string = 'dtw'; // Default metric type
  clusterCounts = [2, 3, 4, 5];
  valor : number = 0;
  private platformId: object;
  private  margin = {top: 10, right: 0, bottom: 10, left: 20};
  private width = 500 - this.margin.left - this.margin.right;
  private height = 220 - this.margin.top - this.margin.bottom;
  private data: SujetoData[] = [] ;
  private pca_data : pca_data[] = [];
  public title : string = "Scatter Plot - Overview";
  names_pca: string[] = ["eda_pca","eda_segments_pca","fun_pca_eda", "tsst_pca_eda" ];
  names_tsne: string[] = ["eda_tsne","eda_segments_tsne","fun_tsne_eda", "tsst_tsne_eda" ];
  names_options_cluster: string[] = ["complete","segments","fun", "tsst" ];
  metrics: string[] = ["dtw" ,"softdtw" ];
  names: any;
  private clusters: ClusterInfo[] = [];
  constructor(private renderer: Renderer2 , private DataService : DataService) {
    this.platformId = inject(PLATFORM_ID);
    
  }
  optionChanged() {
    let index = 0;
    if(this.option == 'pca'){
      this.names = this.names_pca;
    }else{
      this.names = this.names_tsne;
    }
    this.valor = index;
    this.title = `Scatter Plot - ${this.names[index]}`;
    this.pointPlot(this.data, this.names[index]);
  }
  onButtonClick(index: number): void {
    if(this.option == 'pca'){
      this.names = this.names_pca;
    }else{
      this.names = this.names_tsne;
    }
    this.valor = index;
    this.title = `Scatter Plot - ${this.names[index]}`;
    this.pointPlot(this.data, this.names[index]);
  }
  private handleZoom(e : any): void {
    
    d3.select('svg g')
    
    .attr('transform', e.transform);
  }
  onClusterCountChange(count: number): void {
    if(this.option == 'pca'){
      this.names = this.names_pca;
    }else{
      this.names = this.names_tsne;
    }
    this.selectedClusterCount = count;
    this.pointPlot(this.data,this.names[this.valor]);
  }

  onMetricTypeChange(type: string): void {
    if(this.option == 'pca'){
      this.names = this.names_pca;
    }else{
      this.names = this.names_tsne;
    }
    this.selectedMetricType = type;
    this.pointPlot(this.data,this.names[this.valor]);
  }
  private pointPlot(data : SujetoData[],name: string){
    d3.selectAll("#chart-overview svg").remove();
    let svg = d3.select("#chart-overview").append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)
  
    
    .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
   
    d3.json<pca_data[]>(`assets/${name}.json`).then((pca_tsst) => {

      if (pca_tsst === undefined) {
        console.error("No data loaded.");
        return;
      }
      const sujetos =pca_tsst.map(d => d.Sujeto);
      const sujetos1: string[] = [];
  for (let i = 2; i <= 17; i++) {
    if(i==12){
      continue;
    }
      sujetos1.push(`S${i}`);
  }
  
  console.log("Sujetps" , sujetos);

  let maxX = d3.max(pca_tsst, d => d.Point[0]);
    let maxY = d3.max(pca_tsst, d => d.Point[1]);
    let minX = d3.min(pca_tsst, d => d.Point[0]);
    let minY = d3.min(pca_tsst, d => d.Point[1]);
    if(this.option == 'tsne'){
      if(maxY  && minY){
        maxY = maxY + 100;
        minY = minY - 100; 
      }
      if(maxX && minX){
        maxX = maxX + 100;
        minX = minX - 100;
      }
    }
      
      else{
        if(maxY  && minY){
          maxY = maxY + 300;
          minY = minY - 300; 
        }
        if(maxX && minX){
          maxX = maxX + 500;
          minX = minX - 500;
        }
      }
    // Configurar las escalas
    const xLine = d3.scaleLinear()
      .domain([minX ||0, maxX|| 0 ])
      .range([0, this.width]);

    const yLine = d3.scaleLinear()
      .domain([minY ||0, maxY || 0])
      .range([this.height, 0]);
      console.log("Datos cargados:", pca_tsst);
      const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(sujetos);
      console.log(sujetos);
      let index = 0;
      let index2 = 0;
      sujetos.forEach(sujeto => {
        
      });
      
      let zoom = d3.zoom()
         .scaleExtent([0.5 , 32])
         .on("zoom", zoomed) as any;
         var event_rect = svg.append("rect")
    	.attr("width", this.width )
    	.attr("height", this.height )
    	.style("fill", "none")
    	.style("pointer-events", "all")
    
    	.call(zoom);
  function zoomed({ transform }: { transform: ZoomTransform }){
            var new_x = transform.rescaleX(xLine);
            var new_y = transform.rescaleY(yLine);
          // update axes
         
          if (pca_tsst) {
            points.data(pca_tsst)
                  .attr('cx', function(d) { return new_x(d.Point[0]); })
                  .attr('cy', function(d) { return new_y(d.Point[1]); });
          } else {
            console.warn('pca_tsst is undefined');
          }
                  
            
          }
         console.log("metrica" , this.metrics.findIndex(metric => metric === this.selectedMetricType));
         let vss = (8*this.valor)+((this.selectedClusterCount-2)*2) + this.metrics.findIndex(metric => metric === this.selectedMetricType);
         console.log('indeice '  ,vss);
          const b = this.clusters[vss].data;
          console.log('Clusters' , b);
          const colorScale = d3.scaleOrdinal()
      .domain(Object.keys(b))
      .range(d3.schemeCategory10);    
      const defaultColor = "#CCCCCC";
      const getColor = (sujeto : string, b :ClusterData, colorScale : any) => {
        const keyIndex = Object.keys(b).findIndex(key => b[key].includes(sujeto));
        console.log('keyIndex', keyIndex);
        return keyIndex !== -1 ? colorScale(Object.keys(b)[keyIndex]) : defaultColor;
    };
          const points = svg.append('g')
    .selectAll("dot")
    .data(pca_tsst)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return xLine(d.Point[0]); } )
      .attr("cy", function (d) { return yLine(d.Point[1]); } )
      .attr("r", 4)
      .attr("id",(_, i) => sujetos[i])
      .style("fill", (_, i) => getColor(sujetos[i], b, colorScale))
          .attr("fill", "none")
          .on("mouseover", async function(event, d) {
            const clickedId = d3.select(this).attr('id');
            console.log('Clicked ID:', clickedId);
            index = data.findIndex(d => d.Sujeto === clickedId);
            index2 =  sujetos1.findIndex(d => d === clickedId);
            const tooltip = d3.select("#tooltip");
            tooltip.transition().duration(200).style("opacity", .9);
            
               

                 
                  tooltip.html("<div id='smallChart'></div>")
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
    
                    const smallWidth = 180, smallHeight = 100;

                    const smallSvg = d3.select("#smallChart").append("svg")
                      .attr("width", smallWidth)
                      .attr("height", smallHeight);
                
                    const smallX = d3.scaleLinear().range([0, smallWidth]);
                    const smallY = d3.scaleLinear().range([smallHeight, 0]);
                
                    smallX.domain([0, data[index].Datos.length - 1]);
                    smallY.domain([0, d3.max(data[index].Datos) as number]);
                
                    const smallLine = d3.line<number>()
                      .x((d, i) => smallX(i))
                      .y(d => smallY(d));
                
                    smallSvg.append("path")
                      .datum(data[index].Datos)
                      .attr("class", "line")
                      .attr("d", smallLine)
                      .attr("stroke", "red")
                      .attr("stroke-width", 1.5)
                      .attr("fill", "none")
                      .text(`Sujeto ${d['Sujeto']}`);
                })
                .on("mouseout", () => {
                  const tooltip = d3.select("#tooltip");
                  tooltip.transition().duration(500).style("opacity", 0);
                  tooltip.html("");
                })
          .on('click', async function(event, d) {
            const clickedId = d3.select(this).attr('id');
            console.log('Clicked ID:', clickedId);
            index = data.findIndex(d => d.Sujeto === clickedId);
            index2 =  sujetos1.findIndex(d => d === clickedId);
            let questiondata: SujetoQuestion[] | undefined;
            
            try {
              questiondata = await d3.json("assets/formatted_question_data.json");
              
          } catch (error) {
              console.error("Error loading JSON:", error);
              return;
          }
          if (!questiondata) {
            console.error("Loaded JSON is undefined or null");
            return;
        }
      
  
        const usuarioElegido = 'S1';
        console.log(index2);
        console.log(questiondata[index2]); 
            
            plot_chart_segments(data[index2],questiondata[index2] );
            plot_segments(data[index2],questiondata[index2])
            
          });
          let gridDot = d3.selectAll('svg g dot');
          
         
          
          const legend = svg.append("g")
          .attr("transform", `translate(${this.width -100}, 20)`); // Adjust position
          colorScale.domain().forEach((key, index) => {
  // Agrega un rectángulo para cada color
  console.log('key' , key)
  legend.append('rect')
    .attr('x', 0)
    .attr('y', index * 20) // Ajusta el espacio vertical entre las entradas
    .attr('width', 10)
    .attr('height', 10)
    .style('fill',colorScale(key) as string); // Usa colorScale para obtener el color

  // Agrega texto para cada color
  legend.append('text')
    .attr('x', 15)
    .attr('y', 10 + index * 20) // Ajusta el espacio vertical entre el texto y el rectángulo
    .text(`${key}`)
    .style('font-size', '12px')
    .attr('alignment-baseline', 'middle');
});

    });
  }
  private loadClusterData(type: string, number: number, metric: string): void {
    const url = `assets/${type}_cluster/${type}_N_Cluster_${number}_${metric}.json`;

    d3.json<ClusterData>(url).then(data => {
      if (data === undefined) {
        console.error(`No data loaded from ${url}.`);
        return;
      }
      this.clusters.push({ type, metric, data });
      console.log(`Loaded data from ${url}`);
      // Process the data or update visualization here
      // Example: this.updateVisualization();
    }).catch(error => {
      console.error(`Failed to load data from ${url}`, error);
    });
  }
  private async createChart() {
    // Your existing D3 code here
    console.log("CLuster",this.clusters)   
    this.DataService.data$.subscribe(data => {
      this.data = data;
      // Aquí puedes usar this.data en tu componente
      const values = this.data;
     const name = "eda_pca" ;
      
      this.pointPlot(this.data , name);
      
  
      
  
   
    
    
  // Function to visualize EDA data using D3.js
  
    });
    // Process filtered EDA data for visualization
    
  
}

ngOnInit(): void {
  if(isPlatformBrowser(this.platformId)){
    this.createChart();
  }
  const types = ["complete", "segments", "fun", "tsst"];
    const numbers = [2, 3, 4, 5]; // Cluster numbers

    types.forEach(type => {
      numbers.forEach(number => {
        ['dtw', 'softdtw'].forEach(metric => {
          this.loadClusterData(type, number, metric);
        });
      });
    });
}

}


async function plot_segments(data: SujetoData, questionData: SujetoQuestion) {
  console.log(questionData.Cuestionarios);
  const margin_focus = { top: 50, right: 20, bottom: 30, left: 50 };
  const width_focus = 800 - margin_focus.left - margin_focus.right;
  const height_focus = 200 - margin_focus.top - margin_focus.bottom;

  const xScaleSelected = d3.scaleTime()
    .domain([d3.min(data.Fecha.map(f => new Date(f))) as Date, d3.max(data.Fecha.map(f => new Date(f))) as Date])
    .range([0, width_focus]);

  const yScaleSelected = d3.scaleLinear()
    .domain([0, d3.max(data.Datos)!])
    .range([height_focus, 0]);

  const lineSelected = d3.line<number>()
    .x((d, i) => xScaleSelected(new Date(data.Fecha[i])))
    .y(d => yScaleSelected(d))
    .curve(d3.curveMonotoneX);

  

  let intervalosPruebas: IntervalosPruebas[] | undefined;
  try {
    intervalosPruebas = await d3.json("assets/intervalos_pruebas1.json");
  } catch (error) {
    console.error("Error loading JSON:", error);
    return;
  }

  if (!intervalosPruebas) {
    console.error("Loaded JSON is undefined or null");
    return;
  }

  const overviewSvg = d3.select(".sliced-grid-tile .scrollable-container").append("svg")
    .attr("width", width_focus + margin_focus.left + margin_focus.right)
    .attr("height", height_focus + margin_focus.top + margin_focus.bottom)
    .append("g")
    .attr("transform", `translate(${margin_focus.left},${margin_focus.top})`);
  let totalFechas : any[] = [];
  overviewSvg.append("text")
    .attr("x", (width_focus / 2))
    .attr("y", 0 - (margin_focus.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "15px")
    .style("text-decoration", "underline")
    .text(`Sujeto: ${data.Sujeto}`);

  overviewSvg.append("g")
    .attr("transform", `translate(0,${height_focus})`)
    .call(d3.axisBottom(xScaleSelected));

  overviewSvg.append("g")
    .call(d3.axisLeft(yScaleSelected));

  if (!questionData.Cuestionarios.Base) {
    console.error("Loaded JSON is undefined or null");
    return;
  }
  intervalosPruebas.forEach((segmento: IntervalosPruebas) => {
    segmento.Pruebas.forEach((prueba: IntervaloPrueba) => {
      const inicio = new Date(prueba.Inicio);
      const fin = new Date(prueba.Fin);
        
      const fechasFiltradas = data.Fecha.filter((f, i) => {
        const fecha = new Date(f);
        return fecha >= inicio && fecha <= fin;
      });
      
      totalFechas.push(fechasFiltradas)
    });
  });
  console.log(totalFechas)
  const xScaleSelectedNew = d3.scaleTime()
    .domain(totalFechas[0])
    .range([0, width_focus]);
  // Filtrar los datos para cada segmento y plotearlos
  intervalosPruebas.forEach((segmento: IntervalosPruebas) => {
    segmento.Pruebas.forEach((prueba: IntervaloPrueba) => {
      const inicio = new Date(prueba.Inicio);
      const fin = new Date(prueba.Fin);

      const datosFiltrados = data.Datos.filter((d, i) => {
        const fecha = new Date(data.Fecha[i]);
        return fecha >= inicio && fecha <= fin;
      });
        
      const fechasFiltradas = data.Fecha.filter((f, i) => {
        const fecha = new Date(f);
        return fecha >= inicio && fecha <= fin;
      });
      
      const lineSegment = d3.line<number>()
        .x((d, i) => xScaleSelected(new Date(fechasFiltradas[i])))
        .y(d => yScaleSelected(d))
        .curve(d3.curveMonotoneX);

      overviewSvg.append("path")
        .datum(datosFiltrados)
        .attr("class", "line")
        .attr("d", lineSegment)
        .style("stroke", "red")
        .style("stroke-width", 2)
        .style("fill", "none");

      overviewSvg.append("text")
        .attr("x", xScaleSelected(inicio) + 5)
        .attr("y", 15)
        .text(prueba.Prueba)
        .attr("fill", "black")
        .attr("font-size", "16px");
    });
  });
}


async function plot_chart_segments(data: SujetoData , questionData : SujetoQuestion ) {
  plot_radar( questionData  )
  const margin_focus = {top: 50, right: 20, bottom: 30, left: 20};
      const width_focus = 800- margin_focus.left - margin_focus.right;
      const height_focus = 200 - margin_focus.top - margin_focus.bottom;
        // Al hacer clic en la línea, actualizar el gráfico secundario
        const selectedData = data.Datos;
        
        const xScaleSelected = d3.scaleTime()
        .domain([d3.min(data.Fecha.map(f => new Date(f))) as Date, d3.max(data.Fecha.map(f => new Date(f))) as Date])
        .range([0, width_focus]); // Ancho del gráfico secundario temporal
    
      // Escala Y para el gráfico secundario temporal
      const yScaleSelected = d3.scaleLinear()
        .domain([0, d3.max(data.Datos)!]) // Ajusta el dominio según tus datos
        .range([height_focus, 0]); // Alto del gráfico secundario temporal
    
      // Generador de línea para el gráfico secundario temporal
     
        

      // Crear contenedor SVG para el gráfico secundario temporal
      
      const lineSelected = d3.line<number>()
      .x((d, i) => xScaleSelected(new Date(data.Fecha[i])))
      .y(d => yScaleSelected(d))
      .curve(d3.curveMonotoneX);
      let intervalosPruebas: IntervalosPruebas[] | undefined;
      try {
        intervalosPruebas = await d3.json("assets/intervalos_pruebas1.json");
       
    } catch (error) {
        console.error("Error loading JSON:", error);
        return;
    }
    if (!intervalosPruebas) {
      console.error("Loaded JSON is undefined or null");
      return;
  }
  d3.selectAll(".new-grid-tile .scrollable-container svg").remove();
  const newGridTile = d3.select(".new-grid-tile .scrollable-container");
 
    
intervalosPruebas.forEach((d:IntervalosPruebas) => {
            console.log("Aqui ",d.Pruebas);

      });

      // Crear contenedor SVG para el gráfico secundario temporal
      const overviewSvg = newGridTile.append("svg")
        .attr("width", width_focus + margin_focus.left + margin_focus.right)
        .attr("height", height_focus + margin_focus.top + margin_focus.bottom)
        .append("g")
        .attr("transform", `translate(${margin_focus.left},${margin_focus.top})`);

      // Agregar la línea seleccionada al gráfico secundario temporal
      overviewSvg.append("path")
        .datum(selectedData)
        .attr("class", "line")
        .attr("d", lineSelected)
        .style("stroke", "red")
        .style("stroke-width", 2)
        .style("fill", "none")
        .style("color", "red")
        ;
       overviewSvg.append("text")
        .attr("x", (width_focus / 2))
        .attr("y", 0 - (margin_focus.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("text-decoration", "underline")
        .text(`Sujeto: ${data.Sujeto}`);

        overviewSvg.append("g")
        .attr("transform", `translate(0,${height_focus})`)
        .call(d3.axisBottom(xScaleSelected))
        ;
        if (!questionData) {
                console.error("Loaded JSON is undefined or null");
                return;
            }
        overviewSvg.append("g")
        .call(d3.axisLeft(yScaleSelected));
      
        intervalosPruebas.forEach((d: IntervalosPruebas) => {
          d.Pruebas.forEach((prueba: IntervaloPrueba) => {
              const inicio = new Date(prueba.Inicio);
              const fin = new Date(prueba.Fin);
      
              // Filtrar datos que estén dentro del intervalo de tiempo de esta prueba
              const datosFiltrados = data.Fecha.filter((fecha, idx) => {
                  const date = new Date(fecha);
                  return date >= inicio && date <= fin;
              });
              
              if (questionData && questionData.Cuestionarios) {
                const pruebaData = questionData.Cuestionarios[prueba.Prueba as keyof CuestionariosBase];

                  if (!pruebaData) {
                      console.warn(`No data found for prueba: ${prueba.Prueba}`);
                      return;
                  }
      
                  const cuestionarios = pruebaData;
                  const colores = {
                      SSSQ: "rgba(0, 0, 255, 0.6)",
                      PANAS: "rgba(0, 255, 0, .9)",
                      STAI: "rgba(255, 255, 0, 0.6)",
                      DIM: "rgba(0, 255, 255, 0.6)"
                  };
                  let offsetX = 0;
                  
                  Object.keys(cuestionarios).forEach((key) => {
                      const cuestionario = key as keyof Cuestionarios; // Type assertion
                      const featuress = ['PANAS', 'STAI', 'DIM', 'SSSQ'];  // Define the features
                      const probas = ["Base" , "Fun" , "Medi 1" , "TSST" , "Medi 2"];
                      if ((cuestionarios?.[cuestionario] ?? 0) > 0 ) {
                          overviewSvg.append("rect")
                              .attr("x", xScaleSelected(new Date(prueba.Fin)) + offsetX)
                              .attr("y", 0)
                              .attr("width", 10)
                              .attr("height", height_focus)
                              .attr("fill", colores[cuestionario])
                              .attr("id",cuestionario)
                              .on("mouseover", (event, d) => {
                                  const tooltip = d3.select("#tooltip");
                                  tooltip.transition().duration(200).style("opacity", .9);
                                  tooltip.html(`<div><strong>${cuestionario}:</strong> ${cuestionarios[cuestionario]?.toPrecision(2)}</div>`)
                                      .style("left", (event.pageX + 5) + "px")
                                      .style("top", (event.pageY - 28) + "px");
                              })
                              .on("mouseout", () => {
                                  d3.select("#tooltip").transition().duration(500).style("opacity", 0);
                              })
                              .on("click", function() {
                                // 'this' refers to the clicked <rect> element
                               
                            });
                              
                          offsetX += 10;
                      }
                  });
      
                  
      
                  overviewSvg.append("text")
                      .attr("x", xScaleSelected(new Date(prueba.Inicio)) + 5)
                      .attr("y", 15)
                      .text(prueba.Prueba)
                      .attr("fill", "black")
                      .attr("font-size", "14px");
              } else {
                  console.error('questionData or questionData.Cuestionario is undefined');
              }
          });
      });
      
      
      intervalosPruebas.forEach((d: IntervalosPruebas) => {
       
        
        d.Pruebas.forEach((prueba: IntervaloPrueba) => {
            const inicio = new Date(prueba.Inicio);
            const fin = new Date(prueba.Fin);
            
            // Filtrar datos que estén dentro del intervalo de tiempo de esta prueba
            const datosFiltrados = data.Fecha.filter((fecha, idx) => {
                const date = new Date(fecha);
                return date >= inicio && date <= fin;
            });
            
            if (questionData && questionData.Cuestionarios) {
              const pruebaData = questionData.Cuestionarios[prueba.Prueba as keyof CuestionariosBase];
              const probaas = questionData.Cuestionarios;
              
                if (!pruebaData) {
                    console.warn(`No data found for prueba: ${prueba.Prueba}`);
                    return;
                }
    
                const cuestionarios = pruebaData;
                const colores = {
                    SSSQ: "rgba(0, 0, 255, 0.6)",
                    PANAS: "rgba(0, 255, 0, .9)",
                    STAI: "rgba(255, 255, 0, 0.6)",
                    DIM: "rgba(0, 255, 255, 0.6)"
                };
                let offsetX = 5;
                let pruebas = ["Base" , "Fun" , "Medi 1" , "TSST" , "Medi 2"];
                let colors = [
                  "rgba(0, 255, 0, 1)",       // Bright Green
                  "rgba(255, 255, 0, 1)",     // Bright Yellow
                  "rgba(0, 191, 255, 1)",     // Deep Sky Blue
                  "rgba(255, 0, 0, 1)",       // Bright Red
                  "rgba(255, 105, 180, 1)"    // Hot Pink
              ];
              
                overviewSvg.append("rect")
                      .attr("x", xScaleSelected(new Date(prueba.Inicio)))
                      .attr("y", 0)
                      .attr("width", xScaleSelected(new Date(prueba.Fin)) - xScaleSelected(new Date(prueba.Inicio)))
                      .attr("height", height_focus)
                      .attr("class" , "Test")
                      .attr("id",prueba.Prueba)
                      .attr("fill", "rgba(0, 150, 255, 0.2)")
                      .on("click", function()  {
                        const pruebaPrueba = prueba.Prueba;
                        const index = pruebas.findIndex(prueba => prueba === pruebaPrueba);
                        console.log(`path #${prueba.Prueba}`)
                        const radar = d3.select(`.radar-grid-tile .scrollable-container`);
                        radar.selectAll("path")
                        .transition()
                        .duration(500) // Duration of the transition in milliseconds
                        .attr("opacity", 0.05);
                        d3.selectAll(`rect.Test`).transition().duration(500).attr("fill","rgba(0, 150, 255, 0.2)");
                        d3.selectAll(`rect[id^="${prueba.Prueba}"]`).transition().duration(500).attr("fill",colors[index]);
                    // Transition to highlight the selected path
                    radar.selectAll(`path[id^="${prueba.Prueba}"]`)
                        .transition()
                        .duration(500) // Duration of the transition in milliseconds
                        .attr("opacity", .8)
        .attr("stroke",colors[index]) // Black border
        .attr("stroke-width", 1.5); // Border width // Highlighting the selected path
                        
                      })
                      .on("dblclick", function() {
                        // Perform actions on double-click
                        console.log("Double-clicked on:", d);
                        d3.selectAll(`rect.Test`).transition().duration(500).attr("fill","rgba(0, 150, 255, 0.2)");
                        // Example: Change the fill color of the double-clicked path
                      
                            const radar = d3.select(`.radar-grid-tile .scrollable-container`);
                            radar.selectAll(`path`)
                            .transition()
                            .duration(500) // Duration of the transition in milliseconds
                            .attr("opacity", 0.6); // Highlighting the selected path
                      })
                      
                      ;
    
                overviewSvg.append("text")
                    .attr("x", xScaleSelected(new Date(prueba.Inicio)) + 5)
                    .attr("y", 15)
                    .text(prueba.Prueba)
                    .attr("fill", "black")
                    .attr("font-size", "14px");
            } else {
                console.error('questionData or questionData.Cuestionario is undefined');
            }
        });
    });
}
function plot_radar(cuestionarios: SujetoQuestion){
  let offsetX = 5;
  
  

    const featuress = ['PANAS', 'STAI', 'DIM', 'SSSQ'];  // Define the features

             
              d3.select(".radar-grid-tile .scrollable-container").selectAll("*").remove();
              const radarSvg = d3.select(".radar-grid-tile .scrollable-container").append("svg")
              .attr("width", 250)
              .attr("height", 220)
              .append("g")
              .attr("transform", `translate(30 ,40)`)
              ;
              let radialScale = d3.scaleLinear()
                .domain([0,10])
                .range([0,100])
                let ticks = [2, 4, 6, 8, 10];
              radarSvg.selectAll("circle")
              .data(ticks)
              .join(
                  enter => enter.append("circle")
                      .attr("cx", 150 / 2)
                      .attr("cy", 150 / 2)
                      .attr("fill", "none")
                      .attr("stroke", "gray")
                      .attr("r", d => radialScale(d))
              );
              
              radarSvg.selectAll(".ticklabel")
              .data(ticks)
              .join(
                  enter => enter.append("text")
                      .attr("class", "ticklabel")
                      .attr("x", 150 / 2 )
                      .attr("y", d => 150 / 2 - radialScale(d))
                      .text(d => d.toString())
                      .attr("font-size","10px")
              );
              function angleToCoordinate(angle : number, value : number){
                let x = Math.cos(angle) * radialScale(value);
                let y = Math.sin(angle) * radialScale(value);
                return {"x": 150 / 2 + x, "y": 150 / 2 - y};
            }
            let featureData = featuress.map((f, i) => {
              let angle = (Math.PI / 2) + (2 * Math.PI * i / featuress.length);
              return {
                  "name": f,
                  "angle": angle,
                  "line_coord": angleToCoordinate(angle, 10),
                  "label_coord": angleToCoordinate(angle, 10.5)
              };
          });
          
          // draw axis line
          radarSvg.selectAll("line")
              .data(featureData)
              .join(
                  enter => enter.append("line")
                      .attr("x1", 150 / 2)
                      .attr("y1", 150 / 2)
                      .attr("x2", d => d.line_coord.x)
                      .attr("y2", d => d.line_coord.y)
                      .attr("stroke","black")
              );
          
          // draw axis label
          radarSvg.selectAll(".axislabel")
              .data(featureData)
              .join(
                  enter => enter.append("text")
                      .attr("x", d => d.label_coord.x)
                      .attr("y", d => d.label_coord.y)
                      .text(d => d.name)
              );
            let line = d3.line<{ x: number, y: number }>()
                .x(d => d.x)
                .y(d => d.y);
                
            let colors = ["green", "yellow", "skyblue" , "red" , "pink"];
            let pruebas = ["Base" , "Fun" , "Medi 1" , "TSST" , "Medi 2"];
            function getPathCoordinates(data_point:any){
              let coordinates = [];
              for (var i = 0; i < featuress.length; i++){
                  let ft_name = featuress[i];
                  let angle = (Math.PI / 2) + (2 * Math.PI * i / featuress.length);
                  coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
              }
              return coordinates;
          }
          console.log(cuestionarios);
          let data = [];
          let Datas  = [];
          for (const key in cuestionarios.Cuestionarios) {
            if (Object.prototype.hasOwnProperty.call(cuestionarios.Cuestionarios, key)) {
              const cuestionario = cuestionarios.Cuestionarios[key as keyof typeof cuestionarios.Cuestionarios];
              let formattedPoint: any = {};
          
              featuress.forEach(f => {
                const value = cuestionario[f as keyof typeof cuestionario];
                const numPoints = value !== null ? Math.round(value) : 0;  // Convert to number of points (0 if null)
                formattedPoint[f] =numPoints;  // Convert number to points
              });
          
              Datas.push( formattedPoint );
            }
          }
          
          //generate the data
          for (var i = 0; i < 3; i++){
              let point : any = {};
              //each feature will be a random number from 1-9
              featuress.forEach(f => point[f] = 1 + Math.random() * 8);
              data.push(point);
          }
          console.log(Datas);
          radarSvg.selectAll("path")
            .data(Datas)
            .join(
                enter => enter.append("path")
                  .datum(d => getPathCoordinates(d))
                  .attr("d" , line)
                  .attr("stroke-width", 3)
                  
                  .attr("fill", (_, i) => colors[i])
                  
                  .attr("opacity", 0.5)
                  .attr("id",(_, i) => pruebas[i])
            );
         
        
            
        offsetX += 5;
    

}