// Code modified from Mike Bostock : https://observablehq.com/@d3/area-chart
// Data from :https://www.kaggle.com/mbogernetto/brazilian-amazon-rainforest-degradation?select=def_area_2004_2019.csv

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./15AreaChart.css"
import dataLoad from "./data/amazon_deforestation.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p>Data source: <a href="https://www.kaggle.com/mbogernetto/brazilian-amazon-rainforest-degradation?select=def_area_2004_2019.csv" target="_blank"></a>Kaggle</p>
      <p className="disclaimer">* Original source of the data according to Kaggle source: http://www.inpe.br/</p>
    </>
  )
}

const MyAreaChart = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  /// states ///
  const [data, setData] = useState();
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constants ///
  // dimensions 
  const height = 500;
  const width = 850;
  const margin = {top: 20, bottom: 20, right: 2, left: 60}
  // colours 
  const colour = "#565264";
  // accessors 
  const yAcessor = "All"

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setData(d)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data){

      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right])
      // Y Scale 
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yAcessor])]).nice()
        .range([height - margin.bottom, margin.top])
    
      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("2")).tickSizeOuter(0))
      // Y Axis 
      const yAxis = g => g  
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("Deforested area in All Amazon (km²)")
        )

      /// Graph ///
      // Curve 
      const curve = d3.curveNatural // also try curveNatural 
      // Area 
      const area = d3.area()
          .curve(curve)
          .x(d => x(d.date))
          .y0(y(0))
          .y1(d => y(d[yAcessor]))
      // Graphing area 
      const svg = d3.select(svgRef.current)
          .attr("height", height)
          .attr("width", width)
      // Draw area 
      const areaChart = svg.append("path")
          .datum(data)
          .attr("fill", colour)
          .attr("fill-opacity", 0.8)
          .attr("stroke", colour)
          .attr("stroke-width", "2px")
          .attr("d", area)

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis);
      d3.select(yAxisRef.current).call(yAxis);

    }
  }, [data])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container15">
      <h1>Day 15: Simple area chart</h1> 
      <h2>Brazilian Amazon Rainforest Deforestation</h2>
      <h3>24th Nov 2020</h3>

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

      <div className="wrapper wrapper15">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>
      </div>
    </div>
  )
};

export {MyAreaChart}; 