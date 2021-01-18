// Code by Mike Bostock on https://observablehq.com/@d3/diverging-bar-chart

import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./11DivergingBarChart.css";
import dataLoad from "./data/state-population-2010-2019.tsv"

const DiverginingBarChart = () => {
  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  /// states ///
  const [data, setData] = useState(null);

  /// dimensions ///
  const height = 700;
  const width = 500;
  const margin = {top: 30, right: 60, bottom: 10, left: 60};

  /// other constants ///
  const format = d3.format("+,.0%")


  /// Data load ///
  useEffect(() => {
    d3.tsv(dataLoad).then(d => {
      d.forEach(element => {
        element.name = element.State
        element.value0 = element['2010']
        element.value1 = element['2019']
        element.value = ((element['2019'] - element['2010']) / element['2010'])
      });
      // sort the values 
      const dSorted = d.sort((a, b) => d3.ascending(a.value, b.value))
      // pick out only the needed data 
      const dUseful = dSorted.map(element => _.pick(element, ["name", "value"]))
      setData(dUseful)    
    });
  }, [])

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.value))
        .rangeRound([margin.left, width - margin.right])
      // Y Scale 
      const y = d3.scaleBand()
        .domain(d3.range(data.length)) // or you can use list of all the states 
        .rangeRound([margin.top, height - margin.bottom]) // top to bottom 
        .padding(0.1)

      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${margin.top})`)
        .call(d3.axisTop(x).ticks(5).tickFormat(format))
        .call(g => g.select(".domain").remove())
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${x(0)},0)`)
        .call(d3.axisLeft(y).tickFormat(i => data[i].name).tickSize(0).tickPadding(6))
        .call(g => g.selectAll(".tick text").filter(i => data[i].value < 0)
            .attr("text-anchor", "start")
            .attr("x", 6))
        .call(g => g.select(".domain").remove())


      /// Graph ///
      // Graph space 
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)

      // Bars of the bar chart 
      const bars = svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
          .attr("fill", d => d3.schemeSet1[d.value > 0 ? 1 : 0])
          // x position start at 0 or the min value, i.e. for the nagive ones 
          // start at that value and for the positive ones start at 0 
          .attr("x", d => x(Math.min(d.value, 0)))
          .attr("y", (d, i) => y(i))
          // take abs as for the negative values we would otherwise end up with 
          // negative pixel value for the width
          .attr("width", d => Math.abs(x(d.value) - x(0)))
          .attr("height", y.bandwidth())

      // Text to be displayed about each bar, i.e. 
      // to the right of the positive bars and 
      // to the left of the negative bars 
      const barsText = svg.append("g")
        .selectAll("text")
        .data(data)
        .join("text")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", d => d.value < 0 ? "end" : "start")
          .attr("x", d => x(d.value) + Math.sign(d.value - 0) * 4)
          .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
          .attr("dy", "0.35em")
          .text(d => format(d.value));

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)

    } 
  }, [data])

  return (
    <>
      <h1>Divergining Bar Chart</h1>
      <div className="wrapper"></div>
      <svg ref={svgRef}>
        <g ref={xAxisRef}></g>
        <g ref={yAxisRef}></g>
      </svg>
    </>
  )
};

export { DiverginingBarChart }