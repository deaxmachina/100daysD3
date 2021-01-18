// Code from Mike Bostock: https://observablehq.com/@d3/grouped-bar-chart

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./13GroupedBarChart.css";
import dataLoad from "./data/data.csv";

const GroupedBarChart = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const legendRef = useRef();

  /// states ///
  const [data, setData] = useState(null);

  /// dimensions ///
  const width = 700;
  const height = 500;
  const margin = {top: 10, right: 10, bottom: 20, left: 40}

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setData(d)
    })
  }, [])

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      // columns that we want to use for bars (age groups)
      const keys = data.columns.slice(1)
      // what we want to groupby - state 
      const groupKey = data.columns[0] // "State"

      /// Scales ///
      // X Scale 0 - for each grouping of bars; one grouping for each state
      // this is just to create "windows" for each grouping of the right size 
      // and not to draw actual bars; it is a group of containers, one for each bar chart grouping
      const x0 = d3.scaleBand()
        .domain(data.map(d => d[groupKey])) // array of the states ["California", ...]
        .rangeRound([margin.left, width - margin.right]) 
        .paddingInner(0.1) // padding between the groups 
      // X Scale 0 - for each grouping, create one mini bar chart 
      // whose size is defined by the X scale 0 
      const x1 = d3.scaleBand()
        .domain(keys) // array of the age groups; we want to draw a band per group per state 
        .rangeRound([0, x0.bandwidth()]) // note that this assumes all groups are the same width
        .padding(0.05) // padding between the bars in the groups 

      // Y Scale 
      const y = d3.scaleLinear()
        .domain([
          0,
          d3.max(data, d => d3.max(keys, key => d[key])) // finds the max among all the categories 
        ]).nice()
        .rangeRound([height - margin.bottom, margin.top])

      // Colour Scale 
      const color = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])

      /// Axes ///
      // X Axis 
      const xAxis = g => g  
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x0).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        .call(g => g.select(".domain").remove())


      /// Graph ///
      // Graphing area
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
      const graph = svg.append("g")
        // Create a group for each mini bar chart and 
        // translate accoring to the x0 scale 
        // data is the data so there is one group for each state
        .selectAll("g")
        .data(data)
        .join("g")
          .attr("transform", d => `translate(${x0(d[groupKey])}, ${0})`)
        // Each mini bar chart, one for each state 
        // data is each state, for which we create array of elements 
        // one for each grouping 
        .selectAll("rect")
        .data(d => keys.map(key => ({key: key, value: d[key]})))
        .join("rect")
          .attr("x", d => x1(d.key))
          .attr("y", d => y(d.value))
          .attr("width", x1.bandwidth())
          .attr("height", d => y(0) - y(d.value))
          .attr("fill", d => color(d.key))

      /// Legend /// 
      const legendGroups = svg.append("g")
          .attr("transform", `translate(${width}, ${0})`)
        .selectAll("legend-g")
        .data(color.domain().slice().reverse())
        .join("g")
          .attr("class", "legend-g")
          .attr("transform", (d, i) => `translate(${0}, ${i * 20})`)

      const legendRects = legendGroups.append("rect")
        .attr("x", -20)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", color)

      const legendText = legendGroups.append("text")
        .attr("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("x", -24)
        .attr("y", 9.5)
        .attr("dy", "0.35em")
        .text(d => d)
  

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)



    } 
  }, [data])


  return (
    <>
      <h1>Grouped Bar Chart</h1>
      <div className="wrapper">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>
      </div>
    </>
  )
};

export { GroupedBarChart }