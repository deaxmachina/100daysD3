// Code based on https://observablehq.com/@akibmayadav/foam-tree-visualization
// Data from

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import {voronoiTreemap} from "d3-voronoi-treemap";
import {voronoiMapSimulation} from "d3-voronoi-map"
import "./36VoronoiTree.css";
//import dataLoad from "./data/data.json";
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
  const [taxonomyHierarchy, setTaxonomyHierarchy] = useState(null);
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


  /// Data load ///
  useEffect(() => {
    d3.json("https://gist.githubusercontent.com/akibmayadav/75f72791ca44aec765acf49b66b7b86a/raw/2f58a81aa83cebeb8742efda614ed870614f2d92/small_taxonomy.json").then(dataRaw => {
      const taxonomyHierarchy = d3.hierarchy(dataRaw, d => d.children).sum(d => d.children?.length || 1)
      setTaxonomyHierarchy(taxonomyHierarchy)
      setData(dataRaw)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data && taxonomyHierarchy) {

      console.log(data)
      console.log(taxonomyHierarchy)

      function colorHierarchy(hierarchy) {
        hierarchy.color = hierarchy.data.node_attributes[0].color || 'black';
        if(hierarchy.children) {
          hierarchy.children.forEach( child => colorHierarchy(child))
        } 
      }

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

      voronoiTreeMap(taxonomyHierarchy);
      colorHierarchy(taxonomyHierarchy);

      let allNodes = taxonomyHierarchy.descendants()
        .sort((a, b) => b.depth - a.depth)
        .map((d, i) => Object.assign({}, d, {id: i}));

      console.log(allNodes)

      voronoi.selectAll('path')
          .data(allNodes)
          .join('path')
          .attr('d', d => "M" + d.polygon.join("L") + "Z")
            .style('fill', d => d.parent?.color)
            .attr("stroke", d=> "white")
            .attr("stroke-width", d=> d.height===1 ? 7 : d.height+1 )
            .style('fill-opacity',d=> d.height===0 ? 1 : 0)
            .attr('pointer-events', d => d.depth === 2 ? 'all' : 'none');

     labels.selectAll('text')
        .data(allNodes.filter(d => d.height === 0))
        .enter()
        .append('text')
        .attr('class', d => `label-${d.id}`)
        .attr('text-anchor', 'middle')
        .attr("transform", d => "translate("+[d.polygon.site.x, d.polygon.site.y+6]+")")
        .text(d => d.data.node_attributes[0].name) 
        .attr('opacity', 1)                            
        .attr('cursor', 'default')
        .attr('pointer-events', 'none')
        .attr('fill', 'black')
        .style('font-family', 'Montserrat')
        .style('font-size', '7px');


    } else {
      console.log("Missing data")
    }
  }, [data, taxonomyHierarchy]);

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