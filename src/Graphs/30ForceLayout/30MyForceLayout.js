// Code based on https://observablehq.com/@d3/force-layout-phyllotaxis?collection=@d3/d3-force

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import "./30ForceLayout.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p> Synthetic data </p>
      <p> Learning to work with force layout, part 1. </p>
    </>
  )
}

const MyForceLayout = () => {

  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();

  /// states ///
  const [nodes, setNodes] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const width = 850;
  const height = 600;
  const n = 200; // initial number of circles 

  /// Colour Scale ///
  const colorScale = chroma.scale(["#fb5607", "#ff006e"]
    .map(color => chroma(color).saturate(1)))
    .domain([10, 20]) // min and max radius 


  /// Data load ///
  useEffect(() => {
    /// Nodes ///
    // create an array of n random elements with radius and colour associated to each
    const nodes = Array.from({length: n}, (j, i) => ({
      id: Math.random(),
      r: 2 * (4 + 9 * Math.random() ** 2),
      //r: 15, //if you want to have a fixed radius 
      color: "maroon"
    }));
    setNodes(nodes)
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (nodes) {
      console.log(nodes)

      /// Graph ///
      // Graphing space 
      const g = d3.select(gRef.current)
        .attr("transform", `translate(${width/2}, ${height/2})`)

      // add all the cirlces as nodes 
      // put them all in the same group 
      // Important! Make sure you greate the group first and select it with ref 
      // otherwise the data won't update 
      const node = g  
        .selectAll("circle")
        .data(nodes, d => d)
        .join("circle")
          .attr("r", 10) // give them a fixed radius to start from 
          //.attr("fill", d => d.color)
          .attr("fill", d => colorScale(d.r))
          .attr("stroke", d => colorScale(d.r))
          .attr("stroke-opacity", 0.35)
          .attr("stroke-width", 15)

      // add a circle surrouding the whole force graph 
      const circle = g
        .append("circle")
        .attr("r", 290)
        .attr("fill", "#ffdab9")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "#ff006e")
        .attr("stroke-dasharray", "5 5")
        .attr("stroke-width", 3)


      // add the force simulation 
      // this creates the arrangement of the elements but doesn;t move them 
      // the movement comes from the tick, which needs to be triggered 
      function tick() {
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      }
      const simulation = d3.forceSimulation(nodes)
        .on("tick", tick)
        .force("collide", d3.forceCollide().radius(d => 1 + d.r))
        //.force("x", d3.forceX(center[0]).strength(0.001))
        //.force("y", d3.forceY(center[1]).strength(0.001))
        .stop();

      // differ application of the forces
      // this is how long it takes for the simulation to happen 
      setTimeout(() => {
        simulation.restart();
        node.transition().attr("r", d => d.r);
      }, 300);

      // show the initial arrangement
      tick();

    } else {
      console.log("Missing data")
    }
  }, [nodes]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  // to change the data 
  const getRandomData = () => {
    const nodes = Array.from({length: _.random(30, 200)}, (j, i) => ({
      id: Math.random(),
      r: 2 * (4 + 9 * Math.random() ** 2),
      //r: 15,
      color: "maroon"
    }));
    setNodes([...nodes])
  }

  return (
    <div className="page-container page-container30">
      <h1>Day 30</h1>
      <h2>Force Layout Part 1</h2>
      <h3>13th Dec 2020</h3>
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

      
      <div className="wrapper wrapper30">
      <button onClick={getRandomData} className="button30">random</button>
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}></g>
        </svg>
      </div>

    </div>
  )
};

export { MyForceLayout }