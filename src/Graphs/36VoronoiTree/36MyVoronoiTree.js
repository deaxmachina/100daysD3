// Code based on https://observablehq.com/@will-r-chase/voronoi-treemap

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import {voronoiTreemap} from "d3-voronoi-treemap";
import "./36VoronoiTree.css";
import dataLoad from "./data/tfl_journeys.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'
import * as seedrandom from 'seedrandom';
import MySlider from "./Slider.js"

const GraphExplain = () => {
  return (
    <>
      <p style={{marginTop: '1%'}}>Data source: <a href="https://data.london.gov.uk/dataset/public-transport-journeys-type-transport" target="_blank">London Gov Data </a></p>
      <p className="disclaimer">* Public Transport Journeys by Type of Transport by TfL. Refer to source for more information about the data. </p>
    </>
  )
}

const VoronoiTree = () => {

  /// refs ///
  const svgRef = useRef();
  const voronoiRef = useRef();
  const labelsRef = useRef();
  const gRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("15")
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const width = 550;
  const height = 550;
  const margin = {top: 20, right: 35, bottom: 0, left: 35}

  const ellipse = d3
    .range(100)
    .map(i => [
      (width * (1 + 0.99 * Math.cos((i / 50) * Math.PI))) / 2,
      (height * (1 + 0.99 * Math.sin((i / 50) * Math.PI))) / 2
    ])

  const transportColor = function(modeOfTransport) {
    var colors = {
      'Bus journeys (m)': "#f94144", 
      'Underground journeys (m)': "#43aa8b", 
      'DLR Journeys (m)': "#90be6d",
      'Tram Journeys (m)': "#f9c74f", 
      'Overground Journeys (m)': "#f8961e", 
      'Emirates Airline Journeys (m)': '#f3722c',
      'TfL Rail Journeys (m)': '#577590'
    };
    return colors[modeOfTransport];
  }

  /// Data load ///
  useEffect(() => {
    const jouneys_year = dataLoad.filter(obj => {return obj.year === selectedYear}) //select just one year 
    const journeys_nest = d3.group(jouneys_year, d => d.transport) // group by transport 
    const journeys_hierarchy = d3.hierarchy(journeys_nest).sum(d => d.journeys) // sum journeys by transport
    setData(journeys_hierarchy)
  }, [selectedYear]);


  /// D3 Code ///
  useEffect(() => {
    if (data) {

      /// Graph ///
      // Graphing area 
      const svg = d3.select(gRef.current)
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      // Groups for the voronoi tree and the text labels 
      const voronoi = d3.select(voronoiRef.current)
      const labels = d3.select(labelsRef.current)

      // Construct the voronoi tree map 
      var seed = seedrandom(42);
      const voronoiTreeMap = voronoiTreemap().prng(seed).clip(ellipse);
      voronoiTreeMap(data);

      // Convert the data into right shape
      const allNodes = data.descendants()
        .sort((a, b) => b.depth - a.depth)
        .map((d, i) => Object.assign({}, d, {id: i}));

      // Draw the voronoi
      voronoi.selectAll('path')
        .data(allNodes, d => d.id)
        .join('path')
          .attr('d', d => "M" + d.polygon.join("L") + "Z")
          .style('fill', d => transportColor(d.data.transport))
          .attr("stroke", "#161a1d")
          .attr("stroke-width", 5)
          .style('fill-opacity', d => d.depth === 2 ? 1 : 0)


      labels.selectAll('text')
        .data(allNodes.filter(d => d.depth === 2 ))
        .join('text')
        .attr('text-anchor', 'middle')
        .attr("transform", d => "translate("+[d.polygon.site.x, d.polygon.site.y+6]+")")
        .text(d => d.data.transport.toLowerCase().split("journeys")[0])                                  
        .attr('cursor', 'default')
        .attr('pointer-events', 'none')
        .attr('fill', 'white')
        .style('font-family', 'sans-serif');

    } else {
      console.log("Missing data")
    }
  }, [data, selectedYear]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

    // to select from the slider 
    const selectYearSlider = (e, v) => {
      if (v == 0){
        setSelectedYear('15')
      } 
      if (v == 20){
        setSelectedYear('16')
      } 
      if (v == 40){
        setSelectedYear('17')
      } 
      if (v == 60){
        setSelectedYear('18')
      } 
      if (v == 80){
        setSelectedYear('19')
      } 
      if (v == 100){
        setSelectedYear('20')
      } 
    }

  return (
    <div className="page-container page-container36">
      <h1>Day 36&37</h1>
      <h2>Journeys by type in London since 2015</h2>
      <h3>2nd-3rd Jan 2021</h3>
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

      <div className="wrapper wrapper36">
        <div style={{marginBottom: "2%"}}>Financial Year (select)</div>
        <MySlider onChange={(e, v) => selectYearSlider(e, v)}/>
        <svg ref={svgRef} width={width + margin.left + margin.right} height={height + margin.top}>
          <g ref={gRef}>
            <g ref={voronoiRef}></g>
            <g ref={labelsRef}></g>
          </g>
        </svg>
      </div>

    </div>
  )
};

export { VoronoiTree }