// Code from Mike Bostock : https://observablehq.com/@d3/radial-area-chart
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./19RadialAreaChart.css";
import dataLoad from "./data/sfo-temperature.csv";

const RadialAreaChart = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();

  /// states ///
  const [data, setData] = useState(null);

  /// constatns ///
  // dimensions 
  const width = 800;
  const height = width;
  const margin = 10;
  // inner and outer radius 
  const innerRadius = width/5;
  const outerRadius = width/2 - margin;

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(rawdata => {
      //console.log(rawdata)
      const data = Array.from(d3.rollup(
        rawdata, 
        v => ({
          date: new Date(Date.UTC(2000, v[0].DATE.getUTCMonth(), v[0].DATE.getUTCDate())),
          avg: d3.mean(v, d => d.TAVG || NaN),
          min: d3.mean(v, d => d.TMIN || NaN),
          max: d3.mean(v, d => d.TMAX || NaN),
          minmin: d3.min(v, d => d.TMIN || NaN),
          maxmax: d3.max(v, d => d.TMAX || NaN)
        }), 
        d => `${d.DATE.getUTCMonth()}-${d.DATE.getUTCDate()}`
      ).values())
        .sort((a, b) => d3.ascending(a.date, b.date))
        setData(data);
    });
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data){
      console.log(data)
      /// Scales ///
      // X Scale - for the time; i.e. the circles scale 
      const x = d3.scaleUtc()
        .domain([Date.UTC(2000, 0, 1), Date.UTC(2001, 0, 1) - 1])  // Jan 1 2000 to Jan 1 2001
        .range([0, 2*Math.PI]) // around the circle 
      // Y Scale - the radial lines around the circles; 
      // lowest value closest to the centre of the circle is the lowest temp 
      // highest value furthest away from the centre of the circle is the highest temp 
      const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.minmin), d3.max(data, d => d.maxmax)]) // min of the mins and max of the maxes
        .range([innerRadius, outerRadius])

      /// Axes ///
      // A Axis 
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
      const xAxis = g => g
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .call(g => g.selectAll("g")
        .data(x.ticks())
        .join("g")
          .each((d, i) => d.id = months[i])
          .call(g => g.append("path")
              .attr("id", d => d.id) 
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.2)
              .attr("d", d => `
                M${d3.pointRadial(x(d), innerRadius)}
                L${d3.pointRadial(x(d), outerRadius)}
              `))
          .call(g => g.append("text")
              .append("textPath")
              .attr("startOffset", 0)
              .attr("xlink:href", d =>`#${d.id}`)
              .text(d => d.id))
              )

      // Y Axis 
      const yAxis = g => g
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .call(g => g.selectAll("g")
        .data(y.ticks().reverse())
        .join("g")
          .attr("fill", "none")
          .call(g => g.append("circle")
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.2)
              .attr("r", y))
          .call(g => g.append("text")
              .attr("y", d => -y(d))
              .attr("dy", "0.35em")
              .attr("stroke", "#fff")
              .attr("stroke-width", 5)
              .text((x, i) => `${x.toFixed(0)}${i ? "" : "°F"}`)
            .clone(true)
              .attr("y", d => y(d))
            .selectAll(function() { return [this, this.previousSibling]; })
            .clone(true)
              .attr("fill", "currentColor")
              .attr("stroke", "none")))

      /// Graph ///
      // Graphing area 
      const svg = d3.select(gRef.current)
          .attr("transform", `translate(${width/2}, ${height/2})`)
      
      // Line - for the average line 
      const line = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .angle(d => x(d.date))
      // Area - for the area charts 
      const area = d3.areaRadial()
        .curve(d3.curveLinearClosed)
        .angle(d => x(d.date))

      // Area Chart 1 - the minmin and maxmax temperatures 
      const areaChart1 = svg.append("path")
        .attr("fill", "lightsteelblue")
        .attr("fill-opacity", 0.2)
        .attr("d", area
          .innerRadius(d => y(d.minmin))
          .outerRadius(d => y(d.maxmax))
          (data));
        
      // Area Chart 2 - the min and max temperatures 
      const areaChart2 = svg.append("path")
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.2)
        .attr("d", area
          .innerRadius(d => y(d.min))
          .outerRadius(d => y(d.max))
          (data));
      
      // Line chart - single line for the average temp 
      const lineChart = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line
          .radius(d => y(d.avg))
          (data)); 

          

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)


    } else {
      console.log("Missing data")
    }
  }, [data])



  return (
    <>
      <h1>Day 19: Radial Area Chart</h1>
      <div className="wrapper">
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}>
            <g ref={xAxisRef}></g>
            <g ref={yAxisRef}></g>
          </g>
        </svg>
      </div>
    </>
  )
};

export { RadialAreaChart }