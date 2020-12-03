//code from https://observablehq.com/@d3/pie-chart
// Currently broken 

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3"; 
import dataLoad from "./population-by-age.csv"

const PieChart = () => {

  const svgRef = useRef();

  const [data, setData] = useState("");

  // DIMENSIONS //
  const width = 700;
  const height = Math.min(width, 500);

  // DATA //
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d =>  {
      setData(d);
    })
  }, [])

  // d3 
  useEffect(() => {
    
    // SCALES//
    // Colour Scale 
    // for the colours of each pie segment 
    if (data) {
      const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name)) // array of the age options 
      .range(d3.quantize(t => 
          d3.interpolateSpectral(t * 0.8 + 0.1),
          data.length
          ).reverse()
        )

    // ARC //
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height)/2 - 1)
    // arc label 
    const radius = Math.min(width, height)/2 * 0.8;
    const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius)

    // PIE //
    const pie = d3.pie()
        .sort(null)
        .value(d => d.value)
    const arcs = pie(data)
    
    const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)
      

        svg.append("g")
        .attr("stroke", "white")
      .selectAll("path")
      .data(arcs)
      .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arc)
      .append("title")
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);
  
    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(arcs)
      .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.name))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value.toLocaleString()));
        
    }
  }, [data])


  return (
    <div>
      <svg ref={svgRef}>

      </svg>
    </div>
  )
};

export default PieChart;