// Code from https://observablehq.com/@d3/horizontal-bar-chart
// Horizontal bars 
// Text at the end of bars 


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import dataLoad from "./alphabet.csv"

const BarChartVertical = () => {

  const svgRef = useRef();

  const [data, setData] = useState("");

  // DATA // 
  useEffect(() => {
    d3.csv(dataLoad).then(d => {
      d.forEach(element => {
        element.name = element.letter;
        element.value = +element.frequency
      });
      d.sort((a, b) => d3.descending(a.value, b.value));
      setData(d)
    })
  }, []);

  useEffect(() => {

    // DIMENSIONS //
    const barHeight = 25;
    const margin = {
      top: 30,
      right: 0,
      bottom: 10,
      left: 30
    };
    const height = Math.ceil((data.length + 0.1) * barHeight)
      + margin.top
      + margin.bottom
    const width = height;


    if (data) {
      // SCALES //

      // X Scale 
      // length of the bars 
      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([margin.left, width - margin.right])

      // Y Scale
      // bands and their position on the y-axis 
      const y = d3.scaleBand()
        .domain(d3.range(data.length))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1)

      // Color Scale 
      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range([
          "#622a79",
          "#622a79",
          "#622a79",
          "#6d3a84",
          "#6d3a84",
          "#6d3a84",
          "#79498e",
          "#79498e",
          "#845999",
          "#845999",
          "#9068a3",
          "#9068a3",
          "#9b78ae",
          "#9b78ae",
          "#a787b8",
          "#a787b8",
          "#b297c3",
          "#b297c3",
          "#bea6cd",
          "#bea6cd",
          "#c9b6d8",
          "#c9b6d8",
          "#c9b6d8",
          "#c9b6d8",
          "#c9b6d8",
          "#c9b6d8",
        ])

      // GRAPH //
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)

      // You can remove one of the sets, it is just to show how to 
      // overlay two sets of bars on top of each other 
      // bars 
      svg.append("g")
        //.attr("fill", "steelblue")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("fill", d => color(d.name))
        .attr("opacity", 0.5)
        .attr("x", x(0))
        .attr("y", (d, i) => y(i))
        .attr("width", d => x(d.value) - x(0))
        .attr("height", y.bandwidth());

      // bars 
      svg.append("g")
        //.attr("fill", "steelblue")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("fill", d => color(d.name))
        .attr("x", x(0))
        .attr("y", (d, i) => y(i))
        .attr("width", d => x(d.value) - x(0) -100)
        .attr("height", y.bandwidth());

      // text on the bars
      const format = x.tickFormat(20, data.format)
      svg.append("g")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("x", d => x(d.value))
        .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("dx", -4)
        .text(d => format(d.value))
        .call(text => text.filter(d => x(d.value) - x(0) < 20) // short bars
          .attr("dx", +4)
          .attr("fill", "black")
          .attr("text-anchor", "start"));

      // AXES // 
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(0, ${margin.top})`) //move down by margin top 
        .call(d3.axisTop(x).ticks(width / 80, data.format))
        .call(g => g.select(".domain").remove()) // remove the line of the axis and keep just the ticks

      svg.append("g")
        .call(xAxis);

      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, 0)`) //move left by magin left
        .call(d3.axisLeft(y).tickFormat(i => data[i].name).tickSizeOuter(0))

      svg.append("g")
        .call(yAxis);
    }




  }, [data])


  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  )
};

export default BarChartVertical