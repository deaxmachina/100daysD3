// Code modified from: https://observablehq.com/@d3/styled-axes
// All axis code in this collection: https://observablehq.com/collection/@d3/d3-axis

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const StyledAxes = () => {
  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  /// constants ///
  const height = 500;
  const width = 700;
  const margin = {top: 20, right: 10, bottom: 30, left: 10}

  /// D3 Code ///
  useEffect(() => {
    /// Graph area ///
    const svg = d3.select(svgRef.current)
      .attr("height", height)
      .attr("width", width)

    /// Scales ///
    // X Scale 
    const x = d3.scaleTime()
      .domain([new Date(2010, 1, 1), new Date(2020, 1, 1)])
      .range([margin.left, width - margin.right])
    // Y Scale 
    const y = d3.scaleLinear()
      .domain([0, 2e6])
      .range([height - margin.bottom, margin.top])

    /// Axes ///
    // X Axis //
    /*
      Here the x-axis domain path is removed, 
      since it will overlap with the y = 0 tick line. 
      The x-axis is translated vertically to place it at 
      the bottom of the chart area. We’re also using a fancy 
      time format that shows ticks for every three months, 
      but only labels the years.
     */
    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x)
          .ticks(d3.timeMonth.every(3))
          .tickFormat(d => d <= d3.timeYear(d) ? d.getFullYear() : null))
      .call(g => g.select(".domain")
          .remove())

    // Y Axis //
    /*
      The format function for y tick labels first converts 
      the given value to millions (dividing by 1e6 = 1,000,000), 
      then converts to fixed-point notation with a single decimal digit. 
      By testing this.parentNode.nextSibling, the function can 
      special-case the topmost tick label to give the units; 
      the remaining ticks have a preceding non-breaking space (\xa0) 
      so that the numbers align with the dollar sign.
     */
    function formatTick(d) {
      const s = (d / 1e6).toFixed(1);
      return this.parentNode.nextSibling ? `\xa0${s}` : `$${s} million`;
    }

    const yAxis = g => g  
      .attr("transform", `translate(${margin.left}, ${0})`)
      .call(d3.axisRight(y)
          .tickSize(width - margin.left - margin.right)
          .tickFormat(formatTick)
      )
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "2,4") // length of stroke, length of space between strokes
      )
      .call(g => g.selectAll(".tick text")
          .attr("x", 4)
          .attr("dy", -3)

      )



    // Call the axes 
    d3.select(xAxisRef.current).call(xAxis)
    d3.select(yAxisRef.current).call(yAxis)

  }, [])

  return (
    <>
      <h1>Day 16: Styling Axes</h1>
      <h3>25th Nov 2020</h3>
      
      <div className="wrapper">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>
      </div>
    </>
  )
}

export { StyledAxes }
