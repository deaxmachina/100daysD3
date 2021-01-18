// Code based on Mike Bostock: https://observablehq.com/@d3/radial-area-chart
// Data from: https://myanimelist.net/

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./19RadialAreaChart.css";
import dataLoad from "./data/avg_min_max_anime_per_year.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p>Data source: <a href="https://myanimelist.net/" target="_blank">My Anime List </a> (https://myanimelist.net/)</p>
      <p className="disclaimer">*based on the anime (of all types) on MAL </p>
    </>
  )
}

const MyRadialAreaChart = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const width = 850;
  const height = 600;
  const margin = 10;
  // inner and outer radius 
  const innerRadius = height/10;
  const outerRadius = height/2 - margin;
  // colours 
  const colour1 = "#6d597a"
  const colour2 = "#355070"
  const lineColour = "#e56b6f"

  /// Data load ///
  useEffect(() => {
    setData(dataLoad)
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      /// Scales ///
      // X Scale - for the time; i.e. the circles scale 
      const x = d3.scaleLinear()
        .domain([1, 13]) // number of months + 1
        .range([0, 2*Math.PI]) // around the circle 
      // Y Scale - the radial lines around the circles; 
      const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.min), d3.max(data, d => d.max)]) 
        .range([innerRadius, outerRadius])

      /// Graph ///
      // Graphing area 
      const svg = d3.select(gRef.current)
          .attr("transform", `translate(${width/2}, ${height/2})`)

      /// Gradients ///
      //Append a defs (for definition) element to SVG
      var defs = svg.append("defs");
      // radial gradient
      function getRadialGradient(startColor, endColor, id){
        const radialGradient = defs.append("radialGradient")
            .attr("id", id)
        //Set the color for the start (0%)
        radialGradient.append("stop")
          .attr("offset", "50%")
          .attr("stop-color", startColor); 
        //Set the color for the end (100%)
        radialGradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", endColor); 
        return radialGradient
      }
      const radialGradient = getRadialGradient(colour1, colour2, `radial-gradient`)
      
      // Line - for the average line 
      const line = d3.lineRadial()
        .curve(d3.curveBasisClosed)
        .angle(d => x(d.index))
      // Area - for the area charts 
      const area = d3.areaRadial()
        .curve(d3.curveBasisClosed)
        .angle(d => x(d.index))

      // Area Chart 
      const areaChart = svg.append("path")
        .style("fill", `url(#radial-gradient)`)
        .attr("fill-opacity", 0.80)
        .attr("d", area
          .innerRadius(d => y(d.min))
          .outerRadius(d => y(d.max))
          (data));

      // Line chart - single line for the average anime  
      const lineChart = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", lineColour)
        .attr("stroke-width", 2.5)
        .attr("d", line
          .radius(d => y(d.avg))
          (data)); 
    
      /// Axes ///
      // X Axis 
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
      const xAxis = g => g
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("font-weigth", 'bold')
        .call(g => g.selectAll("g")
          .data(x.ticks())
          .join("g")
            .call(g => g.append("path")
                .attr("id", (d, i) => `wavy-${i}`) 
                .attr("stroke", "#F7D1CD")
                .attr("stroke-opacity", 0.25)
                .attr("d", d => `
                  M${d3.pointRadial(x(d), innerRadius)}
                  L${d3.pointRadial(x(d), outerRadius)}
                `))
            .call(g => g.append("text")
                .append("textPath")
                .attr("startOffset", 0)
                .attr("xlink:href", (d, i) =>`#wavy-${i}`)
                .attr("fill", '#F7D1CD')
                .attr("stroke", "#F7D1CD")
                .attr("stroke-width", 1)
                .text((d, i) => months[i]))
                )

      // Y Axis 
      const yAxis = g => g
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .call(g => g.selectAll("g")
        .data(y.ticks(5).reverse())
        .join("g")
          .attr("fill", "none")
          .call(g => g.append("circle")
              .attr("stroke", "#F7D1CD")
              .attr("stroke-opacity", 0.15)
              .attr("r", y))
          .call(g => g.append("text")
              .attr("y", d => -y(d))
              .attr("dy", "0.35em")
              .attr("color", 'white')
              .attr("stroke", "#F7D1CD")
              .attr("stroke-width", 1)
              .text((x, i) => `${x.toFixed(0)}${i ? "" : " animes"}`)
            .clone(true)
              .attr("y", d => y(d))
            .selectAll(function() { return [this, this.previousSibling]; })
            .clone(true)
              .attr("fill", "currentColor")
              .attr("stroke", "none")))
      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)

    } 
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container19">
      <h1>Day 19&20: Radial Area and Line Plot</h1>
      <h2>Min, max and average number of anime per month, 1917-2020</h2>
      <h3>28th-29th Nov 2020</h3>
      <button 
        className="graph-explain-icon" 
        onClick={toggleGraphExplanation}
      >
        <FontAwesomeIcon icon={faBookOpen} size="md"/>
        <span className="info-span">info</span>
      </button>  
      {
        revealGraphExplanation 
        ? <GraphExplain />
        : null
      } 

      <div className="wrapper wrapper19">
        <svg ref={svgRef} width={width} height={height}>
            <g ref={gRef}>
              <g ref={xAxisRef}></g>
              <g ref={yAxisRef}></g>
            </g>
          </svg>
      </div>
    </div>
  )
};

export { MyRadialAreaChart }