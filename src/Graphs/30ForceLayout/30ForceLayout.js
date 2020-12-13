// Code from https://observablehq.com/@d3/force-layout-phyllotaxis?collection=@d3/d3-force
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ForceLayout = () => {

  const svgRef = useRef();

  /// constants ///
  const n = 200; 
  const height = 600;
  const width = 600;


  // D3 Code //
  useEffect(() => {

    /// Scales ///
    // Colour Scale 
    const color = d3.scaleSequential(d3.interpolateTurbo).domain([0, n])

    /// Nodes ///
    // create an array of n random elements with radius and colour associated to each
    const nodes = Array.from({length: n}, (_, i) => ({
      r: 2 * (4 + 9 * Math.random() ** 2),
      color: color(i)
    }));
    console.log(nodes);

    /// Graph ///
    // Graphing space 
    const svg = d3.select(svgRef.current)
      .attr("height", height)
      .attr("width", width)

    // add all the cirlces as nodes 
    // put them all in the same group 
    const node = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", 10) // give them a fixed radius to start from 
        .attr("fill", d => d.color);

    // add the force simulation 
    // the default phyllotaxis arrangement is centered on <0,0> with a distance between nodes of ~10 pixels
    // we will scale & translate it to fit the canvas
    const scale = 1.5;
    const center = [width / 2, height / 2];
    const rescale = isNaN(nodes[0].x);

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
      .force("x", d3.forceX(center[0]).strength(0.001))
      .force("y", d3.forceY(center[1]).strength(0.001))
      .stop();

    // differ application of the forces
    // this is how long it takes for the simulation to happen 
    setTimeout(() => {
      simulation.restart();
      node.transition().attr("r", d => d.r);
    }, 300);

    // once the arrangement is initialized, scale and translate it
    // note that you don't need this if you just translate the whole 
    // group element from the start 
    /*
    if (rescale) {
      for (const node of nodes) {
        node.x = node.x * scale + center[0];
        node.y = node.y * scale + center[1];
      }
    }
    */

    // show the initial arrangement
    tick();

  }, [])

  return (
    <>
      <h1>Force layout phyllotaxis arrangement</h1>
      <div className="container">
        <svg ref={svgRef}></svg>
      </div>
    </>
  )
};

export { ForceLayout }