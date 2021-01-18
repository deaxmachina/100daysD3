// Code based on 
// Data from

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./31UpdateAnimations.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p>Animated bars on the left created following tutorial by Shirley Wu on <a href="https://frontendmasters.com/teachers/shirley-wu/" target="_blank">Frontend Masters</a> (link)</p>
      <p>
        Synthetic random data. Comparing two ways of doing animated transitions upon data update. 
        The one on the left is more complex, keeping track of data from previous state. 
        The one on the right simply makes the bars grow from the bottom to their final position. 
      </p>
    </>
  )
}

const UpdateAnimations = () => {

  /// refs ///
  const svgRef = useRef();
  const gRef1 = useRef();
  const gRef2 = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const width = 850;
  const height = 500;
  const rectWidth = 50;
  const rectColour = "#eb5e28"
  const rectStroke = "#403d39"


  /// Data load ///
  useEffect(() => {
    const initialData = _.times(_.random(3, 8), i => _.random(50, 250))
    setData(initialData)
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      // define transition 
      const t = d3.transition().duration(1000)

      /// Version 1 ///
      // This has the effect of the rects going down when the data is 
      // updated. This is controlled by the exit selection 
      // Note that it is importnat to *return* the enter selection 
      // In the enter selection we include the 'starting' place for the 
      // rects that are newly created on each data update 
      // In the new data if a new element comes in which was already there 
      // it will get pushed to the position (if different) in the new data array 
      // and it will slide horizontally there 
      const svg1 = d3.select(gRef1.current)
      const graph1 = svg1.selectAll("rect")
        .data(data, d => d)
        .join(
          enter => {
            return enter.append("rect")
            // attributes to transition from 
              .attr("x", (d, i) => i * rectWidth)
              .attr("height", 0)
              .attr("y", height)
              // constants go here
              .attr("fill", rectColour)
              .attr('stroke', rectStroke)
              .attr('stroke-width', 4)
            
          },
          //update => update,
          // to update a property of just the rect that remain between updates
          update => {
            return update
              .attr('opacity', 0.4)
          },
          exit => {
            exit.transition(t)
            // everything after here is transition TO
              .attr("height", 0)
              .attr("y", height)
          }
        ) // enter and update selection
          .attr("width", rectWidth)
          .transition(t)
          // attributes to transition TO
          .attr("x", (d, i) => i * rectWidth)
          .attr("height", d => d)
          .attr("y", d => height - d)


        /// Version 2 ///
        // Here we just grow all the data from the bottom to the top
        // as the data it updated 
        const svg2 = d3.select(gRef2.current)
          .attr("transform", `translate(${450}, ${0})`)
        const graph = svg2.selectAll("rect")
        .data(data, d => d)
        .join("rect")
          .attr("width", rectWidth)
          .attr("fill", rectColour)
          .attr('stroke', rectStroke)
          .attr('stroke-width', 4)
          .attr("height", 0)
          .attr("y", height)
          .attr("x", (d, i) => i * rectWidth)
        .transition(t)     
          .attr("height", d => d)
          .attr("y", d => height - d)
          .attr("x", (d, i) => i * rectWidth)

    } 
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  const buttonClick = () => {
    // create some random data between 0 and 100 
    const newData = _.times(_.random(3, 8), i => _.random(60, 350))
    setData([...newData])
  }

  return (
    <div className="page-container page-container31">
      <h1>Day 31</h1>
      <h2>Animated Transitions</h2>
      <h3>14th Dec 2020</h3>
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

      <div className="wrapper wrapper31">
        <button className="button31" onClick={buttonClick}>random</button>
        <svg ref={svgRef} width={width} height={height}>
            <g ref={gRef1}></g>
            <g ref={gRef2}></g>
          </svg>
      </div>

    </div>
  )
};

export { UpdateAnimations }