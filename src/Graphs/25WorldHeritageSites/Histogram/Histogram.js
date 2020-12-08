// Code based on Mike Bostock https://observablehq.com/@d3/histogram

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";



const Histogram = ({ data, width, height, setBrushExtent }) => {

  /// refs ///
  const gRef = useRef()
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const brushRef = useRef();

  // dimensions 
  const margin = {top: 10, right: 20, bottom: 25, left: 40}
  // colours 
  const barsColour = '#804D57'


  /// D3 Code ///
  useEffect(() => {
      /// Scales ///
      // X Scale 
      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right])
        .nice();

      /// bins ///
      const [start, stop] = xScale.domain() 
      const binnedData = d3.bin()
        .value(d => d.date) // the value that we want to bin 
        .domain(xScale.domain())
        .thresholds(d3.timeYears(start, stop))(data)
        .map(array => ({
          y: array.length,
          x0: array.x0,
          x1: array.x1
        }));

      // Y Scale 
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(binnedData, d => d.y)])
        .range([height - margin.bottom, margin.top]);
  
    
      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0))

      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(yScale).ticks(3))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 4)
          .attr("text-anchor", "start")
          .attr("font-weigth", "bold")
          .text("number sites added")
      );

      /// Graph ///
      // Graphing space 
      const svg = d3.select(gRef.current)

      // Bars 
      const histogram = svg.append("g")
        .selectAll("rect")
        .data(binnedData)
        .join("rect")
          .attr("fill", barsColour)
          .attr("x", d => xScale(d.x0) + 1)
          .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
          .attr("y", d => yScale(d.y))
          .attr("height", d => yScale(0) - yScale(d.y));  
  
      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)


      /// Brush ///
      // event.selection gives [start pixel of brush, end pixel of brush]
      // you can invert these pixel value to find the original values of the 
      // date that they correspond to, in this case the start and end dates 
      // 'brush end' means that we are listening for the two events brush and end 
      const brush = d3.brushX()
        .extent([
          [0, 0], 
          [width, height - margin.bottom]
        ]);
      brush(d3.select(brushRef.current));
      brush.on('brush end', (event) => {
        setBrushExtent(event.selection && event.selection.map(xScale.invert));
      });
  }, [data, width, height])

  return (
      <>
        <g transform={`translate(${3}, ${0})`}>
          <rect 
            width={width - 6} 
            height={height} 
            rx={20}
            fill="#6d6875">
          </rect>
        </g>       
        <g ref={gRef}></g>
        <g ref={xAxisRef}></g>
        <g ref={yAxisRef}></g>   
        <g ref={brushRef} />     
      </>

  )
};

export { Histogram }