// Code from Mike Bostock: https://observablehq.com/@mbostock/global-temperature-trends

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import dataLoad from "./data/temperatures.csv";
import "./17ScatterPlot.css";

const ScatterPlot = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  /// states ///
  const [data, setData] = useState();

  /// constants ///
  // dimensions 
  const height = 500;
  const width = 700;
  const margin = {top: 20, right: 30, bottom: 30, left: 40}

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad).then(d => {
      const data = [];
      const columns = d.columns;
      d.forEach(element => {
        for (let i = 1; i < 13; i++){
          data.push({
            date: new Date(Date.UTC(element.Year, i - 1, 1)),
            value: +element[columns[i]]
          });
        }
      });
    setData(data)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data){
      console.log(data)
      /// Scales ///
      // X Scale 
      const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right])
      // Y Scale 
      const y = d3.scaleLinear() 
        .domain(d3.extent(data, d => d.value)).nice()
        .range([height - margin.bottom, margin.top])
      // Z Scale - colour scale for the temperatures 
      const max = d3.max(data, d => Math.abs(d.value))
      const z = d3.scaleSequential(d3.interpolateRdBu)
        .domain([max, -max])

      /// Axes ///
      // X Axis 
      const xAxis = g => g  
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width/80))
        .call(g => g.select(".domain").remove())
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y).ticks(null, "+"))
        .call(g => g.select(".domain").remove())
        // draw a horizonatal line at the 0 degrees tick 
        .call(g => g.selectAll(".tick line")
          .filter(d => d === 0)
          .clone()
            .attr("x2", width - margin.right - margin.left)
            .attr("stroke", "#ccc")
            )
        // att text to the right of the top tick 
        .call(g => g.append("text")
            .attr("fill", "#000")
            .attr("x", 5)
            .attr("y", margin.top)
            .attr("dy", "0.32em")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Anomaly (C)")
        );

        /// Graph ///
        // Graphing area
        const svg = d3.select(svgRef.current)
          .attr("width", width)
          .attr("height", height)
          .append("g")

        // Circles for the scatter plot 
        const scatterPlot = svg.selectAll("circle")
          .data(data)
          .join("circle")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.value))
            .attr("fill", d => z(d.value))
            .attr("r", 2.5)
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.2)

        // Call the axes 
        d3.select(xAxisRef.current).call(xAxis);
        d3.select(yAxisRef.current).call(yAxis);
        



    } else {
      console.log("Missing data")
    }
  }, [data])


  return (
    <>
      <h1>Day 17: Scatter Plot</h1>
      <div className="wrapper">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>
      </div>
    </>
  )
};

export { ScatterPlot }