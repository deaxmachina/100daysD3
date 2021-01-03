// Code based on https://observablehq.com/@will-r-chase/voronoi-treemap

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import {voronoiTreemap} from "d3-voronoi-treemap";
import {voronoiMapSimulation} from "d3-voronoi-map"
import "./36VoronoiTree.css";
import dataLoad from "./data/mosaic_table.csv";
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

const VoronoiTree = () => {

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
  const width = 600;
  const height = 600;
  const margin = {top: 20, right: 20, bottom: 50, left: 50}

  const ellipse = d3
    .range(100)
    .map(i => [
      (width * (1 + 0.99 * Math.cos((i / 50) * Math.PI))) / 2,
      (height * (1 + 0.99 * Math.sin((i / 50) * Math.PI))) / 2
    ])

  const regionColor = function(region) {
    var colors = {
      "Middle East and Africa": "#596F7E",
      "Americas": "#168B98",
      "Asia": "#ED5B67",
      "Oceania": "#fd8f24",
      "Europe": "#919c4c"
    };
    return colors[region];
  }
  function colorHierarchy(hierarchy) {
    if(hierarchy.depth === 0) {
      hierarchy.color = 'red';
    } else if(hierarchy.depth === 1){
      hierarchy.color = regionColor(hierarchy.data.key);
    } else {
      hierarchy.color = hierarchy.parent.color;
    }
    if(hierarchy.children) {
      hierarchy.children.forEach( child => colorHierarchy(child))
    } 
  }


  /// Data load ///
  useEffect(() => {
      d3.csv("https://gist.githubusercontent.com/will-r-chase/16827fa79e02af9e3a0651fb0d79b426/raw/92b321a8bc4d98e463156ef03a5da5cf05065704/freedom_clean.csv", d3.autoType).then(freedom => {
        const freedom_year = freedom.filter(obj => {return obj.year === 2011})
        console.log(freedom_year)
        const freedom_nest = d3.group(freedom_year, d => d.region_simple)
        //const data_nested = {key: "freedom_nest", values: freedom_nest}
        const population_hierarchy = d3.hierarchy(freedom_nest).sum(d => d.population)
        setData(population_hierarchy)
      })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      console.log(data)
      /// Graph ///
      // Graphing area 
      const svg = d3.select(gRef.current)

      // Just a background rectangle 
      const backgroundRect = svg
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "#F5F5F2");

      // Groups for the voronoi tree and the text labels 
      const voronoi = svg.append("g")
      const labels = svg.append("g")

      // Construct the voronoi tree map 
      let voronoiTreeMap = voronoiTreemap().clip(ellipse);

      voronoiTreeMap(data);
      colorHierarchy(data);

      const allNodes = data.descendants()
        .sort((a, b) => b.depth - a.depth)
        .map((d, i) => Object.assign({}, d, {id: i}));
      console.log(allNodes)

    voronoi.selectAll('path')
    .data(allNodes)
    .join('path')
      .attr('d', d => "M" + d.polygon.join("L") + "Z")
      .style('fill', d => d.parent ? d.parent.color : d.color)
      .attr("stroke", "#F5F5F2")
      .attr("stroke-width", 0)
      .style('fill-opacity', d => d.depth === 2 ? 1 : 0)
      .transition()
      .duration(1000)
      .attr("stroke-width", d => 7 - d.depth*2.8)
      .style('fill', 'red');




    } else {
      console.log("Missing data")
    }
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container-36">
      <h1>Day xx</h1>
      <h2>Title</h2>
      <h3>Date</h3>
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

      <div className="wrapper wrapper-36">
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}></g>
        </svg>
      </div>

    </div>
  )
};

export { VoronoiTree }