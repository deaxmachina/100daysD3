// Data from https://www.researchgate.net/publication/340446440_ENVIRONMENTAL_SUSTAINABILITY_OF_OLYMPIC_GAMES_A_NARRATIVE_REVIEW_OF_EVENTS_INITIATIVES_IMPACT_AND_HIDDEN_ASPECTS

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./50EventsTimeline.css";
import _ from "lodash";
import chroma from "chroma-js";
import rough from 'roughjs/bundled/rough.cjs';
import dataLoad from "./data/environmental_cal.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faTree, faGrinStars, faLaughBeam } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p>Data source: 
        <a href="https://www.researchgate.net/publication/340446440_ENVIRONMENTAL_SUSTAINABILITY_OF_OLYMPIC_GAMES_A_NARRATIVE_REVIEW_OF_EVENTS_INITIATIVES_IMPACT_AND_HIDDEN_ASPECTS" target="_blank">
        Maria Konstantaki (2018) "Environmental Sustainability of Olympic Games: a Narrative Review of Events, Initiatives, Impact and Hidden Aspects"
        </a>
      </p>
      <p className="disclaimer"> 
        Timeline of major positive and negative envornmental events/initiatives/outcomes at or realted to the Olympics. Based on events described in paper by Maria Konstantaki (2018). Refer to the source for more details and methodology. 
      </p>
    </>
  )
}

const EventsTimeline = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const gRef = useRef();
  const tooltipRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  /// constatns ///
  // dimensions 
  const width = 1100;
  const height = 600;
  const margin = {top: 0, right: 30, bottom: 0, left: 30}
  // colours 
  const positiveColour = chroma("#2a9d8f").saturate(1)
  const negativeColour = chroma("#e76f51").saturate(1)


  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setData(d)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      let rc = rough.svg(document.getElementById("svg"));

      /// Scales ///
      // X Scale - year timeline 
      const xScale = d3.scalePoint()
        .domain(data.map(d => d.year))
        .range([margin.left, width - margin.right])


      /// Axes ///
      // X Axis - the years timeline 
      const xAxis = g => g
        .attr("transform", `translate(${margin.left}, ${height/2})`)
        .call(d3.axisBottom(xScale).tickFormat(i => i).tickSizeOuter(0))
        .call(g => g.select(".domain")
          .attr("color", positiveColour)
          .attr("stroke-width", 8)
          .attr("stroke-linecap", "round")
        )
        .call(g => g.selectAll(".tick").selectAll("line").remove())
        .call(g => g.selectAll("text")
          .attr("fill", positiveColour)
          .attr("font-size", "18px")
          .attr("font-family", 'Indie Flower, cursive')
        )
        
      // call the axis 
      d3.select(xAxisRef.current).call(xAxis)

      /// Graph ///
      // Graphing area
      const g = d3.select(gRef.current)
      .attr("transform", `translate(${margin.left}, ${height/2})`)

      // one group for each event
      const timelineLinesGroups = g
        .selectAll(".timeline-lines")
        .data(data)
        .join("g")
        .classed("timeline-lines", true)
          .attr("transform", d => `translate(${xScale(d.year)}, ${0})`)

      // draw lines extending from the year when each event happend 
      // either up or down depending on whether the event outcome 
      // was positive or negative
      const timelineLines = timelineLinesGroups
        .append("line")
          .attr("y1", 0)
          .attr("y2", d => 
          (d.polarity == "negative") 
            ? 100
            : d.olympics == "no"
            ? -200
            : -100
          )
          .attr("stroke", "white")
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "1 1")


      // draw one shape (circle) for each event that happened
      // use conditionals to change the colour or the pattern of the fill 
      // based on whether the even was an olympics or good or bad outcome
      const eventShapes = timelineLinesGroups
        .each(function(d, i) {
          
          d3.select(this).node()
            .appendChild(
              rc.circle(0, 
                d.polarity == "negative"
                ? 100
                : d.olympics == "no"
                  ? -200
                : -100, 
                80, {
                stroke: d.polarity == 'negative' ? negativeColour : positiveColour,
                strokeWidth: 1.2,
                fillStyle: d.olympics == 'no' ? 'zigzag-line' : 'cross-hatch',
                fill: d.polarity == 'negative' ? negativeColour : positiveColour,
                roughness: 2.7,
          })
          )
        })


      // Add a normal circle behind each rough circle just for the hover events
      const eventCircles = timelineLinesGroups
        .selectAll(".event-circle")
        .data(d => [d])
        .join("circle")
        .classed("event-circle", true)
          .attr("cx", 0)
          .attr("cy", d => d.polarity == "negative"? 100 : d.olympics == "no" ? -200 : -100)
          .attr("r", 80)
          .attr("opacity", 0.0001)
          //.attr("fill", 'none')


      /// Tooltip ///
      const tooltip = d3.select(tooltipRef.current)
      eventCircles
      .on('mouseenter', (e, datum) => {
        console.log(datum)
        setSelectedEvent(datum)
        tooltip 
        .style('transform', d => `translate(
            ${xScale(datum.year)}px,
            ${
              datum.polarity == "negative"
              ? 100 + 100
              : datum.olympics == "no"
                ? -200 + 100
              : -100 + 100
            }px`
          ) 
        .style("opacity", 1)
      })
      .on('mouseleave', () => {
        tooltip.style("opacity", 0)
      })
       



    } 
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container-50">
      <h1>Day 50&52</h1>
      <h2 className="graph-title-50">the Olympics and the Environment</h2>
      <h3>18th Jan 2021</h3>
      <button 
        className="graph-explain-icon" 
        onClick={toggleGraphExplanation}
      >
        <FontAwesomeIcon icon={faBookOpen} />
        <span className="info-span">info</span>
      </button>  
      {
        revealGraphExplanation 
        ? <GraphExplain />
        : null
      } 

      <div className="wrapper wrapper-50">
        <svg id="svg" ref={svgRef} width={width + margin.left + margin.right} height={height}>
            <g ref={gRef}></g>
            <g ref={xAxisRef}></g>
        </svg>
        <div className="tooltip-50" ref={tooltipRef}>
          { selectedEvent ?
           <div>
             {selectedEvent.polarity === "positive" ? 
              <>
                <span className="tooltip-title-pos-50 tooltip-title-50"><FontAwesomeIcon icon={faLaughBeam} /></span>
                <span className=" tooltip-title-pos-50 tooltip-title-50">{selectedEvent.event}</span>
              </>
             : 
              <>
                <span className="tooltip-title-neg-50 tooltip-title-50">{selectedEvent.event}</span>
              </>
             }
              <span className="tooltip-info-50">{selectedEvent.notes}</span>     
            </div> 
            : null
          }
        </div>
      </div>

    </div>
  )
};

export { EventsTimeline }