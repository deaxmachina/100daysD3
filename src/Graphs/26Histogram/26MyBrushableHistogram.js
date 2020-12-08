// Code based on Mike Bostock https://observablehq.com/@d3/histogram

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./26Histogram.css";
import dataLoad from "./data/whc-sites-2019.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p>Data source: <a href="https://www.kaggle.com/ujwalkandi/unesco-world-heritage-sites" target="_blank">Kaggle / UNESCO </a> (https://www.kaggle.com/ujwalkandi/unesco-world-heritage-sites)</p>
      <p className="disclaimer">*Refer to data source for more information about the data.</p>
    </>
  )
}

const MyBrushableHistogram = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const brushRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);
  const [brushExtent, setBrushExtent] = useState(); // for the brush

  /// constatns ///
  // dimensions 
  const width = 850;
  const height = 600;
  const margin = {top: 20, right: 20, bottom: 30, left: 40}
  // colours 
  const barsColour = '#fb8500'


  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      d.forEach(element => {
        element.date = new Date(+element.date_inscribed, 0, 1) // from string to datetime object
      })
      setData(d)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data){
      console.log(data)

      /// Scales ///
      // X Scale 
      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right])
        .nice();

      /// bins ///
      const [start, stop] = xScale.domain() 
      const binnedData = d3.bin()
        .value(d => d.date) // the value that we want to bin 
        .domain(xScale.domain())
        .thresholds(d3.timeYears(start, stop))(data)
        .map(array => ({
          y: array.length,
          x0: array.x0,
          x1: array.x1
        }));

      // Y Scale 
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(binnedData, d => d.y)])
        .range([height - margin.bottom, 0]);
  
    
      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0))

      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(yScale).ticks(10))
        .call(g => g.select(".domain").remove())

      /// Graph ///
      // Graphing space 
      const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)

      // Bars 
      const histogram = svg.append("g")
        .selectAll("rect")
        .data(binnedData)
        .join("rect")
          .attr("fill", barsColour)
          .attr("x", d => xScale(d.x0) + 1)
          .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
          .attr("y", d => yScale(d.y))
          .attr("height", d => yScale(0) - yScale(d.y));  
  
      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)


      /// Brush ///
      // event.selection gives [start pixel of brush, end pixel of brush]
      // you can invert these pixel value to find the original values of the 
      // date that they correspond to, in this case the start and end dates 
      // 'brush end' means that we are listening for the two events brush and end 
      const brush = d3.brushX()
        .extent([
          [0, 0], 
          [width, height - margin.bottom]
        ]);
      brush(d3.select(brushRef.current));
      brush.on('brush end', (event) => {
        setBrushExtent(event.selection && event.selection.map(xScale.invert));
      });

    } else {
      console.log("Missing data")
    }
  }, [data, width, height])


  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container26">
      <h1>Day 26</h1>
      <h2>UNESCO World Heritage Sites Histogram</h2>
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

      <div className="wrapper wrapper26">
        <svg ref={svgRef} width={width} height={height}>
            <g ref={xAxisRef}></g>
            <g ref={yAxisRef}></g>   
            <g ref={brushRef} />     
          </svg>
      </div>

    </div>
  )
};

export { MyBrushableHistogram }