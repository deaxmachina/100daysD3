// Code from Mike Bostock: https://observablehq.com/@d3/stacked-bar-chart

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./14StackedBarChart.css";
import dataLoad from "./data/us-population-state-age.csv";

const StackedBarChart = () => {

  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const legendRef = useRef();

  /// states ///
  const [data, setData] = useState();

  /// constatns ///
  // dimensions 
  const height = 600;
  const width = 900;
  const margin = {top: 10, right: 10, bottom: 20, left: 40}
  // formatting 
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      const categories = d.columns.slice(1) // all the numeric columns
      // add a totals to each entry 
      d.forEach(element => (
        element.total = d3.sum(categories, category => element[category])
      ));
      // sort by total 
      const dSorted = d.sort((a, b) => b.total - a.total)
      setData(dSorted)
    });
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      /// Data transform ///
      // transform into stack 
      const stack = d3.stack()
        .keys(data.columns.slice(1)) // categories we want to stack 
      const series = stack(data).map(d => (d.forEach(v => v.key = d.key), d))

      /// Scales ///
      // X Scale 
      const x = d3.scaleBand()
        .domain(data.map(d => d.name)) // list of the states - one per band 
        .range([margin.left, width - margin.right])
        .padding(0.1)
      // Y Scale 
      const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]) // the max of all the maxes 
        .rangeRound([height - margin.bottom, margin.top])
      // Colour 
      const color = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(d3.schemeSpectral[series.length])
        .unknown("#ccc")

      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove())
      // Y Axis 
      const yAxis = g => g  
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        .call(g => g.selectAll(".domain").remove())

      /// Graph ///
      // Graphing area 
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)

      // Bar Chart 
      // One group for each stack level 
      const stacks = svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
      // One bar chart for each stack level 
      const bars = stacks 
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("fill", d => color(d.key))
          .attr("x", (d, i) => x(d.data.name)) //d.data comes from the stack 
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("y", d => y(d[1])) // start from the top for each stack 
          .attr("width", x.bandwidth())

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)

    } 
  }, [data])



  return (
    <>
      <h1>Stacked Bar Chart</h1>
      <div className="wrapper">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
          <g ref={legendRef}></g>
        </svg>
      </div>
    </>
  )
};

export { StackedBarChart };