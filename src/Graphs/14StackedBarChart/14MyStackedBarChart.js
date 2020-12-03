// Code modified from Mike Bostock: https://observablehq.com/@d3/stacked-bar-chart
// Data from:  https://www.e-stat.go.jp/en/stat-search/files?page=1&layout=datalist&toukei=00200521&tstat=000001080615&cycle=0&year=20150&month=0&tclass1=000001124175

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./14StackedBarChart.css";
import dataLoad from "./data/employment-japan.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <> 
      <p>Data source: <a href="https://www.stat.go.jp/english/data/kokusei/index.html" target="_blank">Statistics Bureau of Japan</a> (https://www.stat.go.jp/english/data/kokusei/index.html)</p>
      <p className="disclaimer"></p>
    </>
  )
}

const MyStackedBarChart = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const legendRef = useRef();

  /// states ///
  const [data, setData] = useState();
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const height = 500;
  const width = 850;
  const margin = {top: 10, right: 10, bottom: 65, left: 40}
  // formatting 
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      // columns with the types of employment 
      const categories = d.columns.slice(1)
      console.log(categories)
      // add a total across all the categories
      d.forEach(element => (
        element.total = d3.sum(categories, category => element[category])
      ));
      // order by the total 
      const dSorted = d.sort((a, b) => b.total - a.total)
      setData(dSorted);
    });
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {
      console.log(data)
      /// Data transform ///
      const stack = d3.stack()
        .keys(data.columns.slice(1)) // the categories i.e. employment types 
      const series = stack(data).map(d => (d.forEach(v => v.key = d.key), d))
      console.log(series)

      /// Scales ///
      // X Scale 
      const x = d3.scaleBand()
        .domain(data.map(d => d.region)) // 1 region = one band 
        .range([margin.left, width - margin.right])
        .padding(0.1)
      // Y Scale 
      const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]) // max of the maxes of the top coords of the stacks 
        .rangeRound([height - margin.bottom, margin.top])
      // Colour Scale 
      // one colour for each group 
      const colours = ["#ff7171","#ffaa71", "#6e6d6d"]
      const color = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(colours)
        .unknown("#ccc")

      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove())
        .call(g => g.selectAll("text")
          .style("fill", "black")
          .attr("font-size", "1.1em")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-40)")
        )
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
      
      // Groups for the bars 
      // make one group for each level of the stacked bar chart 
      const stackLevels = svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")

      // Bars within each level 
      const bars = stackLevels
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("fill", d => color(d.key)) 
          .attr("x", (d, i) => x(d.data.region)) // d.data comes from the stacks transformation
          .attr("y", d => y(d[1])) // y position from the top of each stack 
          .attr("height", d => y(d[0]) - y(d[1])) // top to bottom 
          .attr("width", x.bandwidth())

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)

      /// Legend ///
      const legendG  = d3.select(legendRef.current)
      const legend = legendG.append("g")
        .selectAll("rect")
        .data(series.map(d => d.key))
        .join("rect")
        .attr("x", (d, i) => width - 100)
        .attr("y", (d, i) => 10 + i*20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => color(d))
      const legendText = legendG.append("g")
        .selectAll("text")
        .data(series.map(d => d.key), d => d)
        .join("text")
        .text(d => d == "selfemployed"? "self-employed" : d == "familyworkers"? "family workers" : "employees")
        .attr("x", width - 110)
        .attr("y", (d, i) => 16 + i*20)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)

    } else {
      console.log("Missing data")
    }
  }, [data])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container14">
      <h1>Day 14: Stacked bar chart</h1>
      <h2>Number of people by employment type by prefecture in Japan</h2>
      <h3>23rd Nov 2020</h3>

      <button 
        className="graph-explain-icon" 
        onClick={toggleGraphExplanation}
      >
        <FontAwesomeIcon icon={faBookOpen} size="md"/>
        <span className="info-span">info</span>
      </button>  
      {
        revealGraphExplanation 
        ? <GraphExplain />
        : null
      } 

      <div className="wrapper wrapper14">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
          <g ref={legendRef}></g>
        </svg>
      </div>
    </div>
  )
};

export { MyStackedBarChart }