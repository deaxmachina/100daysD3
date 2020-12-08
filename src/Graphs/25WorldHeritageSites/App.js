// Code based on Mike Bostock and Curran Kelleher 
// Data from UNESCO and Kaggle

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature, mesh } from 'topojson';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

import "./25WorldHeritageSites.css";
import dataLoad from "./data/whc-sites-2019.csv";
import { BubbleMap } from "./Map/Map";
import { Histogram } from "./Histogram/Histogram"


const GraphExplain = () => {
  return (
    <>
      <p>Data source: <a href="https://www.kaggle.com/ujwalkandi/unesco-world-heritage-sites" target="_blank">UNESCO/Kaggle </a> (https://www.kaggle.com/ujwalkandi/unesco-world-heritage-sites)</p>
      <p className="disclaimer">
        *Very crude first go at a brushable histogram and map. 
        Refer to the data source for more information about the data. 
      </p>
    </>
  )
}

// for the world map 
const jsonUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-50m.json';

const WorldHeritageSites = () => {
  /// refs ///
  const svgRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [worldAtlas, setWorldAtlas] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);
  const [brushExtent, setBrushExtent] = useState();

  /// constatns ///
  // dimensions 
  const width = 1000;
  const height = 580;
  const dateHistogramSize = 0.2;

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
      d.forEach(element => {
        element.date = new Date(+element.date_inscribed, 0, 1) // from string to datetime object
      })
      setData(d)
    })
  }, []);

  if (!worldAtlas || !data) {
    return <pre>Loading...</pre>;
  }

  const filteredData = brushExtent? data.filter(d => {
      const date = d.date;
      return date > brushExtent[0] && date < brushExtent[1]
  }) : data;


  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container25">
      <h1>Day 25&26</h1>
      <h2>Word Heritage Sites</h2>
      <h3>5th-8th Dec 2020</h3>
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

      <div className="wrapper wrapper25">
        <svg ref={svgRef} width={width} height={height}> 
          <BubbleMap worldAtlas={worldAtlas} data={filteredData} brushExtent={brushExtent} width={width} height={height} /> 
          <g transform={`translate(${0}, ${height - dateHistogramSize * height})`}>
            <Histogram 
              data={data} 
              width={width} 
              height={dateHistogramSize * height} 
              setBrushExtent={setBrushExtent}
            />  
          </g>          
        </svg>
      </div>

    </div>
  )
};

export { WorldHeritageSites }