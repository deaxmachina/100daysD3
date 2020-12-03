// Chart from Mike Bostock: https://observablehq.com/@d3/horizontal-bar-chart
// Data: https://data.london.gov.uk/dataset/use-of-force

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import dataLoad from "./data/alphabet.csv" // you need to import the data this way in react
import "./2BarChartHorizontal.css";

const BarChartHorizontal = () => {
  // ref for d3 
  const svgRef = useRef();

  // states //
  const [data, setData] = useState();

  /// Dimensions ///
  const margin = {top: 30, right: 0, bottom: 0, left: 30}
  const height = 700;
  const width = 500; 
  const barHeight = 25;
  const colour = "#6b705c"


  /// Data Load ///
  useEffect(() => {
    d3.csv(dataLoad).then(d => {
      d.forEach(element => {
        element.name = element.letter;
        element.value = +element.frequency
      });
      d.sort((a, b) => d3.descending(a.value, b.value))
      setData(d)
    });
  }, [])

  // d3 code //
  useEffect(() => {
    if (data) {

      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([margin.left, width - margin.right])

      // Y Scale 
      const y = d3.scaleBand()
        .domain(d3.range(data.length))
        .range([margin.top, height - margin.bottom])
        .padding(0.1)

      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${margin.top})`)
        .call(d3.axisTop(x).ticks(width/80, data.format))
        .call(g => g.select(".domain").remove())
        
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y).tickFormat(i => data[i].name).tickSizeInner(7))
        .call(g => g.select(".domain").remove())

      /// Graph ///
      const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)

      const graph = svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
          .attr("fill", colour)
          .attr("x", x(0))
          .attr("y", (d, i) => y(i))
          .attr("width", d => x(d.value) - x(0))
          .attr("height", y.bandwidth())

      const format = x.tickFormat(20, data.format)
      const barText = svg.append("g")
        .selectAll("text")
        .data(data)
        .join("text")
          .attr("fill", "white")
          .attr("text-anchor", "end")
          .attr("font-family", "sans-serif")
          .attr("font-size", 12)
          .attr("x", d => x(d.value))
          .attr("y", (d, i) => y(i) + y.bandwidth()/2) //middle of bar
          .attr("dy", "0.35em")
          .attr("dx", -4) // move inwards from the end of the bar 
          .text(d => format(d.value))
        .call(text => text.filter(d => x(d.value) - x(0) <40) // filter on short bars <20 px
          .attr("dx", +4)
          .attr("fill", "black")
          .attr("text-anchor", "start")
        );

      // Call the axes 
      svg.append("g")
        .call(xAxis);
      svg.append("g")
        .call(yAxis);
    } else {
      console.log("No data")
    }
  }, [data])


  return (
    <>
      <h1>Day 2: Simple horizontal bar chart</h1>
      <h2>Frequency of English alphabet letters</h2>
      <div className="wrapper">
        <svg ref={svgRef}></svg>
      </div>
    </>
  )
};

export {BarChartHorizontal };