// Code from Amelia Wattenberger https://wattenberger.com/blog/d3-interactive-charts


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./33Interactions.css";
import dataLoad from "./data/data.csv";
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

const Interactions = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();
  const backgroundRef = useRef();
  const tooltipRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const width = 600;
  let dimensions = {
    width: width,
    height: width * 0.5,
    margin: {
      top: 35,
      right: 10,
      bottom: 50,
      left: 50
    }
  };
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom


  const summaryAccessor = d => d.Summary
  const actualHoursAccessor = d => +d.HoursActual
  const developerHoursAccessor = d => +d.DeveloperHoursActual
  const diffAccessor = d => +d.HoursEstimate - actualHoursAccessor(d)
  const yAccessor = d => d.length


  /// Data load ///
  useEffect(() => {
    const dataset = d3.csv(dataLoad).then(dataset => {
      // Only use the first estimate per task (with highest actual hours)
      let usedTasks = {}
      dataset = dataset.filter(d => {
        const hours = actualHoursAccessor(d)
        if (usedTasks[summaryAccessor(d)]) {
          const hasHigherValue = hours > usedTasks[summaryAccessor(d)]
          if (!hasHigherValue) return false
        }
        usedTasks[summaryAccessor(d)] = hours
        return actualHoursAccessor(d) > 10
      })
      dataset = dataset.filter(d => (
        diffAccessor(d) >= -50
        && diffAccessor(d) <= 50
      ))
      setData(dataset)
    });
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {
      /// Graph canvas ///
      const wrapper = d3.select(svgRef.current)
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
      const bounds = d3.select(gRef.current)
        .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)
      const background = d3.select(backgroundRef.current)

      // init static elements 
      bounds
        .selectAll(".bins")
        .data([0])
        .join("g")
        .classed("bins", true)
      bounds
        .selectAll(".mean")
        .data([0])
        .join("line")
        .classed("mean", true)
      bounds
        .selectAll(".x-axis")
        .data([0])
        .join("g")
        .classed("x-axis", true)
        .style("transform", `translateY(${dimensions.boundedHeight}px`)
        .append("text")
        .attr("class", "x-axis-label")

      /// Scales ///
      // X Scale 
      const xScale = d3.scaleLinear()
        .domain(d3.extent(data, diffAccessor))
        .range([0, dimensions.boundedWidth])
        .nice()
      // Y Scale 
      const binsGenerator = d3.histogram()
        .domain(xScale.domain())
        .value(diffAccessor)
        .thresholds(30)
      const bins = binsGenerator(data)
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, yAccessor)])
        .range([dimensions.boundedHeight, 0])
        .nice()

      /// Draw data ///
      const barPadding = 1.5

      const binGroups = bounds.select(".bins")
        .selectAll(".bin")
        .data(bins)
        .join("g")
        .attr("class", "bin")
        .attr("fill", 'plum')


      const barRects = binGroups
        .append("rect")
        .attr("x", d => xScale(d.x0) + barPadding)
        .attr("y", d => yScale(yAccessor(d)))
        .attr("height", d => dimensions.boundedHeight - yScale(yAccessor(d)))
        .attr("width", d => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))

      const mean = d3.mean(data, diffAccessor)
      const meanLine = bounds
        .selectAll(".mean")
        .attr("x1", xScale(mean))
        .attr("x2", xScale(mean))
        .attr("y1", -20)
        .attr("y2", dimensions.boundedHeight)
      const meanLineText = bounds
        .append("text")
        .attr("class", "mean-label")
        .attr("x", xScale(mean))
        .attr("y", -25)
        .text("mean")

      /// Draw peripherals ///
      // Axes //
      // X Axis 
      const xAxisGenerator = d3.axisBottom().scale(xScale)
      const xAxis = bounds.select(".x-axis").call(xAxisGenerator)
      const xAxisLabel = xAxis.select(".x-axis-label")
        .attr("x", dimensions.boundedWidth / 2)
        .attr("y", dimensions.margin.bottom - 10)
        .text("Hours over-estimated")

      // Background //
      // Background left 
      const backgroundLeft = background
        .append("rect")
        .attr("class", "background left-side-background")
        .attr("y", -20)
        .attr("width", dimensions.boundedWidth / 2)
        .attr("height", dimensions.boundedHeight + 20)
      const leftSideLabel = background
        .append("text")
        .attr("class", "label left-side-label")
        .attr("x", 10)
        .attr("y", 0)
        .text("Under-estimated")
      // Background right 
      const backgroundRight = background
        .append("rect")
        .attr("class", "background right-side-background")
        .attr("x", dimensions.boundedWidth / 2 + 1)
        .attr("y", -20)
        .attr("width", dimensions.boundedWidth / 2 - 1)
        .attr("height", dimensions.boundedHeight + 20)
      const rightSideLabel = background
        .append("text")
        .attr("class", "label right-side-label")
        .attr("x", dimensions.boundedWidth - 10)
        .attr("y", 0)
        .text("Over-estimated")

      /// Interactions ///
      binGroups.select("rect")
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)

      const tooltip = d3.select(tooltipRef.current)

      function onMouseEnter(e, datum) {
        tooltip.style("opacity", 1)
        tooltip.select("#range")
          .text([
            datum.x0 < 0
              ? `Under-estimated by`
              : `Over-estimated by`,
            Math.abs(datum.x0),
            "to",
            Math.abs(datum.x1),
            "hours"
          ].join(" "))
        tooltip.select("#examples")
          .html(
            datum 
              .slice(0, 3)
              .map(summaryAccessor)
              .join("<br />")
          )
        tooltip.select("#count")
          .text(Math.max(0, yAccessor(datum) - 2))

        const percentDeveloperHoursValues = datum.map(d => (
          (developerHoursAccessor(d) / actualHoursAccessor(d)) || 0
        ))
        const percentDeveloperHours = d3.mean(percentDeveloperHoursValues)
        const formatHours = d => d3.format(",.2f")(Math.abs(d))
        tooltip.select("#tooltip-bar-value")
          .text(formatHours(percentDeveloperHours))
        tooltip.select("#tooltip-bar-fill")
          .style("width", `${percentDeveloperHours * 100}%`)

        // to position the toolbar 
        const x = xScale(datum.x0)
          + (xScale(datum.x1) - xScale(datum.x0)) / 2
          + dimensions.margin.left
        const y = yScale(yAccessor(datum))
          + dimensions.margin.top
        tooltip.style("transform", `translate(
          calc(-50% + ${x}px), 
          calc(-100% + ${y}px)
          )`)

        

      }
      function onMouseLeave(datum) {
        tooltip.style("opacity", 0)
      }

    } 
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container33">
      <h1>Day xx</h1>
      <h2>Title</h2>
      <h3>Date</h3>
      <button
        className="graph-explain-icon"
        onClick={toggleGraphExplanation}
      >
        <FontAwesomeIcon icon={faBookOpen} size="md" />
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
            <g ref={backgroundRef} id="background"></g>
          </g>
        </svg>

        <div id="tooltip" class="tooltip" ref={tooltipRef}>
          <div class="tooltip-range" id="range"></div>
          <div class="tooltip-examples" id="examples"></div>
          <div class="tooltip-value">
            ...of <span id="count"></span> tasks
                </div>
          <div class="tooltip-bar-value">
            <b><span id="tooltip-bar-value"></span>%</b>
                    of the work was done by developers
                </div>
          <div class="tooltip-bar">
            <div class="tooltip-bar-fill" id="tooltip-bar-fill"></div>
          </div>
        </div>
      </div>

    </div>
  )
};

export { Interactions }