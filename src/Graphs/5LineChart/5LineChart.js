// Code from: https://observablehq.com/@d3/line-chart

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./5LineChart.css";
import dataLoad from "./data/aapl.csv"

const LineChart = () => {
  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  /// states ///
  const [data, setData] = useState(null);

  /// Dimensions ///
  const height = 500;
  const width = 900;
  const margin = {top: 20, right: 30, bottom: 30, left: 40}
  const colour = "maroon"


  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      d.forEach(element => {
        element.value = element.close
      })
      setData(d)
    })
  }, [])

  /// D3 code ///
  useEffect(() => {
    if (data) {
      /// Scales ///
      // X Scale - special scale for datetime 
      const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right])
      // Y Scale - just a linear scale for the numerical values 
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([height - margin.bottom, margin.top]) // revese 

      /// Axes ///
      // X Axis 
      const xAxis = g => g  
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width/80).tickSizeOuter(0))
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("$ Close")
        );

      /// Graph ///
      // line 
      /*
      const line = d3.line()
        //.defined(d => !isNaN(d.value)) // not sure what this does, seems to work without it 
        .x(d => x(d.date))
        .y(d => y(d.value))
      */

      const line = d3.line(d => x(d.date), d => y(d.value))
        .curve(d3.curveNatural);
      
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)

      // Define a path and call the line on it to draw the line graph
      const path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colour)
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line)

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis);
      d3.select(yAxisRef.current).call(yAxis)



    } 
  }, [data])


  return (
    <>
      <h1>Line chart</h1>
      <div className="wrapper">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>
      </div>
    </>   
  )
};

export { LineChart }