// Code based on 
// Data from

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./33MyInteractions.css";
import dataLoad from "./data/zero-hours-contracts.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p>Data source: <a href="https://data.london.gov.uk/dataset/workers-on-zero-hours-contracts" target="_blank">London Gov Data </a></p>
      <p className="disclaimer">* refer  to data source for details on the data.</p>
    </>
  )
}

const MyInteractions = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();
  const tooltipRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const width = 800;
  let dimensions = {
    width: width,
    height: 520,
    margin: {
      top: 70,
      right: 10,
      bottom: 50,
      left: 20
    }
  };
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  const colour = "#01497c"
  const colourHovered = "#bc4749"
  const colourText = "#292f36"



  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad).then(d => {
      d.forEach(element => {
        element.name = +element['Year'];
        element.value = +element['In employment on a zero hour contract (shown in thousands) - London']
      });
      d.sort((a, b) => d3.ascending(a.name, b.name))
      setData(d)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {
      console.log(data)
      /// SCALES ///
      const x = d3.scaleBand()
        .domain(d3.range(data.length)) // array of elements one for each bar
        .range([0, dimensions.boundedWidth])
        .padding(0.05)
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)]).nice()
        .range([dimensions.boundedHeight, 0]) // from top to bottom

      /// AXES ///
      // X Axis 
      const xAxis = g => g 
        .attr("transform", `translate(0, ${dimensions.boundedHeight})`)
        .call(d3.axisBottom(x).tickFormat(i => data[i].name).tickSizeOuter(0))
        .call(g => g.select(".domain").attr("color", "black"))
        .call(g => g.selectAll("text")
          .attr("fill", "black")
          .attr("font-size", '12px')
        )
        .call(g => g.selectAll(".tick").attr("color", colourText))
      // Y Axis 
      const yAxis = g => g  
        .call(d3.axisLeft(y).ticks(6))
        .call(g => g.select(".domain").remove()) // remove the line of the axis and just leave the ticks
        .call(g => g.append("text")
          .attr("x", 10)
          .attr("y", 0)
          .attr("dy", "0.35em")
          .attr("fill", "black")
          .attr("text-anchor", "start")
          .text("number of people (thousands)")
        )
        .call(g => g.selectAll("text")
          .attr("fill", "black")
        )
        .call(g => g.selectAll(".tick")
          .attr("color", "black")
      )

      /// GRAPH ///
      const svg = d3.select(svgRef.current)
        .attr("height", dimensions.height)
        .attr("width", dimensions.width)
      const bounds = d3.select(gRef.current)
        .attr("transform", `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)

      const graph = bounds
        .selectAll("rect")
        .data(data)
        .join("rect")
          .attr("class", "bar-chart-rects")
          .attr("y", d => y(d.value))
          .attr("x", (d, i) => x(i))
          .attr("height", d => y(0) - y(d.value))
          .attr("width", x.bandwidth)
          .attr("fill", colour)

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis);
      d3.select(yAxisRef.current).call(yAxis);

      /// Interactions ///
      // define a reference to the tooltip
      const tooltip = d3.select(tooltipRef.current)
      graph
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)

      function onMouseEnter(e, datum) {
        tooltip.style("opacity", 1)
        // add text to the first div in the tooltip
        tooltip.select("#tooltip-info-1")
        .text([
          "all:",
          d3.format(",.2r")(+datum['In employment on a zero hour contract (shown in thousands) - London']*1000),
          `(${+datum["Percentage in employment who are on a zero hour contract - London"]}%)`
        ].join(" "))
        // add text to the second div in the tooltip 
        tooltip.select("#tooltip-info-2")
        .text([
          "18-24 year olds:",
          d3.format(",.2r")(+datum['In employment on a zero hour contract (thousands) - London 18 to 24']*1000),
          `(${+datum["Percentage in employment who are on a zero hour contract - London 18 to 24"]}%)`
        ].join(" "))
        // position the toolbar 
        const xPosition = x(data.indexOf(datum))
          + x.bandwidth()/2
          + dimensions.margin.left
        const yPosition = y(datum.value)
          + dimensions.margin.top
        tooltip.style("transform", `translate(
          calc(-50% + ${xPosition}px), 
          calc(-100% + ${yPosition}px)
          )`)
        // change colour of hovered bar 
        // note that this refers to the selected element 
        // but you need to select it with d3.select(this) to 
        // change its attributes 
        d3.select(this).attr("fill", colourHovered)
      };

      function onMouseLeave(e, datum) {
        tooltip.style("opacity", 0)
        // change colour of hovered bar 
        d3.select(this).attr("fill", colour)
      }

    } else {
      console.log("Missing data")
    }
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container33">
      <h1>Day 34</h1>
      <h2>Workers on Zero Hours Contracts in London</h2>
      <h3>18th Dec 2020</h3>
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

      <div className="wrapper wrapper33">
        <svg ref={svgRef}>
            <g ref={gRef}>
              <g ref={xAxisRef}></g>
              <g ref={yAxisRef}></g>
            </g>
          </svg>
          <div id="tooltip" className="tooltip" ref={tooltipRef}>
            <div id="tooltip-info" className="tooltip-info">number of people</div>
            <div id="tooltip-info-1" className="tooltip-info-1"></div>
            <div id="tooltip-info-2" className="tooltip-info-2">
              18-24 year-olds: 
            </div>
          </div>
      </div>

    </div>
  )
};

export { MyInteractions }