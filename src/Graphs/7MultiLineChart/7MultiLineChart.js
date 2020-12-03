// Chart adapted from Mike Bostock: https://observablehq.com/@d3/multi-line-chart


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import dataLoad from "./data/unemployment.tsv"

const MultiLineChart = () => {
  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  /// states ///
  const [data, setData] = useState(null);

  /// Dimensions ///
  const height = 600;
  const width = 750;
  const colour = "steelblue";
  const margin = {top: 20, right: 20, bottom: 30, left: 30};

  /// Data load ///
  useEffect(() => {
    d3.tsv(dataLoad).then(data => {
      const columns = data.columns.slice(1);
      console.log(columns)
      const newData = {
        y: "% Unemployment",
        series: data.map(d => ({
          name: d.name.replace(/, ([\w-]+).*/, " $1"),
          values: columns.map(k => +d[k])
        })),
        dates: columns.map(d3.utcParse("%Y-%m"))
      };
      setData(newData)
    })
  }, [])

  /// D3 code ///
  useEffect(() => {
    if (data){
      console.log(data)
      /// Scales ///
      // X Scale 
      const x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right])
      // Y Scale 
      const y = d3.scaleLinear()
        .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
        .range([height - margin.bottom, margin.top])

      /// Axes ///
      // X Axis 
      const xAxis = g => g 
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(data.y)
        );

      /// Graph ///
      // Line 
      const line = d3.line()
        .defined(d => !isNaN(d))
        .x((d, i) => x(data.dates[i]))
        .y(d => y(d))
        .curve(d3.curveNatural);

      // Chart area 
      const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)

      const g = svg.append("g")

      // Draw the line graph
      const path = g
        .selectAll("path")
        .data(data.series)
        .join("path")
          .attr("fill", "none")
          .attr("stroke", colour)
          .attr("stroke-width", 1.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .style("mix-blend-mode", "multiply")
          .attr("d", d => line(d.values))

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)

      /// Interactions ///

      // Create a dot with text on top of it 
      // which is initally not visiable but wil be made so 
      // when a path is hovered and then the dot and text 
      // will show the element corresponding to that path
      const dot = svg.append("g")
        .attr("display", "none");

      dot.append("circle")
          .attr("r", 2.5);

      dot.append("text")
          .attr("font-family", "sans-serif")
          .attr("font-size", 12)
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .attr("fill", "black")
          .attr("y", -15) // how far above dot to put the text

      // Function to govern what happens when we move i.e. hover anywhere 
      // We want to: 
      // 1. Only colour the selected line 
      // 2. Display text and point corresponding to the data element
      function moved(event) {
        //console.log(this)
        // coordinates in pixels of where you hovered
        const pointer = d3.pointer(event, this); 
        //get the original x value of the data point
        const x_original = x.invert(pointer[0]); 
        // get the original y value of the data point 
        const y_original = y.invert(pointer[1]); 
        // this will find date that corresponds to the actual existing data in the array of dates for each datapoint
        const hovered_date = d3.bisectCenter(data.dates, x_original); 
        // finally find the datapoint what corresponds to the paths which was hovered 
        const hovered_path = d3.least(data.series, d => Math.abs(d.values[hovered_date] - y_original));
        // if d is the hovered path, colour it marron 
        // colour all other paths grey
        path
        .attr("stroke", d => d === hovered_path ? "maroon" : "#ddd")
        .attr("stroke-width", d => d === hovered_path ? 2 : 1)
        .filter(d => d === hovered_path).raise() // not sure what this does

        // move the dot 
        dot.attr("transform", 
          `translate(${x(data.dates[hovered_date])},${y(hovered_path.values[hovered_date])})`
        );
        dot.select("text").text(hovered_path.name);
        dot.attr("display", null);
      }

      // when the mouse leaves the svg, all the lines on the path 
      // are set to their original colour and the dot is gone 
      function left(event) {
        path.attr("stroke", colour);
        dot.attr("display", "none");
      }

      // attach the events to the svg; note that you can also attach them 
      // to g or even to path but it ends up being really messy with the mouse move 
      // so this just looks better; but functionally all of these are valid to 
      // attach the mouse events on 
      svg
        .on("mousemove", moved)
        .on("mouseleave", left);

    } else {
      console.log("Missing data")
    }
  }, [data])




  return (
    <>
     <h1>Multi Line chart</h1>
     <div className="wrapper">
      <svg ref={svgRef}>
        <g ref={xAxisRef}></g>
        <g ref={yAxisRef}></g>
      </svg>
     </div>
    </>
  )
};

export { MultiLineChart }