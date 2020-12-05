// Code based on 
// Data from

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature, mesh } from 'topojson';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

import "./25WorldHeritageSites.css";
import dataLoad from "./data/whc-sites-2019.csv";
import { BubbleMap } from "./Map/Map";


const GraphExplain = () => {
  return (
    <>
      <p>Data source: <a href="" target="_blank">Name of data source </a> (link)</p>
      <p className="disclaimer">*  </p>
    </>
  )
}

// for the world map 
const jsonUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-50m.json';

const WorldHeritageSites = () => {
  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [worldAtlas, setWorldAtlas] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const width = 950;
  const height = 600;

  /// Data load ///
  // Map //
  useEffect(() => {
    d3.json(jsonUrl).then(topology => {
      const { countries, land } = topology.objects;
      setWorldAtlas({
        land: feature(topology, land),
        interiors: mesh(topology, countries, (a, b) => a !== b)
      });
    });
  }, []);
  // Heritige sites //
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setData(d)
    })
  }, []);

  if (!worldAtlas || !data) {
    return <pre>Loading...</pre>;
  }

  console.log(data)


  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container26">
      <h1>Day 25</h1>
      <h2>Word Heritage Sites</h2>
      <h3>5th Dec 2020</h3>
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

      <div className="wrapper wrapper26">
        <svg ref={svgRef} width={width} height={height}> 
          <BubbleMap worldAtlas={worldAtlas} data={data} />      
        </svg>
      </div>

    </div>
  )
};

export { WorldHeritageSites }