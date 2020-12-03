// Code from https://observablehq.com/@d3/bar-chart

import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import dataLoad from "./alphabet.csv";

const BarChartHorizontal = () => {

  const svgRef = useRef();

  const [data, setData] = useState("");

  // CONSTANTS //
  const color = "steelblue";
  const height = 500;
  const width = 500;
  const margin = {
    top: 30,
    right: 0,
    bottom: 30,
    left: 40
  }

  // LOAD DATA //
  useEffect(() => {
    d3.csv(dataLoad).then((d) => {
      // transform each element of current data 
      // to new format 
      d.forEach(function (element) {
        element.name = element.letter;
        element.value = + element.frequency;
      });
      // sort values of descending letter freq
      d.sort((a, b) => d3.descending(a.value, b.value))
      setData(d)
    })
  }, [])

  // D3 CODE //
  useEffect(() => {
    // console log the data when it's loaded 
    data && console.log(data)

    // SCALES //

    // X Scale 
    // Band scale for the bars on the x-axis 
    const x = d3.scaleBand()
      .domain(d3.range(data.length)) // [0, 1, ..., 25] create array with one element for each element in our data 
      .range([margin.left, width - margin.right]) // total amount of space we have for all the 26 bands
      .padding(0.1)

    // Y Scale 
    // Linear scale mapping the value of the data to vertical pixels 
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice() // [0, 0.12702] where the latter is max value in the data array
      .range([height - margin.bottom, margin.top]) // bottom to top vectical pixel space that we have available for the height of the bars


    // GRAPH //

    // Svg container for the whole graph 
    const svg = d3.select(svgRef.current)
      .attr("height", height)
      .attr("width", width)

    // bar chart in a group element
    svg.append("g")
      .attr("fill", color)
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d, i) => x(i)) // x coord of the start of each band
      .attr("y", d => y(d.value)) // y postion of the start of each band
      .attr("height", d => y(0) - y(d.value)) // substract top from value to get bar starting from x-axis
      .attr("width", x.bandwidth()) // width of each band is the same; it is the bandwidth 


    // AXES //

    // X Axis

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(i => data[i].name).tickSizeOuter(0))

    svg.append("g")
      .call(xAxis)

    // g => g is the same as svg.append("g") and then calling 

    // Y Axis 
    const yAxis = g => g
      .attr("transform", `translate(${margin.left}, 0)`) //move to the left by margin.left 
      .call(d3.axisLeft(y).ticks(null, data.format))
      .call(g => g.select(".domain").remove()) //what? 
      .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .text(data.y)
      )

    svg.append("g")
      .call(yAxis)


    // axis can also be called like this, without both the code above 
    // and the code further up defining  the axis; 
    // comment both of them and uncomment this one to  see 
    /*
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`) // lift it up from the bottom by margin.bottom
      .call(d3.axisBottom(x).tickFormat(i => data[i].name).tickSizeOuter(0))
    */

  }, [data])

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  )
};

export default BarChartHorizontal;