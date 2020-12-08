// Code modified from Mike Bostock: https://observablehq.com/@mbostock/global-temperature-trends
// Data from: https://www.kaggle.com/unsdsn/world-happiness?select=2019.csv

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import dataLoad from "./data/2019.csv";
import "./17ScatterPlot.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p>Data source: <a href="https://www.kaggle.com/unsdsn/world-happiness?select=2019.csv" target="_blank">Kaggle / The World Happiness Report </a> (https://www.kaggle.com/unsdsn/world-happiness?select=2019.csv)</p>
      <p className="disclaimer">*refer to data source for an explanation of the numbers and methodology </p>
    </>
  )
}

const MyScatterPlot = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();
  const yAxisText = useRef();
  const xAxisText = useRef();

  /// states ///
  const accessors = [
    "GDP per capita",
    "Social support",
    "Healthy life expectancy",
    "Freedom to make life choices",
    "Generosity",
    "Perceptions of corruption"
  ]
  const [data, setData] = useState(null);
  const [accessor, setAccessor] = useState("GDP per capita")
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constants ///
  // dimensions 
  const height = 550;
  const width = 840;
  const margin = {top: 50, right: 10, bottom: 50, left: 40}
  // colours 
  const textColour = "#f4f3ee"

  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      d.forEach(element => {
        element.name = + element.score
      });
      setData(d)
    });
  }, [])

  /// D3 Code ///
  
  useEffect(() => {
    if (data){
      console.log(data)
      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.name))
        .range([margin.left, width - margin.right])
      // Y Scale 
      const y = d3.scaleLinear() 
        .domain([d3.min(data, d => d[accessor] - 0.05), 
                d3.max(data, d => d[accessor] + 0.05)])//.nice()
        .range([height - margin.bottom, margin.top])
      // Colour Scale 
      const colorScale = chroma.scale(["#3a0ca3", "#f72585"]
        .map(color => chroma(color).saturate(10)))
        .domain(d3.extent(data, d => d.name))

      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(20))
        .call(g => g.select(".domain").remove())
        .call(g => d3.select(xAxisText.current)
          .selectAll("text")
          .data([0])
          .join("text")
          .attr("fill", "#000")
          .attr("x", width/2)
          .attr("y", 40)
          .attr("dy", "0.32em")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("Happiness score")
        )
        .call(g => g.selectAll("text")
          .attr("fill", textColour)
          .attr("font-size", "1.2em")
        )
        .call(g => g.selectAll(".tick")
            .attr("color", textColour)
        )
        .call(g => g.select(".domain")
            .attr("color", textColour)
        )

      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y).ticks(15))
        .call(g => g.select(".domain").remove())
        // make sure to append a g inside the yAxis group and then use the data join 
        // to properly update the text when the data is updated 
        .call(g => d3.select(yAxisText.current)
          .selectAll("text")
          .data([accessor])
          .join("text")
          .attr("fill", "#000")
          .attr("x", 5)
          .attr("y", margin.top)
          .attr("dy", "0.32em")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(d => d)
          )
        .call(g => g.selectAll("text")
          .attr("fill", textColour)
          .attr("font-size", "1.2em")
          )
        .call(g => g.selectAll(".tick")
            .attr("color", textColour)
          )
        .call(g => g.select(".domain")
            .attr("color", textColour)
          )

      /// Graph ///
      // Graphing area
      const svg = d3.select(gRef.current)

      // circles 
      const scatterPlot = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.name))
        .attr("cy", d => y(d[accessor]))
        //.attr("fill", "maroon")
        .attr("fill", d => colorScale(d.name))
        .attr("fill-opacity", 0.7)
        .attr("stroke", d => colorScale(d.name))
        .attr("stroke-width", 3)
        .attr("r", 0)
        .transition().duration(500)
        .attr("r", 7)

      
      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis);
      d3.select(yAxisRef.current).call(yAxis);


    } else {
      console.log("Missing data")
    }
  }, [data, accessor])

  const changeIndicator = (e) => {
    const selectedIndicator = e.target.value
    console.log(selectedIndicator)
    setAccessor(selectedIndicator)
  }

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }
  

  return (
    <div className="page-container page-container17">
      <h1>Day 17: Scatter Plot</h1>  
      <h2>Correlation between overall happiness score and various indicators, 2019</h2>
      <h3>26th Nov 2020</h3>

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

      <div className="wrapper wrapper17">
        <svg ref={svgRef} height={height} width={width}>
          <g ref={gRef}></g>
          <g ref={xAxisRef}>
            <g ref={xAxisText}></g>
          </g>
          <g ref={yAxisRef}>
            <g ref={yAxisText}></g>
          </g>
        </svg>

        <div className="dropdown-menu17">
          <select className="select17"
            id="option-select" 
            onChange={e => changeIndicator(e)}
          >
              <option value="">indicator</option>
              {
               accessors
                ?accessors.map(indicator => (
                  <option value={indicator}>{indicator}</option>
                ))
                : null
              }
          </select>
        </div>

      </div>
    </div>
  )
};

export { MyScatterPlot }
