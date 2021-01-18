// Code from Mike Bostock https://observablehq.com/@d3/histogram

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import dataLoad from "./data/unemployment-x.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p>Data source: <a href="" target="_blank">Name of data source </a> (link)</p>
      <p className="disclaimer">*  </p>
    </>
  )
}

const Histogram = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const width = 850;
  const height = 600;
  const margin = {top: 20, right: 20, bottom: 30, left: 40}


  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      const rate = d.map(element => element.rate)
      setData(rate)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      /// make bins ///
      const bins = d3.bin().thresholds(40)(data)

      /// Scales ///
      // X Scale 
      // since the bins might be slightly uneven - go from
      // the first lower bound bin to the last 
      const x = d3.scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([margin.left, width - margin.right])
      // Y Scale 
      const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)]).nice()
        .range([height - margin.bottom, margin.top])

      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        // add some text at the end of the axis 
        .call(g => g.append("text")
          .attr("x", width - margin.right)
          .attr("y", -4)
          .attr("fill", "orange")
          .attr("font-weigth", 'bold')
          .attr("text-anchor", 'end')
          .text("unemployment")
        );
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 4)
          .attr("text-anchor", "start")
          .attr("font-weigth", "bold")
          .text("county")
        );

      /// Graph ///
      // Graphing space 
      const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)

      // Bars 
      const histogram = svg.append("g")
          .attr("fill", "steelblue")
        .selectAll("rect")
        .data(bins)
        .join("rect")
          .attr("x", d => x(d.x0) + 1)
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length));

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)

    } 
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container-number">
      <h1>Day 26</h1>
      <h2>Histogram</h2>
      <h3>8th Dec 2020</h3>
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

      <div className="wrapper wrapper-number">
        <svg ref={svgRef} width={width} height={height}>
            <g ref={xAxisRef}></g>
            <g ref={yAxisRef}></g>        
          </svg>
      </div>

    </div>
  )
};

export { Histogram }