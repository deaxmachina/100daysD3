// code from https://observablehq.com/@d3/stacked-bar-chart

import React, { useState, useEffect, useRef } from "react"
import * as d3 from "d3";
import dataLoad from "./us-population-state-age.csv";

const BarChartStacked = () => {

  const svgRef = useRef();

  const [data, setData] = useState("")

  // DIMENSIONS //
  const height = 600;
  const width = 900;
  const margin = {
    top: 10,
    right: 10,
    bottom: 20,
    left: 40
  }
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  // DATA//
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(data => {
      data.forEach(d => {
        d.total = d3.sum(data.columns, c => d[c])
      });
      data.sort((a, b) => d3.descending(a.total, b.total));
      setData(data);
    })
  }, [])

  // d3
  useEffect(() => {
    if (data) {

      // Data Transform 
      // Make the data into stacked bar chart format 
      // for each bar, each numerical col of the data is one of the stacks 
      // get array of arrays where each array corresponds to one column
      // and these will correspond to the number of stacks in each stacked bar
      const series = d3.stack()
        .keys(data.columns.slice(1)) // columns on which to stack - in this case all but the first one 
        (data)
      //.map(d => (d.forEach(v => v.key = d.key), d))


      // SCALES //
      // X Scale 
      // band scale for the bars horizontally 
      const x = d3.scaleBand()
        .domain(data.map(d => d.name)) // list of all the states, whose length = number of bars 
        .range([margin.left, width - margin.right])
        .padding(0.1)

      // Y Scale 
      // use stacks to find the highest the data will go when numbers are stacked 
      const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]) // the max of all the stacked bars
        .rangeRound([height - margin.bottom, margin.top])

      // Colour 
      const color = d3.scaleOrdinal()
        .domain(series.map(d => d.key)) // list of the values for each stack = columns 
        .range(d3.schemeSpectral[series.length]) // for each stack, create a colour


      // GRAPH //
      const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)

      svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
          .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("x", (d, i) => x(d.data.name))
          .attr("y", d => y(d[1])) // start of y is the end of each stack i.e. d[1]
          .attr("height", d => y(d[0]) - y(d[1])) // height is the start of each stack - the end of each stack
          .attr("width", x.bandwidth())

      // AXES //
      // X Axis 
      const xAxis = g => g  
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove())
      
      svg.append("g")
        .call(xAxis)

      // Y Axis 
      const yAxis = g => g  
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        .call(g => g.selectAll(".domain").remove())
      
      svg.append("g")
        .call(yAxis)






    }
  }, [data])

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  )
};

export default BarChartStacked;