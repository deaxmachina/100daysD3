// code from Mike Bostock :https://observablehq.com/@d3/stacked-normalized-horizontal-bar

import React, { useState,  useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./4BarChartStackedNormalized.css";
import dataLoad from "./data/us-population-state-age.csv"

const BarChartStackedNormalzed = () => {
  /// refs ///
  const svgRef = useRef();

  /// states ///
  const [data, setData] = useState();
  const [series, setSeries] = useState();

  /// Dimensions ///
  const height = 600;
  const width = 800;
  const margin =  {top: 30, right: 10, bottom: 0, left: 30};

  /// Formatting ///
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en");
  const formatPercent = d3.format(".1%");

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      console.log(d)
      // for each entry create col with the total of all the numeric values
      const columns = d.columns.slice(1)
      d.forEach(dataPoint => {
        dataPoint.total = d3.sum(columns, col => dataPoint[col])
      });
      const dSorted = d.sort((a, b) => b["<10"] / b.total - a["<10"] / a.total)
      setData(dSorted)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {
      /// Data transform ///
      // Create 9 arrays - one for each category (in this case age group)
      // Each array comtins as many elements as the original data (52 in this case for all the states)
      // Each element in those arrays contains start point, end point, key and the data itself in an object
      const stack = d3.stack()
        .keys(data.columns.slice(1))
        .offset(d3.stackOffsetExpand) // this is to make sure that the bars always reach 100% of the width of the graph
      const series = stack(data)
          .map(d => (d.forEach(v => v.key = d.key), d)) // this just adds the "key" to each col, i.e. the name of the original column
      setSeries(series)
      console.log(series)

      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .range([margin.left, width - margin.right])
      // Y Scale 
      const y = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.top, height - margin.bottom]) // going top to bottom
        .padding(0.08)
      // Colour Scale 
      const color = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(d3.schemeSpectral[series.length])
        .unknown("#ccc")

      /// Axes ///
      // X Axis 
      const xAxis = g => g  
        .attr("transform", `translate(${0}, ${margin.top})`)
        .call(d3.axisTop(x).ticks(width / 100, "%")) //format the ticks to have a %
        .call(g => g.selectAll(".domain").remove())
      // Y Axis
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove())

      /// Graph ///
      const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)
        .style("overflow", "visible")
        .append("g")
      
      // create one group for each of the 9 categories (i.e. 9 age groups)
      const groups = svg.selectAll("g")
        .data(series)
        .join("g")
        
      const rects = groups.selectAll("rect")
        .data(d => d) // each d here is 52 elements, one for each state
        .join("rect")
          .attr("x", d => x(d[0]))
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("y", d => y(d.data.name))
          .attr("height", y.bandwidth())
          .attr("fill", d => color(d.key))
      
      /*
      const title = rects.append("title")
        .text(d => `${d.data.name} ${d.key} 
        ${formatPercent(d[1] - d[0])} (${formatValue(d.data[d.key])})
        `)
      */

      // Call the axes 
      svg.append("g").call(xAxis);
      svg.append("g").call(yAxis)


    } else {
      console.log("Missing data")
    }
  }, [data])


  return (
    <>
      <h1>Day 4: Stacked  normalised horizontal bar chart</h1>
      <h3>12th Nov 2020</h3>
      <div className="wrapper">
        <svg ref={svgRef}></svg>
      </div>
    </>
  )
};

export { BarChartStackedNormalzed };