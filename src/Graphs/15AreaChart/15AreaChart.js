// Code from Mike Bostock : https://observablehq.com/@d3/area-chart

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./15AreaChart.css"
import dataLoad from "./data/aapl.csv";

const AreaChart = () => {

  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  /// states ///
  const [data, setData] = useState(null);

  /// constants ///
  // dimensions 
  const height = 500;
  const width = 700;
  const margin = {top: 20, right: 20, bottom: 30, left: 30}

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setData(d)
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
        .domain([0, d3.max(data, d => d.close)]).nice()
        .range([height - margin.bottom, margin.top])

      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
      // Y Axis 
      const yAxis = g => g  
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("close")
        )
      
      /// Graph ///
      // Curve 
      const curve = d3.curveLinear // also try curveNatural 
      // Area 
      const area = d3.area()
        .curve(curve)
        .x(d => x(d.date))
        .y0(y(0))
        .y1(d => y(d.close))
      // Graphing area 
      const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)
      // Draw area 
      const areaChart = svg.append("path")
        .datum(data)
        .attr("fill", "steelblue")
        .attr("d", area)

      // Events testing 
      areaChart
        .on("mousemove", function(e){
          //console.log(this)
          areaChart.attr("fill", "pink")
        })
        .on("mouseleave", function(e){
          areaChart.attr("fill", "steelblue")
        });

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis);
      d3.select(yAxisRef.current).call(yAxis);



    } else {
      console.log("Missing data")
    }
  }, [data])


  return (
    <>
      <h1>Day 15: Area Chart</h1>
      <div className="wrapper">
        <svg ref={svgRef}>
          <g ref={gRef}></g>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>
      </div>
    </>
  )
};

export { AreaChart }