// Chart adapted from Mike Bostock: https://observablehq.com/@d3/multi-line-chart
// Data from: https://www.imo-official.org/results_year.aspx


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./7MultiLineChart.css";
import dataLoad from "./data/imo_results_by_year.csv";
import jsonDataLoad from "./data/img_results_by_year.json";
import _ from "lodash";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <> 
      <p>Data source: <a href="https://www.imo-official.org/results_year.aspx" target="_blank">IMO Official Website</a> (https://www.imo-official.org/results_year.aspx)</p>
      <p className="disclaimer">* Proportion computed as male/all and female/all. Missing data is unknown.</p>    
    </>
  )
}

const MyTwoLineChart = () => {
  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// Dimensions ///
  const height = 500;
  const width = 850;
  const colour = "steelblue";
  const colours = {
    "female": "maroon",
    "male": "steelblue"
  }
  const margin = {top: 20, right: 20, bottom: 30, left: 50};

  /// Data read ///
  useEffect(() => {
    d3.csv(dataLoad).then(d => {
      d.forEach(element => {
        element.year = new Date(+element.Year, 0, 1) // from string to datetime object
        element.valueFemale = +element.femaleProportion;
        element.valueMale = +element.maleProportion;
      });
      //setData(d)
    });
  }, []);

  /// Data load ///
  useEffect(() => {
    const data = jsonDataLoad;
    const dates = data.dates.map(d3.utcParse("%Y"))
    const newData = {
      dates: dates,
      series: data.series
    }
    setData(newData)
  }, [])

  /// D3 code ///
  useEffect(() => {
    if (data){

      /// Scales ///
      // X Scale 
      const x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right*2])
      const y = d3.scaleLinear()
        .domain([0, 1]).nice()
        .range([height - margin.bottom, margin.top])

      /// Axes ///
      // X Axis
      const xAxis = g => g 
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(10).tickSizeOuter(0))
        .call(g => g.selectAll("text")
          .attr("fill", "white")
          .attr("font-size", "12")
        )
        .call(g => g.selectAll(".tick")
          .attr("color", "white")
        )
        .call(g => g.select(".domain")
          .attr("color", "white")
        )

      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text")
          .attr("fill", "white")
          .attr("font-size", "12")
        )

      /// Graph ///
      // Line 
      const line = d3.line()
        .defined(d => !isNaN(d))
        .x((d, i) => x(data.dates[i]))
        .y(d => y(d))
        .curve(d3.curveNatural);

      // Graph area
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
      const g = svg.append("g")

      // Path 
      const path = g.selectAll(".path")
        .data(data.series)
        .join("path")
        .attr("class", "path")
          .attr("fill", "none")
          .attr("stroke", d => colours[d.name])
          .attr("stroke-width", 2)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .style("mix-blend-mode", "screen")
          .attr("d", d => line(d.values))

      svg.selectAll("text")
        .data(data.series)
        .join("text")
        //.attr("transform", `translate(${width/2}, ${height/2})`)
        .attr("font-family", "sans-serif")
        .attr("font-size", 13)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("x", (d, i) => width - margin.right)
        .attr("y", (d, i) => y(d.values[0])) 
        .text(d => d.name)

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)


    } 
  }, [data])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container7">
      <h1>Day 7: Multiple line chart - v1</h1>   
      <h2>Proportion of female and male participants at the International Maths Olympiad</h2>
      <h3>15th Nov 2020</h3>

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
      
      <div className="wrapper wrapper7">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>
      </div>
    </div>
  )
};

export {MyTwoLineChart}