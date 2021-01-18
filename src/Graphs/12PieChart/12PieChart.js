// Chart from Mike Bostock: https://observablehq.com/@d3/pie-chart

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./12PieChart.css";
import dataLoad from "./data/population-by-age.csv";

const PieChart = () => {

  /// refs ///
  const svgRef = useRef();

  /// states ///
  const [data, setData] = useState(null);

  /// dimensions ///
  const height = 600;
  const width = 600;
  //const margin = {top: 50, bottom: 20, left: 100, right: 20}

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setData(d.map(element => _.pick(element, ["name", "value"])))
    })
  }, [])

  /// D3 Code ///
  useEffect(() => {
    if (data){

      /// Scales ///
      // Colour Scale - one colour for each category 
      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse())

      /// Graph ///
      // Graph area 
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
          .append("g")
            .attr("transform", `translate(${width/2}, ${height/2})`)
        //.attr("viewBox", [-width / 2, -height / 2, width, height]); - alternative 

      // 1. Pie 
      // this is what you use on the data 
      const pie = d3.pie()
        .sort(null)
        .value(d => d.value)
      const arcs = pie(data)
      // 2. Arc
      // this is what you use when drawing the graph
      // it becomes the d attribute of paths
      const arc = d3.arc()
        .innerRadius(100)
        .outerRadius(Math.min(width, height) / 2 - 1)
        .padAngle(0.04)
        .cornerRadius(20)

      // 3. Arch Label 
      // find position which corresponds to where we want to place the labels 
      // using the arc we already defined. Here the inner and outer radius 
      // coinside and that's how we find a single position; the 0.8 number 
      // ends up correpsonding to the disance from the center (between 0 and 1)
      // of the pie chart, so 0.8 is close to the edge while 1 is on the edge and 0 at center 
      const radius = Math.min(width, height)/2 * 0.8;
      const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius)

      // 4. Pie Chart 
      // pass the data through pie and use arc as d-attribute 
      const graph = svg.append("g")     
        .selectAll("path")
        .data(arcs)
        .join("path")
          .attr("stroke", "white")
          .attr("fill", d => color(d.data.name))
          .attr("d", arc)
        .append("title")
          .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

      // text to add on the arcs 
      const graphText = svg.append("g")
        .selectAll("text")
        .data(arcs)
        .join("text")
          .attr("font-family", "sans-serif")
          .attr("font-size", 12)
          .attr("text-anchor", "middle")
          .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
          // append the name of the category as well 
          .call(text => text.append("tspan")
            .attr("y", "-1em")
            .attr("x", "-0.4em")
            .attr("font-weight", "bold")
            .attr("color", "black")
            .text(d => d.data.name)
            )
          // append text only on the arch which are large enough 
          // otherwise text becomes cluttered 
          .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value.toLocaleString()));

    } 
  }, [data])


  return (
    <>
      <h1>Pie Chart</h1>
      <div className="wrapper">
        <svg ref={svgRef}></svg>
      </div>
    </>
  )
};

export { PieChart }