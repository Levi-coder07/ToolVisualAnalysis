import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS, isPlatformBrowser } from '@angular/common';
import { Component, OnInit , inject , PLATFORM_ID, Renderer2 ,SimpleChanges, Input, numberAttribute} from '@angular/core';
import * as d3 from 'd3';
import { D3ZoomEvent } from 'd3';
import { DataService } from '../data-eda-b.service';
import { ZoomTransform } from 'd3';
import { MatCommonModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgModel, NgModelGroup } from '@angular/forms';
import { single, Subject } from 'rxjs';
interface Cuestionarios {
  PANAS: number | null;
  STAI: number | null;
  DIM: number | null;
  SSSQ: number | null;
}
interface CuestionariosBase {
  Base: Cuestionarios;
  "TSST": Cuestionarios;
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
  @Input() signal: string = "eda";
  @Input() prueba!: string;
  senial: string= this.signal;
  selectedClusterCount: number = 2; // Default cluster count
  selectedMetricType: string = 'dtw'; // Default metric type
  clusterCounts = [2, 3, 4, 5];
  valor : number = 0;
  type = 0;
  globalMaxY = 0;
  private platformId: object;
  private nameSignal:string ="tsst_pca_";
  private  margin = {top: 10, right: 0, bottom: 10, left: 20};
  private width = 450 - this.margin.left - this.margin.right;
  private height = 140 - this.margin.top - this.margin.bottom;
  private data: SujetoData[] = [] ;
  private edadata: SujetoData[] = [] ;
  private pca_data : pca_data[] = [];
  public title : string = "Scatter Plot - Overview";
  names_pca: string[] = ["eda_pca","eda_segments_pca","fun_pca_", "tsst_pca_" ];
  names_tsne: string[] = ["eda_tsne","eda_segments_tsne","fun_tsne_eda", "tsst_tsne_eda" ];
  names_options_cluster: string[] = ["complete","segments","fun", "TSST" ];
  metrics: string[] = ["dtw" ,"softdtw" ];
  names: any;
  private name_compose! : string ;
  public colorVector : string[] = [];
  private clusters: ClusterInfo[] = [];
  constructor(private renderer: Renderer2 , private DataService : DataService) {
    this.platformId = inject(PLATFORM_ID);
    
  }
  
  optionChanged(options:string) {
    let index = 0;
    if(options== 'pca'){
      this.names = this.names_pca;
    }else{
      this.names = this.names_tsne;
    }
    this.valor = index;
    this.title = `Estadistico - ${this.names[index]}`;
    this.pointPlot(this.data, this.names[index],this.prueba,this.signal);
  }
  onButtonClick(test: string): void {
    let selectedNames = this.option === 'pca' ? this.names_pca : this.names_tsne;
    this.prueba = test;
    // Busca el nombre correspondiente al test en el array
    let selectedName = selectedNames.find(name => name.toLowerCase().includes(test.toLowerCase()));
    console.log("TESTSELECTED",selectedName)
    if (!selectedName) {
      console.error(`Test "${test}" no encontrado en el array.`);
      return;
    }
    this.title = `Estadistico - ${this.signal}-${this.prueba}`;
    this.nameSignal = selectedName;
    this.pointPlot(this.data, selectedName,this.prueba,this.signal);
  }
  private handleZoom(e : any): void {
    
    d3.select('svg g')
    
    .attr('transform', e.transform);
  }
  onSingalChange(signal: string): void {
    if(this.option == 'pca'){
      this.names = this.names_pca;
    }else{
      this.names = this.names_tsne;
    }
    this.signal = signal;
    this.pointPlot(this.data,this.nameSignal,this.prueba,this.signal);
  }


  
  private pointPlot(data : SujetoData[],name: string,test:string,signal:string){
    let edadata1 : SujetoData[];
    let bvpdata : SujetoData[];
    let colorPoint :string;
    this.DataService.loadDataEDA();  
    this.DataService.edaData$.subscribe(data1 => {
      edadata1 = data1;
      // Aquí puedes usar this.data en tu componente
  
    });
    let container2 = d3.select(".pca-grid-tile .scrollable-container")
    const containerWidth2 = parseInt(container2.style("width"));
    const containerHeight2 = parseInt(container2.style("height"));
    this.DataService.loadDataBVP();
    this.DataService.bvpData$.subscribe(data2 => {
      bvpdata = data2;
    });
    const svgSelection = d3.selectAll(`#chart-overview svg`);

  if (!svgSelection.empty()) {
    svgSelection.remove();
  }
    let svg = d3.select("#chart-overview").append("svg")
    .attr("width",containerWidth2-50 )
    .attr("height", containerHeight2-80)
  
    
    .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
   console.log(`assets/${name}${signal}.json`);
    d3.json<pca_data[]>(`assets/${name}${signal}.json`).then((pca_tsst) => {

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
        // Calcular el rango y aplicar padding para Y
if (maxY !== undefined && minY !== undefined) {
  const rangeY = maxY - minY;
  const paddingY = rangeY * 0.1; // 10% de padding
  maxY += paddingY;
  minY -= paddingY;
}

// Calcular el rango y aplicar padding para X
if (maxX !== undefined && minX !== undefined) {
  const rangeX = maxX - minX;
  const paddingX = rangeX * 0.2; // 20% de padding
  maxX += paddingX;
  minX -= paddingX;
}

      }
    // Configurar las escalas
    const xLine = d3.scaleLinear()
      .domain([minX ||0, maxX|| 0 ])
      .range([0, containerWidth2]);

    const yLine = d3.scaleLinear()
      .domain([minY ||0, maxY || 0])
      .range([containerHeight2-containerHeight2*0.35, 0]);
      console.log("Datos cargados:", pca_tsst);
      const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(sujetos);
      console.log(sujetos);
      let index = 0;
      let index2 = 0;
      var _this = this;
      sujetos.forEach(sujeto => {
        
      });
      
      let zoom = d3.zoom()
         .scaleExtent([1 , 32])
         .on("zoom", zoomed) as any;
         var event_rect = svg.append("rect")
    	.attr("width",  containerWidth2-20 )
    	.attr("height", containerHeight2-80)
    	.style("fill", "#D9EAFD")
      .style("border","black")
      .style("stroke-dasharray", "4,2")          // Patrón de guiones y espacios para borde puntilloso
    .style("stroke-linecap", "round")          // Estilo de los extremos de los guiones
    	.style("pointer-events", "all")
    
    	.call(zoom);
      const xAxis = d3.axisBottom(xLine);
const yAxis = d3.axisLeft(yLine);

// Agregar ejes al SVG

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
      const colorV = this.colorVector;
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
      .attr("cx", d => xLine(d.Point[0]) )
      .attr("cy", d => yLine(d.Point[1]) )
      .attr("r", 4)
      
      .attr("id", (_, i) => `${sujetos[i]}`)
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
            const [user, color] = this.id.split('-'); // Split by delimiter
            console.log('Clicked ID:', clickedId);
            index = data.findIndex(d => d.Sujeto === user);
            index2 =  sujetos1.findIndex(d => d === user);
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
        
        if (test === "Medi 1") {
          plot_radar(questiondata[index2].Cuestionarios["Medi 1"],data[index2].Sujeto);
        } else if (test === "TSST") {
          plot_radar(questiondata[index2].Cuestionarios["TSST"],data[index2].Sujeto);
        } else if (test === "Medi 2") {
          plot_radar(questiondata[index2].Cuestionarios["Medi 2"],data[index2].Sujeto);
        } else if (test === "Fun") {
          plot_radar(questiondata[index2].Cuestionarios["Fun"],data[index2].Sujeto);
        } else if (test === "Base") {
          plot_radar(questiondata[index2].Cuestionarios["Base"],data[index2].Sujeto);
        } else {
          console.error("Invalid test value:", test);
        }
        
        colorV.push(color)
            plot_chart_segments(edadata1[index2],questiondata[index2],1 ,"EDA",test,_this.signal);
            plot_chart_segments(data[index2],questiondata[index2],2 ,"TEMP",test,_this.signal);
            plot_chart_segments(bvpdata[index2],questiondata[index2],3 ,"BVP",test,_this.signal);
            plot_segments(edadata1[index2],questiondata[index2],colorV)
           
            
          });
          let gridDot = d3.selectAll('svg g dot');
          
         
          
