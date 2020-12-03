// Code based on 
// Data from

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
//import "./something.css";
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

const MyChart = () => {

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
  const width = 850;
  const height = 600;


  /// Data load ///
  useEffect(() => {
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {
      console.log(data)
    } else {
      console.log("Missing data")
    }
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container-number">
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

      <div className="wrapper wrapper-number">
        <svg ref={svgRef} width={width} height={height}>
            <g ref={gRef}>
              <g ref={xAxisRef}></g>
              <g ref={yAxisRef}></g>
            </g>
          </svg>
      </div>

    </div>
  )
};

export { MyChart }