          const legend = svg.append("g")
          .attr("transform", `translate(${this.width }, 20)`); // Adjust position
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
    .text(`${key} ${name}`)
    .style('font-size', '12px')
    .attr('alignment-baseline', 'right');
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
    this.DataService.loadData();  
    this.DataService.tempData$.subscribe(data1 => {
      this.data = data1;
      // Aquí puedes usar this.data en tu componente
      const values = this.data;
      
     let name:string = "eda_pca" ;
    
      this.pointPlot(values, name,this.prueba,this.signal);
     
    
           
      
  
    });
   
    // Process filtered EDA data for visualization
    
  
}

ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.createChart();
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
  

}
let globalMaxY = 0;
let GlobalData : any[][]=[];
let allSegments: any[] = [];
let sujetoTrack : any[] = [];
let fechasFiltradasSolos: any[] = []; 
async function plot_segments(data: SujetoData, questionData: SujetoQuestion,color : any) {
  console.log(questionData.Cuestionarios);
  const maxDatoNuevo = d3.max(data.Datos)!; // Máximo del nuevo sujeto
  globalMaxY = Math.max(globalMaxY, maxDatoNuevo); // Actualizar el rango global si el nuevo máximo es mayor
  if(sujetoTrack.length==0){
    sujetoTrack.push(data);
  }
// Actualizar la escala Y

const margin_focus = {top: 50, right: 20, bottom: 30, left: 20};
const width_focus = 1400- margin_focus.left - margin_focus.right;
const height_focus = 140 - margin_focus.top - margin_focus.bottom;
  const xScaleSelected = d3.scaleTime()
    .domain([d3.min(data.Fecha.map(f => new Date(f))) as Date, d3.max(data.Fecha.map(f => new Date(f))) as Date])
    .range([0, width_focus]);
    
  const yScaleSelected = d3.scaleLinear()
    .domain([0, globalMaxY])
    .range([height_focus, 0]);

    
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
  let overviewSvg : any;
  let checkSVG = d3.select(".sliced-grid-tile .scrollable-container").select("svg");
  
  if(checkSVG.empty()){
    console.log("checkSVG", checkSVG);
    overviewSvg = d3.select(".sliced-grid-tile .scrollable-container").append("svg")
    .attr("width", width_focus + margin_focus.left + margin_focus.right)
    .attr("height", height_focus + margin_focus.top + margin_focus.bottom)
    .append("g")
    .attr("transform", `translate(${margin_focus.left},${margin_focus.top})`);

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
.attr("class", "axis-y") // Clase para futuras actualizaciones
.call(d3.axisLeft(yScaleSelected));
    
  }else{
    overviewSvg = d3.select(".sliced-grid-tile .scrollable-container").select("svg").select("g");
    overviewSvg.select("g.axis-y") // Asegúrate de que tiene la clase 'axis-y'
      .transition()
      .duration(1000)
      .call(d3.axisLeft(yScaleSelected));
  }
  
  let totalFechas : any[] = [];
  

  if (!questionData.Cuestionarios.Base) {
    console.error("Loaded JSON is undefined or null");
    return;
  }
  
 
  
// Mapeo para definir el índice de cada prueba en el orden deseado
const segmento = intervalosPruebas.find(
  (seg) => Array.isArray(seg.Subject) && seg.Subject.includes(data.Sujeto)
);
  
  if (!segmento) {
    console.error(`No se encontraron pruebas para el sujeto: ${data.Sujeto}`);
    return undefined;
  }
  const ordenDeseado = ["Base", "Fun", "Medi 1", "TSST", "Medi 2"];

// Mapeo para definir el índice de cada prueba en el orden deseado
const indicePrueba = new Map(ordenDeseado.map((prueba, index) => [prueba, index]));

// Ordenar las pruebas del segmento según el índice definido en el orden deseado
segmento.Pruebas.sort((a, b) => {
  const indexA = indicePrueba.get(a.Prueba) ?? Infinity;  // Si no está en el orden, le asignamos un valor muy alto
  const indexB = indicePrueba.get(b.Prueba) ?? Infinity;
  return indexA - indexB;
});
let datosFiltrados:any;
let totalData: any[] = []; 
// Aniadir los segmentos basados en el antiguo orden para

segmento.Pruebas.forEach((prueba,index) => {
  datosFiltrados = data.Datos.filter((d, i) => {
    const fecha = new Date(data.Fecha[i]);
    return fecha >= new Date(prueba.Inicio) && fecha <= new Date(prueba.Fin);
  });
  totalData.push(datosFiltrados);
});
GlobalData.push(totalData);
allSegments.push(segmento.Pruebas)
 // Ver el orden de las pruebas después de ordenar
let inicioBase = new Date(segmento.Pruebas[0].Inicio); // Inicio de la primera prueba
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes de dos dígitos
  const day = date.getDate().toString().padStart(2, '0'); // Día de dos dígitos
  const hours = date.getHours().toString().padStart(2, '0'); // Hora de dos dígitos
  const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutos de dos dígitos
  const seconds = date.getSeconds().toString().padStart(2, '0'); // Segundos de dos dígitos
  
  // Devuelve la fecha formateada en el formato "YYYY-MM-DD HH:mm:ss"
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// Recorremos las pruebas y ajustamos sus tiempos en función de la fecha de la prueba anterior
// Inicio de la primera prueba

// Recorremos las pruebas y ajustamos sus tiempos en función de la fecha de la prueba anterior
segmento.Pruebas.forEach((prueba, index) => {
  const inicioPrueba = new Date(prueba.Inicio);  // El inicio de la prueba
  const finPrueba = new Date(prueba.Fin);  // El fin de la prueba actual
  
  // Calculamos la duración de la prueba en milisegundos
  const duracionPrueba = finPrueba.getTime() - inicioPrueba.getTime(); // Duración en milisegundos

  // Si no es la primera prueba, ajustamos su inicio al final de la prueba anterior
  if (index > 0) {
    // El nuevo inicio de la prueba es el final de la prueba anterior
    inicioBase = new Date(new Date(segmento.Pruebas[index - 1].Fin).getTime());
  }

  // Recalcular el `Inicio` y `Fin` de la prueba según el `Inicio` continuo
  prueba.Inicio = formatDate(inicioBase); // Reasignamos el nuevo inicio con el formato personalizado

  // El fin de la prueba será calculado usando la duración de la prueba actual
  prueba.Fin = formatDate(new Date(inicioBase.getTime() + duracionPrueba)); // Recalculamos el `Fin` con formato

  // Actualizamos el `InicioBase` para la siguiente prueba
  inicioBase = new Date(prueba.Fin);  // El inicio de la siguiente prueba será justo después del `Fin` de esta
});

console.log(segmento.Pruebas);  // Ver los resultados con los tiempos ajustados
const minTime = d3.min(segmento.Pruebas.map((prueba: any) => new Date(prueba.Inicio))) as Date;
const maxTime = d3.max(segmento.Pruebas.map((prueba: any) => new Date(prueba.Fin))) as Date;

// Usamos esos valores para ajustar el dominio de la escala `xScaleSelecteds`
let fechasFiltradasSolo: Date[];
let fechasLocalesSolo: any [] = [];
const xScaleSelectedNew = d3.scaleTime()
  .domain([minTime, maxTime])
  .range([0, width_focus]);
  
  segmento.Pruebas.forEach((prueba,index) => {
  
      fechasFiltradasSolo = data.Fecha.filter((f, i) => {
        const fecha = new Date(f);
        return fecha >= new Date(prueba.Inicio) && fecha <= new Date(prueba.Fin);
      });
      
      fechasLocalesSolo.push(fechasFiltradasSolo);
      
      
      const lineId = `line-${data.Sujeto}-${index}`;
      const lineSegment = d3.line<number>()
        .x((d, i) => xScaleSelectedNew(new Date(fechasFiltradasSolo[i]))) // Mapeo de la fecha filtrada
        .y(d => yScaleSelected(d)) // Ajuste de la escala en Y (según los datos)
        .curve(d3.curveMonotoneX);
        // Crear o actualizar el path de la línea
        const existingLine = overviewSvg.select(`${lineId}`);
        if (existingLine.empty()) {
          
           // Curvatura de la línea
        overviewSvg.append("path")
        .datum(totalData[index])
        .attr("class", "line")
        .attr("d", lineSegment)
        .attr('id',lineId)
        .style("stroke", "red") // Color de la línea
        .style("stroke-width", 2) // Grosor de la línea
        .style("fill", "none"); 
    ;
        } else {
          // Actualizar la línea existente con nueva data
          existingLine
            .transition()
            .duration(1000)
            
            .attr("d", lineSegment(totalData[index])); // Actualiza el path con los nuevos datos
        }
      // Crear la línea para el gráfico
      /*
      const lineSegments = d3.line<number>()
        .x((d, i) => xScaleSelectedNew(new Date(fechasFiltradas[i]))) // Mapeo de la fecha filtrada
        .y(d => yScaleSelected(d)) // Ajuste de la escala en Y (según los datos)
        .curve(d3.curveMonotoneX); // Curvatura de la línea
        overviewSvg.append("path")
        .datum(totalData[index])
        .attr("class", "line")
        .attr("d", lineSegments)
        .style("stroke", "red") // Color de la línea
        .style("stroke-width", 2) // Grosor de la línea
        .style("fill", "none"); // Sin relleno
      // Añadir el path del gráfico*/
      if(checkSVG.empty()){
       
        console.log("Me ejecuto")
      // Añadir el texto que muestra el nombre de la prueba
      overviewSvg.append("text")
        .attr("x", xScaleSelectedNew(new Date(prueba.Inicio)) + 5) // Posición de texto en X
        .attr("y", 15 * (index + 1)) // Posición de texto en Y (para evitar superposiciones)
        .text(prueba.Prueba) // Nombre de la prueba
        .attr("fill", "black")
        .attr("font-size", "16px");
        overviewSvg.append("line")
        .attr("x1", xScaleSelectedNew(new Date(prueba.Fin)))  // Posición final de la prueba
        .attr("y1", 0)  // Posición vertical inicial
        .attr("x2", xScaleSelectedNew(new Date(prueba.Fin)))  // Mismo X final
        .attr("y2", height_focus)  // Alto del gráfico para llegar al fondo
        .attr("stroke", "black")  // Color de la línea divisoria
        .attr("stroke-width", 1);  // Grosor de la línea
      }
      
    });
    overviewSvg.selectAll(".line").remove();

    GlobalData.forEach((seriesData, seriesIndex) => {
      
      seriesData.forEach((segmentData, segmentIndex) => {
        // Obtener las fechas correspondientes a este segmento
        const segment = allSegments[seriesIndex][segmentIndex];
        /*const fechasFiltradas = data.Fecha.filter((f, i) => {
          const fecha = new Date(f);
          return fecha >= new Date(firstSegment[segmentIndex].Inicio) && fecha <= new Date(firstSegment[segmentIndex].Fin);
        });*/
        /*
        const fechasFiltradas = data.Fecha.filter((f, i) => {
          const fecha = new Date(f);
          return fecha >= new Date(segment.Inicio) && fecha <= new Date(segment.Fin);
        });*/
        const dateSolos = fechasLocalesSolo[segmentIndex]
        console.log("SD", segmentData)
        // Crear el generador de líneas
        const line = d3.line<number>()
          .x((d, i) => xScaleSelectedNew(new Date(dateSolos[i]))) // Mapeo de fecha
          .y(d => yScaleSelected(d)); // Escala Y para los datos
  
        // ID único para cada línea
        const lineId = `line-${seriesIndex}-${segmentIndex}`;
  
        // Crear o actualizar el path de la línea
        const existingLine = overviewSvg.select(`#${lineId}`);
        if (existingLine.empty()) {
          
          overviewSvg.append("path")
            .attr("id", lineId)
            .datum(segmentData)
            .attr("d", line)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke","red" ) // Puedes ajustar el color según el segmento
            .attr("stroke-width", 1.5)
            
            
    ;
        } else {
          alert("HOLA")
          existingLine
            .transition()
            .duration(1000)
            
            .attr("d", line(segmentData));
          // Actualiza el path con los nuevos datos
        }
      
      });
    });
    refresh_segments(sujetoTrack[0],questionData,color) 
    
}
let j = 0;
async function refresh_segments(data: SujetoData, questionData: SujetoQuestion, color : any) {
  
  const maxDatoNuevo = d3.max(data.Datos)!; // Máximo del nuevo sujeto
  globalMaxY = Math.max(globalMaxY, maxDatoNuevo); // Actualizar el rango global si el nuevo máximo es mayor

// Actualizar la escala Y

const margin_focus = {top: 50, right: 20, bottom: 30, left: 20};
const width_focus = 1400- margin_focus.left - margin_focus.right;
const height_focus = 140 - margin_focus.top - margin_focus.bottom;
  const xScaleSelected = d3.scaleTime()
    .domain([d3.min(data.Fecha.map(f => new Date(f))) as Date, d3.max(data.Fecha.map(f => new Date(f))) as Date])
    .range([0, width_focus]);
    
  const yScaleSelected = d3.scaleLinear()
    .domain([0, globalMaxY])
    .range([height_focus, 0]);

    
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
  let overviewSvg : any;
  let checkSVG = d3.select(".sliced-grid-tile .scrollable-container").select("svg");
  
  if(checkSVG.empty()){
    
    overviewSvg = d3.select(".sliced-grid-tile .scrollable-container").append("svg")
    .attr("width", width_focus + margin_focus.left + margin_focus.right)
    .attr("height", height_focus + margin_focus.top + margin_focus.bottom)
    .append("g")
    .attr("transform", `translate(${margin_focus.left},${margin_focus.top})`);

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
.attr("class", "axis-y") // Clase para futuras actualizaciones
.call(d3.axisLeft(yScaleSelected).ticks(5));
    
  }else{
    overviewSvg = d3.select(".sliced-grid-tile .scrollable-container").select("svg").select("g");
    overviewSvg.select("g.axis-y") // Asegúrate de que tiene la clase 'axis-y'
      .transition()
      .duration(1000)
      .call(d3.axisLeft(yScaleSelected).ticks(5 ));
  }
  
  let totalFechas : any[] = [];
  

  if (!questionData.Cuestionarios.Base) {
    console.error("Loaded JSON is undefined or null");
    return;
  }
  
  
// Mapeo para definir el índice de cada prueba en el orden deseado
const segmento = intervalosPruebas.find(
  (seg) => Array.isArray(seg.Subject) && seg.Subject.includes(data.Sujeto)
);
  console.log("Segment",segmento);
  if (!segmento) {
    console.error(`No se encontraron pruebas para el sujeto: ${data.Sujeto}`);
    return undefined;
  }
  const ordenDeseado = ["Base", "Fun", "Medi 1", "TSST", "Medi 2"];

// Mapeo para definir el índice de cada prueba en el orden deseado
const indicePrueba = new Map(ordenDeseado.map((prueba, index) => [prueba, index]));

// Ordenar las pruebas del segmento según el índice definido en el orden deseado
segmento.Pruebas.sort((a, b) => {
  const indexA = indicePrueba.get(a.Prueba) ?? Infinity;  // Si no está en el orden, le asignamos un valor muy alto
  const indexB = indicePrueba.get(b.Prueba) ?? Infinity;
  return indexA - indexB;
});
let datosFiltrados:any;
let totalData: any[] = []; 
// Aniadir los segmentos basados en el antiguo orden para

segmento.Pruebas.forEach((prueba,index) => {
  datosFiltrados = data.Datos.filter((d, i) => {
    const fecha = new Date(data.Fecha[i]);
    return fecha >= new Date(prueba.Inicio) && fecha <= new Date(prueba.Fin);
  });
  totalData.push(datosFiltrados);
});

console.log(segmento.Pruebas);  // Ver el orden de las pruebas después de ordenar
let inicioBase = new Date(segmento.Pruebas[0].Inicio); // Inicio de la primera prueba
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes de dos dígitos
  const day = date.getDate().toString().padStart(2, '0'); // Día de dos dígitos
  const hours = date.getHours().toString().padStart(2, '0'); // Hora de dos dígitos
  const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutos de dos dígitos
  const seconds = date.getSeconds().toString().padStart(2, '0'); // Segundos de dos dígitos
  
  // Devuelve la fecha formateada en el formato "YYYY-MM-DD HH:mm:ss"
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// Recorremos las pruebas y ajustamos sus tiempos en función de la fecha de la prueba anterior
// Inicio de la primera prueba

// Recorremos las pruebas y ajustamos sus tiempos en función de la fecha de la prueba anterior
segmento.Pruebas.forEach((prueba, index) => {
  const inicioPrueba = new Date(prueba.Inicio);  // El inicio de la prueba
  const finPrueba = new Date(prueba.Fin);  // El fin de la prueba actual
  
  // Calculamos la duración de la prueba en milisegundos
  const duracionPrueba = finPrueba.getTime() - inicioPrueba.getTime(); // Duración en milisegundos

  // Si no es la primera prueba, ajustamos su inicio al final de la prueba anterior
  if (index > 0) {
    // El nuevo inicio de la prueba es el final de la prueba anterior
    inicioBase = new Date(new Date(segmento.Pruebas[index - 1].Fin).getTime());
  }

  // Recalcular el `Inicio` y `Fin` de la prueba según el `Inicio` continuo
  prueba.Inicio = formatDate(inicioBase); // Reasignamos el nuevo inicio con el formato personalizado

  // El fin de la prueba será calculado usando la duración de la prueba actual
  prueba.Fin = formatDate(new Date(inicioBase.getTime() + duracionPrueba)); // Recalculamos el `Fin` con formato

  // Actualizamos el `InicioBase` para la siguiente prueba
  inicioBase = new Date(prueba.Fin);  // El inicio de la siguiente prueba será justo después del `Fin` de esta
});

console.log(segmento.Pruebas);  // Ver los resultados con los tiempos ajustados
const minTime = d3.min(segmento.Pruebas.map((prueba: any) => new Date(prueba.Inicio))) as Date;
const maxTime = d3.max(segmento.Pruebas.map((prueba: any) => new Date(prueba.Fin))) as Date;

// Usamos esos valores para ajustar el dominio de la escala `xScaleSelecteds`
let fechasFiltradasSolo: Date[];
let fechasLocalesSolo: any [] = [];
const xScaleSelectedNew = d3.scaleTime()
  .domain([minTime, maxTime])
  .range([0, width_focus]);
  
  segmento.Pruebas.forEach((prueba,index) => {
  
      fechasFiltradasSolo = data.Fecha.filter((f, i) => {
        const fecha = new Date(f);
        return fecha >= new Date(prueba.Inicio) && fecha <= new Date(prueba.Fin);
      });
      
      fechasLocalesSolo.push(fechasFiltradasSolo);
      
      
    });
    overviewSvg.selectAll(".line").remove();
    let js = 0;
    GlobalData.forEach((seriesData, seriesIndex) => {
      
      seriesData.forEach((segmentData, segmentIndex) => {
        // Obtener las fechas correspondientes a este segmento
        js = seriesIndex;
        const segment = allSegments[seriesIndex][segmentIndex];
        /*const fechasFiltradas = data.Fecha.filter((f, i) => {
          const fecha = new Date(f);
          return fecha >= new Date(firstSegment[segmentIndex].Inicio) && fecha <= new Date(firstSegment[segmentIndex].Fin);
        });*/
        /*
        const fechasFiltradas = data.Fecha.filter((f, i) => {
          const fecha = new Date(f);
          return fecha >= new Date(segment.Inicio) && fecha <= new Date(segment.Fin);
        });*/
        const dateSolos = fechasLocalesSolo[segmentIndex]
     
        // Crear el generador de líneas
        const line = d3.line<number>()
          .x((d, i) => xScaleSelectedNew(new Date(dateSolos[i]))) // Mapeo de fecha
          .y(d => yScaleSelected(d)); // Escala Y para los datos
  
        // ID único para cada línea
        const lineId = `line-${seriesIndex}-${segmentIndex}`;
        
        // Crear o actualizar el path de la línea
        const existingLine = overviewSvg.select(`#${lineId}`);
        if (existingLine.empty()) {
         
          overviewSvg.append("path")
            .attr("id", lineId)
            .datum(segmentData)
            .attr("d", line)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke",color[seriesIndex]) // Puedes ajustar el color según el segmento
            .attr("stroke-width", 1.5)
            
    ;
        } else {
          // Actualizar la línea existente con nueva data
          existingLine
            .transition()
            .duration(1000)
            
            .attr("d", line(segmentData)); // Actualiza el path con los nuevos datos
        }
      
      });
      j++;
    });
    
}
let EdaminDatos: number[] = [];
let EdamaxDatos: number[] = [];
let TempminDatos: number[] = [];
let TempmaxDatos: number[] = [];
let BvpminDatos: number[] = [];
let BvpmaxDatos: number[] = [];
let EdaData: number[][] = [];
let TemppData: number[][] = [];
let BvpData: number[][] = [];
let SujetosGlobal:string[]=[];
async function plot_chart_segments(data: SujetoData , questionData : SujetoQuestion , type : any,signal : string,test:string,signalColor:string) {
  let container = d3.select(".eda-grid-tile .scrollable-container");
  
  // Get the container's width and height
      const containerWidth = parseInt(container.style("width"));
      const containerHeight = parseInt(container.style("height"));
  const margin_focus = {top: 30, right: 30, bottom: 30, left: 20};
      const width_focus = 800- margin_focus.left ;
      const height_focus = 120 - margin_focus.top;
        // Al hacer clic en la línea, actualizar el gráfico secundario
        const selectedData = data.Datos;
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
    let datosFiltrados: number[];
    let totalData: any[] = []; 
   
    const segmento = intervalosPruebas.find(
      (seg) => Array.isArray(seg.Subject) && seg.Subject.includes(data.Sujeto)
    );
   
    if (!segmento) {
      console.error("Loaded JSON is undefined or null");
      return;
  }
    const pruebaName = test;
const prueba = segmento.Pruebas.find((p) => p.Prueba === pruebaName);

console.log("Sujetos", SujetosGlobal)
// Verificar si la prueba fue encontrada
if (!prueba) {
  console.error("Loaded JSON is undefined or null");
      return;
} 
      datosFiltrados = data.Datos.filter((d, i) => {
        const fecha = new Date(data.Fecha[i]);
        return fecha >= new Date(prueba.Inicio) && fecha <= new Date(prueba.Fin);
      });
      
      totalData.push(datosFiltrados);
      let fechasFiltradasSolo = data.Fecha.filter((f) => {
        const fecha = new Date(f);
        return !isNaN(fecha.getTime()) && fecha >= new Date(prueba.Inicio) && fecha <= new Date(prueba.Fin);
      }).map((f) => new Date(f));
      
      const xScaleSelected = d3.scaleTime()
      .domain([
        d3.min(fechasFiltradasSolo) as Date,
        d3.max(fechasFiltradasSolo) as Date
      ])
      .range([0, width_focus]); 
      
      // Escala Y para el gráfico secundario temporal
      const yScaleSelected = d3.scaleLinear()
        .domain([d3.min(datosFiltrados)!, d3.max(datosFiltrados)!]) // Ajusta el dominio según tus datos
        .range([containerHeight, 0]); // Alto del gráfico secundario temporal
        let yScaleSelectedNew = d3.scaleLinear()
        .domain([d3.min(EdaminDatos)!, d3.max(EdamaxDatos)!]) // Ajusta el dominio según tus datos
        .range([containerHeight, 0]);  
        let lineSelected = d3.line<number>()
        .x((d, i) => xScaleSelected(new Date(fechasFiltradasSolo[i])))
        .y(d => yScaleSelectedNew(d))
        .curve(d3.curveMonotoneX);
      // Generador de línea para el gráfico secundario temporal
      let newGridTile = d3.select(".eda-grid-tile .scrollable-container");
      if(type ==1){
        SujetosGlobal.push(data.Sujeto)
        EdaData.push(datosFiltrados);
        EdaminDatos.push(d3.min(datosFiltrados)!);
          EdamaxDatos.push(d3.max(datosFiltrados)!);
        newGridTile = d3.select(".eda-grid-tile .scrollable-container");
        yScaleSelectedNew = d3.scaleLinear()
            .domain([d3.min(EdaminDatos)!, d3.max(EdamaxDatos)!]) // Ajusta el dominio según tus datos
            .range([containerHeight-containerHeight*0.15, 0]);
            lineSelected = d3.line<number>()
            .x((d, i) => xScaleSelected(new Date(fechasFiltradasSolo[i])))
            .y(d => yScaleSelectedNew(d))
            .curve(d3.curveMonotoneX);
      }else if (type==2){
        TemppData.push(datosFiltrados);
        TempminDatos.push(d3.min(datosFiltrados)!);
        TempmaxDatos.push(d3.max(datosFiltrados)!);
        newGridTile = d3.select(".temp-grid-tile .scrollable-container");
        yScaleSelectedNew = d3.scaleLinear()
            .domain([d3.min(TempminDatos)!, d3.max(TempmaxDatos)!]) // Ajusta el dominio según tus datos
            .range([containerHeight-containerHeight*0.15, 0]);
            lineSelected = d3.line<number>()
        .x((d, i) => xScaleSelected(new Date(fechasFiltradasSolo[i])))
        .y(d => yScaleSelectedNew(d))
        .curve(d3.curveMonotoneX);
      }else{
        BvpData.push(datosFiltrados);
        BvpminDatos.push(d3.min(datosFiltrados)!);
        BvpmaxDatos.push(d3.max(datosFiltrados)!);
        newGridTile = d3.select(".bvp-grid-tile .scrollable-container");
        yScaleSelectedNew = d3.scaleLinear()
            .domain([d3.min(BvpminDatos)!, d3.max(BvpmaxDatos)!]) // Ajusta el dominio según tus datos
            .range([containerHeight-containerHeight*0.15, 0]);
            lineSelected = d3.line<number>()
        .x((d, i) => xScaleSelected(new Date(fechasFiltradasSolo[i])))
        .y(d => yScaleSelectedNew(d))
        .curve(d3.curveMonotoneX);
      }
      let zoom = d3.zoom()
     
        .scaleExtent([1, 3])
        .translateExtent([[10, 0], [containerWidth, containerHeight]]) // Set zoom scale range
        .on("zoom", zoomed) as any;
      let overviewSvg = newGridTile.select<SVGGElement>("svg g");
      
  if (overviewSvg.empty()) {
    
    // Create SVG container if it doesn't exist
    let overviewSvg2:any;
    overviewSvg = newGridTile.append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight )
            .call(zoom)
            .append("g")
            .attr("width", containerWidth)
            .attr("height", containerHeight )
            .attr("transform", `translate(30,-10)`);
            if (signalColor === "eda") {
              overviewSvg2 = d3.select(".eda-grid-tile .scrollable-container svg g").append("rect")
                  .attr("x", 0)  // Top-left corner of the rectangle
                  .attr("y", 0)
                  .attr("width", width_focus)
                  .attr("height", containerHeight-20 )
                  .style("fill", "rgba(255, 0, 0, 0.2)")
                  .style("opacity",0.5); // Slightly transparent red
          }else{
            overviewSvg2 = d3.select(".bvp-grid-tile .scrollable-container svg g").append("rect")
                  .attr("x", 0)  // Top-left corner of the rectangle
                  .attr("y", 0)
                  .attr("width", width_focus)
                  .attr("height", containerHeight -20)
                  .style("fill", "rgba(71, 26, 196, 0.2)")
                  .style("opacity",0.5); // Slightly transparent red
          }
    // Add X and Y axes only the first time
    overviewSvg.append("g")
    .attr("class","x-axis")
      .attr("transform", `translate(0,${containerHeight-20})`)
      .call(d3.axisBottom(xScaleSelected));

    overviewSvg.append("g")
    .attr("class","y-axis")
      .call(d3.axisLeft(yScaleSelectedNew).ticks(4));
  } else {
    
    // Update the Y-axis with the new scale
    overviewSvg.select<SVGGElement>(".y-axis")
      .transition() // Add a smooth transition
      .duration(500)
      .call(d3.axisLeft(yScaleSelectedNew).ticks(4));
  }
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("border", "1px solid #ccc")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0); 

  if(type==1){
    
    overviewSvg.selectAll( `path`).remove();
    EdaData.forEach((pathData,index) => {
      console.log("Times");
      overviewSvg.append("path")
        .datum(pathData)
        .attr("class", `line-eda-path-${type}`) // Unique class for each path
        .attr("d", lineSelected)
        .style("stroke", "red") // Customize stroke color
        .style("stroke-width", 1.5)
        .style("fill", "none")
        .on("mouseover", function () {
          // Highlight the hovered line
          d3.select(this)
              .style("stroke", "orange") // Highlight color
              .style("stroke-width", 3); // Thicker line for emphasis
              d3.selectAll(`.eda-grid-tile .scrollable-container svg g path`)
              .style("stroke","black")
              .style("opacity", 0.1); 
              d3.select(this)
              .style("stroke", "red")
              .style("opacity", 1) // Highlight color
              .style("stroke-width", 3);
          // Highlight the specific path in the radar chart
          d3.selectAll(`.radar-grid-tile .scrollable-container svg g path`)
                  .style("fill","green")
                  .style("opacity", 0.05); 
          d3.select(`.radar-grid-tile .scrollable-container svg g path#${SujetosGlobal[index]}`)
              // Change fill color for emphasis
              .style("opacity", 0.8); // Ensure it's fully visible
      
          // Lowlight all other lines in the overview chart
          overviewSvg.selectAll("path")
              .filter(function () {
                  return this !== d3.select(this).node(); // Exclude the hovered line
              })
              .style("opacity", 0.2); // Dim other lines
      
          tooltip.style("opacity", 1); // Show tooltip
      })
      .on("mousemove", function (event) {
          const mouseX = d3.pointer(event)[0]; // Mouse x position in the SVG
          const date = xScaleSelected.invert(mouseX); // Map x position back to the date using the xScale
      
          // Format the date for display
          const formattedDateTime = d3.timeFormat("%Y-%m-%d %H:%M:%S")(date);
      
          // Update tooltip content and position
          tooltip.html(`Usuario: BVP ${SujetosGlobal[index]}<br>Fecha y Hora: ${formattedDateTime}`)
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", function () {
          // Reset the hovered line's style
          d3.select(this)
              .style("stroke", "red") // Default stroke color
              .style("stroke-width", 1.5); // Default stroke width
      
              d3.select(`.radar-grid-tile .scrollable-container svg g path`)
                  .style("opacity", 0.8); 
            d3.select(`.radar-grid-tile .scrollable-container svg g path#${SujetosGlobal[index]}`)
               // Reset to default fill
              .style("opacity", 0.3); // Reset opacity
      
          // Reset the opacity of all lines in the overview chart
          overviewSvg.selectAll("path")
          .style("stroke","red")
              .style("opacity", 1); // Restore original visibility
      
          tooltip.style("opacity", 0); // Hide tooltip
      });;
    });  }
  
  else if(type ==2){
    overviewSvg.selectAll( `path`).remove();
    console.log("lenghtTemp",TemppData.length); 
  TemppData.forEach((pathData,index) => {
    overviewSvg.append("path")
      .datum(pathData)
      .attr("class", `line-path line-${type}-${index}`) // Unique class for each path
      .attr("d", lineSelected)
      .style("stroke", "blue") // Customize stroke color
      .style("stroke-width", 1.5)
      .style("fill", "none")
      .on("mouseover", function () {
        // Highlight the hovered line
        d3.select(this)
            .style("stroke", "orange") // Highlight color
            .style("stroke-width", 3); // Thicker line for emphasis
    
        // Highlight the specific path in the radar chart
        d3.selectAll(`.radar-grid-tile .scrollable-container svg g path`)
                .style("fill","green")
                .style("opacity", 0.05); 
        d3.select(`.radar-grid-tile .scrollable-container svg g path#${SujetosGlobal[index]}`)
            // Change fill color for emphasis
            .style("opacity", 0.8); // Ensure it's fully visible
    
        // Lowlight all other lines in the overview chart
        overviewSvg.selectAll("path")
            .filter(function () {
                return this !== d3.select(this).node(); // Exclude the hovered line
            })
            .style("opacity", 0.2); // Dim other lines
    
        tooltip.style("opacity", 1); // Show tooltip
    })
    .on("mousemove", function (event) {
        const mouseX = d3.pointer(event)[0]; // Mouse x position in the SVG
        const date = xScaleSelected.invert(mouseX); // Map x position back to the date using the xScale
    
        // Format the date for display
        const formattedDateTime = d3.timeFormat("%Y-%m-%d %H:%M:%S")(date);
    
        // Update tooltip content and position
        tooltip.html(`Usuario: BVP ${SujetosGlobal[index]}<br>Fecha y Hora: ${formattedDateTime}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", function () {
        // Reset the hovered line's style
        d3.select(this)
            .style("stroke", "blue") // Default stroke color
            .style("stroke-width", 1.5); // Default stroke width
    
            d3.select(`.radar-grid-tile .scrollable-container svg g path`)
                .style("opacity", 0.8); 
          d3.select(`.radar-grid-tile .scrollable-container svg g path#${SujetosGlobal[index]}`)
             // Reset to default fill
            .style("opacity", 0.3); // Reset opacity
    
        // Reset the opacity of all lines in the overview chart
        overviewSvg.selectAll("path")
            .style("opacity", 1); // Restore original visibility
    
        tooltip.style("opacity", 0); // Hide tooltip
    });;
  });
  }else{
    overviewSvg.selectAll( `path`).remove();
    overviewSvg.selectAll( `tooltip`).remove();
    console.log("lenghtTemp",TemppData.length);
    BvpData.forEach((pathData, index) => {
      const currentFill = d3.select(`.radar-grid-tile .scrollable-container svg g path#${SujetosGlobal[index]}`)
            .style("fill")
      overviewSvg.append("path")
          .datum(pathData)
          .attr("class", `line-bvp-path-${type}`) // Unique class for each path
          .attr("d", lineSelected)
          .style("stroke", "black") // Default stroke color
          .style("stroke-width", 1.5) // Default stroke width
          .style("fill", "none")
          .on("mouseover", function () {
            // Highlight the hovered line
            // Thicker line for emphasis
        
            // Highlight the specific path in the radar chart
            d3.selectAll(`.radar-grid-tile .scrollable-container svg g path`)
                    .style("fill","green")
                    .style("opacity", 0.05); 
            d3.select(`.radar-grid-tile .scrollable-container svg g path#${SujetosGlobal[index]}`)
                // Change fill color for emphasis
                .style("opacity", 0.8); // Ensure it's fully visible
        
            // Lowlight all other lines in the overview chart
            d3.selectAll(`.bvp-grid-tile .scrollable-container svg g path`)
                    .style("stroke","#D9EAFD")
                    .style("opacity", 0.2); 
                    d3.select(this)
                    .style("stroke", "black") // Highlight color
                    .style("stroke-width", 3)
                    .style("opacity", 1); // Thicker line for emphasis
            overviewSvg.selectAll("path")
                .filter(function () {
                    return this !== d3.select(this).node(); // Exclude the hovered line
                })
                .style("opacity", 1); // Dim other lines
        
            tooltip.style("opacity", 1); // Show tooltip
        })
        .on("mousemove", function (event) {
            const mouseX = d3.pointer(event)[0]; // Mouse x position in the SVG
            const date = xScaleSelected.invert(mouseX); // Map x position back to the date using the xScale
        
            // Format the date for display
            const formattedDateTime = d3.timeFormat("%Y-%m-%d %H:%M:%S")(date);
        
            // Update tooltip content and position
            tooltip.html(`Usuario: BVP ${SujetosGlobal[index]}<br>Fecha y Hora: ${formattedDateTime}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", function () {
            // Reset the hovered line's style
            d3.select(this)
                .style("stroke", "black") // Default stroke color
                .style("stroke-width", 1.0); // Default stroke width
        
                d3.select(`.radar-grid-tile .scrollable-container svg g path`)
                    .style("opacity", 0.8); 
              d3.select(`.radar-grid-tile .scrollable-container svg g path#${SujetosGlobal[index]}`)
                 // Reset to default fill
                .style("opacity", 0.3); // Reset opacity
        
            // Reset the opacity of all lines in the overview chart
            overviewSvg.selectAll("path")
                .style("opacity", 1)
                .style("stroke","black"); // Restore original visibility
        
            tooltip.style("opacity", 0); // Hide tooltip
        });
  });
  }
 
  
  function zoomed({ transform }: { transform: ZoomTransform }){
        
    const newXScale = transform.rescaleX(xScaleSelected); // Rescale X-axis
    const newYScale = transform.rescaleY(yScaleSelectedNew); // Rescale Y-axis (optional)

    // Update axes with new scales
    overviewSvg.select<SVGGElement>(".x-axis")
        .call(d3.axisBottom(newXScale).ticks(6));
    overviewSvg.select<SVGGElement>(".y-axis")
        .call(d3.axisLeft(newYScale).ticks(4));

       lineSelected = d3.line<number>()
        .x((d, i) => newXScale(new Date(fechasFiltradasSolo[i])))
        .y(d => newYScale(d)) 
        .curve(d3.curveMonotoneX);
        if(type==1){
          overviewSvg.selectAll("path.line-eda-path-1")
          .data(EdaData)
           .attr("d", lineSelected)
        }
        if(type==3){
          overviewSvg.selectAll("path.line-bvp-path-3")
          .data(BvpData)
           .attr("d", lineSelected)
        }
   
  }

}
const datas:any[] = [];
const dataSujetoRadar:any[] = []
function plot_radar(cuestionarios: Cuestionarios, sujeto:string) {
  const featuress = ["PANAS", "STAI", "DIM", "SSSQ"]; // Radar features
  const width = 250, height = 250; // Radar SVG dimensions
  const centerX = width / 2, centerY = height / 2; // Radar chart center
  const maxRadius = 80; // Max radius for the radar chart
  const colors = ["green", "yellow", "skyblue", "red", "pink"];
  const pruebas = ["Base", "Fun", "Medi 1", "TSST", "Medi 2"];
  let offsetX = 5;
  // Clear and recreate the radar SVG
  const radarContainer = d3
    .select(".radar-grid-tile .scrollable-container")
    .selectAll("*")
    .remove();

  const radarSvg = d3
    .select(".radar-grid-tile .scrollable-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${centerX / 2},${centerY / 3})`);

  // Scale for radial distances
  const radialScale = d3.scaleLinear().domain([0, 10]).range([0, maxRadius]);

  // Ticks for the radar grid
  const ticks = [2, 4, 6, 8, 10];

  // Draw radar circles
  radarSvg
    .selectAll("circle")
    .data(ticks)
    .join("circle")
    .attr("cx", centerX / 2)
    .attr("cy", centerY / 2)
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("r", d => radialScale(d));

  // Add tick labels
  radarSvg
    .selectAll(".ticklabel")
    .data(ticks)
    .join("text")
    .attr("class", "ticklabel")
    .attr("x", centerX / 2)
    .attr("y", d => centerY / 2 - radialScale(d))
    .text(d => d.toString())
    .attr("font-size", "10px");

  // Convert angles to coordinates
  const angleToCoordinate = (angle: number, value: number) => {
    const x = Math.cos(angle) * radialScale(value);
    const y = Math.sin(angle) * radialScale(value);
    return { x: centerX / 2 + x, y: centerY / 2 - y };
  };

  // Map features to angles
  const featureData = featuress.map((f, i) => {
    const angle = (Math.PI / 2) + (2 * Math.PI * i / featuress.length);
    return {
      name: f,
      angle: angle,
      line_coord: angleToCoordinate(angle, 10),
      label_coord: angleToCoordinate(angle, 11),
    };
  });

  // Draw axis lines
  radarSvg.selectAll("line")
  .data(featureData)
  .join(
      enter => enter.append("line")
          .attr("x1", 125 / 2)
          .attr("y1", 125 / 2)
          .attr("x2", d => d.line_coord.x)
          .attr("y2", d => d.line_coord.y)
          .attr("stroke","black")
  );
  // Draw axis labels
  radarSvg.selectAll(".axislabel")
    .data(featureData)
    .join(
        enter => enter.append("text")
            .attr("x", d => d.label_coord.x)
            .attr("y", d => d.label_coord.y)
            .text(d => d.name)
    );

  // Radar line generator
  const line = d3
    .line<{ x: number; y: number }>()
    .x(d => d.x)
    .y(d => d.y);

  // Convert data points to radar coordinates
  function getPathCoordinates(data_point:any){
    let coordinates = [];
    for (var i = 0; i < featuress.length; i++){
        let ft_name = featuress[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / featuress.length);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
}

  // Format cuestionarios into radar data
 

  // Generate the data
  dataSujetoRadar.push(sujeto);
  for (let i = 0; i < 1; i++) {
    var point: any= {}; // Initialize as a partial Cuestionarios object
  
    // Dynamically generate each feature
    featuress.forEach(f => {
      const value = cuestionarios[f as keyof typeof cuestionarios];
      const numPoints = value !== null ? Math.round(value) : 0;
      point[f] = numPoints;
      
    });
    
    datas.push(point); // Type assertion to ensure point matches Cuestionarios
  }
  datas.forEach((item, index) => {
    console.log(`Element ${index} type:`, typeof item);
    console.log(`Element ${index} structure:`,typeof item);
  });
    
  radarSvg.selectAll("path")
  .data(datas)
  .join(
      enter => enter.append("path")
        .datum(d => getPathCoordinates(d))
        .attr("d" , line)
        .attr("stroke-width", 3)
        
        .attr("fill", (_, i) => colors[i])
        
        .attr("opacity", 0.3)
        .attr("id",(_, i) => dataSujetoRadar[i])
  );


  
  offsetX += 5;
  console.log("Radar data plotted:", datas);
}

async function plot_chart_segments_detailed(data: SujetoData , questionData : SujetoQuestion , type : any,signal : string) {
  
  const margin_focus = {top: 50, right: 30, bottom: 30, left: 20};
      const width_focus = 800- margin_focus.left - margin_focus.right;
      const height_focus = 150 - margin_focus.top - margin_focus.bottom;
        // Al hacer clic en la línea, actualizar el gráfico secundario
        const selectedData = data.Datos;
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
    console.log(intervalosPruebas)
        const xScaleSelected = d3.scaleTime()
        .domain([d3.min(data.Fecha.map(f => new Date(f))) as Date, d3.max(data.Fecha.map(f => new Date(f))) as Date])
        .range([0, width_focus]); // Ancho del gráfico secundario temporal
    
      // Escala Y para el gráfico secundario temporal
      const yScaleSelected = d3.scaleLinear()
        .domain([d3.min(data.Datos)!, d3.max(data.Datos)!]) // Ajusta el dominio según tus datos
        .range([height_focus, 0]); // Alto del gráfico secundario temporal
    
      // Generador de línea para el gráfico secundario temporal
     
        

      // Crear contenedor SVG para el gráfico secundario temporal
      
      const lineSelected = d3.line<number>()
      .x((d, i) => xScaleSelected(new Date(data.Fecha[i])))
      .y(d => yScaleSelected(d))
      .curve(d3.curveMonotoneX);
     
  let newGridTile = d3.select(".eda-grid-tile .scrollable-container");
  if(type ==1){
    d3.selectAll(".temp-grid-tile .scrollable-container svg").remove();
    newGridTile = d3.select(".temp-grid-tile .scrollable-container");
  }else if (type==2){
    d3.selectAll(".eda-grid-tile .scrollable-container svg").remove();
    newGridTile = d3.select(".eda-grid-tile .scrollable-container");
  }else{
    d3.selectAll(".bvp-grid-tile .scrollable-container svg").remove();
    newGridTile = d3.select(".bvp-grid-tile .scrollable-container");
  }
 
 
    
intervalosPruebas.forEach((d:IntervalosPruebas) => {
            console.log("Aqui ",d.Pruebas);

      });

      // Crear contenedor SVG para el gráfico secundario temporal
      const overviewSvg = newGridTile.append("svg")
        .attr("width", width_focus + margin_focus.left + margin_focus.right)
        .attr("height", height_focus + margin_focus.top + margin_focus.bottom)
        .append("g")
        .attr("transform", `translate(${margin_focus.left + 10},${margin_focus.top})`);

      // Agregar la línea seleccionada al gráfico secundario temporal
      overviewSvg.append("path")
        .datum(selectedData)
        .attr("class", "line")
        .attr("d", lineSelected)
        .style("stroke", "red")
        .style("stroke-width", 2)
        .style("fill", "none")
        .style("color", "blue")
        ;
       overviewSvg.append("text")
        .attr("x", (width_focus / 2))
        .attr("y", 0 - (margin_focus.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("text-decoration", "underline")
        .text(`Sujeto: ${data.Sujeto} ${signal}`);

        overviewSvg.append("g")
        .attr("transform", `translate(0,${height_focus})`)
        .call(d3.axisBottom(xScaleSelected))
        ;
        if (!questionData) {
                console.error("Loaded JSON is undefined or null");
                return;
            }
        overviewSvg.append("g")
        .call(d3.axisLeft(yScaleSelected).ticks(4));
      
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