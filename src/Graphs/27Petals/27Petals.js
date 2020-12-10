// Code based on Shirley Wu flower pentals tutorial on Front End Masters
// Really messy code! I just wanted to do this really quickly to see what the flowers would look like :)

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./27Petals.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>
      <p className="disclaimer">* Just a very quick sketch for fun. Following the Front End Masters course by Shirley Wu
      (https://frontendmasters.com/teachers/shirley-wu/)</p>
    </>
  )
}

// petal paths //
const petalPaths = [
  'M0 0 C50 50 50 100 0 100 C-50 100 -50 50 0 0',
  'M-35 0 C-25 25 25 25 35 0 C50 25 25 75 0 100 C-25 75 -50 25 -35 0',
  'M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0',
  'M0 0 C50 25 50 75 0 100 C-50 75 -50 25 0 0',
]

const Petals = () => {

  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();

  /// states ///
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const svgWidth = 850;
  const svgHeight = 560;
  const width = 400;
  const height = 400;

  // colours //
  const fillColours = ["#ffcdb2", "#ffb4a2", '#e5989b', '#b5838d', '#6d6875']
  //const strokeColour1 = "#b5838d"


  /// D3 Code ///
  useEffect(() => {
    /// Graph ///
    // Graphing area //
    const svg = d3.select(svgRef.current)
      .attr("width", svgWidth)
      .attr("height", svgHeight)

    const container5 = svg.append("g")
      .attr("transform", `translate(${450}, ${80})`)

    const container6 = svg.append("g")
      .attr("transform", `translate(${750}, ${400})`)

    const container7 = svg.append("g")
      .attr("transform", `translate(${200}, ${430})`)

    const container1 = svg.append("g")
      .attr("transform", `translate(${500}, ${350})`)

    const container2 = svg.append("g")
      .attr("transform", `translate(${250}, ${250})`)

    const container3 = svg.append("g")
      .attr("transform", `translate(${700}, ${200})`)

    const container4 = svg.append("g")
      .attr("transform", `translate(${100}, ${100})`)



    // For drawing a single petal //
    /*
    const petal = container.append("path")
      .attr("d", petalPaths[0])
      .attr("fill", "pink")
      .attr("stroke", "plum")
      .attr("stroke-width", 4)
    */

    // Whole flower //
    // number of petals we want 
    const numPetals = 10

    const flower5 = container5.selectAll("path")
      .data(d3.range(10))
      .join("path")
      .attr("d", petalPaths[2])
      .attr("transform", (d, i) => `rotate(${i * (360 / 10)})scale(${2})`)
      .attr("fill", "white")
      .attr("fill-opacity", 0.5)
      .attr("stroke", "white")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 4)

    const flower6 = container6.selectAll("path")
      .data(d3.range(6))
      .join("path")
      .attr("d", petalPaths[2])
      .attr("transform", (d, i) => `rotate(${i * (360 / 6)})scale(${1.3})`)
      .attr("fill", "white")
      .attr("fill-opacity", 0.5)
      .attr("stroke", "white")
      .attr("stroke-width", 4)

    const flower7 = container7.selectAll("path")
      .data(d3.range(numPetals))
      .join("path")
      .attr("d", petalPaths[2])
      .attr("transform", (d, i) => `rotate(${i * (360 / numPetals)})scale(${2})`)
      .attr("fill", fillColours[4])
      .attr("fill-opacity", 0.5)
      .attr("stroke", fillColours[4])
      .attr("stroke-width", 4)

    const flower1 = container1.selectAll("path")
      .data(d3.range(numPetals))
      .join("path")
      .attr("d", petalPaths[3])
      .attr("transform", (d, i) => `rotate(${i * (360 / numPetals)})scale(${2})`)
      .attr("fill", fillColours[3])
      .attr("fill-opacity", 0.5)
      .attr("stroke", fillColours[3])
      .attr("stroke-width", 4)

    const flower2 = container2.selectAll("path")
      .data(d3.range(numPetals))
      .join("path")
      .attr("d", petalPaths[3])
      .attr("transform", (d, i) => `rotate(${i * (360 / numPetals)})scale(${2})`)
      .attr("fill", fillColours[2])
      .attr("fill-opacity", 0.5)
      .attr("stroke", fillColours[2])
      .attr("stroke-width", 4)

    const flower3 = container3.selectAll("path")
      .data(d3.range(numPetals))
      .join("path")
      .attr("d", petalPaths[3])
      .attr("transform", (d, i) => `rotate(${i * (360 / numPetals)})scale(${2})`)
      .attr("fill", fillColours[4])
      .attr("fill-opacity", 0.5)
      .attr("stroke", fillColours[4])
      .attr("stroke-width", 4)

    const flower4 = container4.selectAll("path")
      .data(d3.range(numPetals))
      .join("path")
      .attr("d", petalPaths[3])
      .attr("transform", (d, i) => `rotate(${i * (360 / numPetals)})scale(${2})`)
      .attr("fill", fillColours[1])
      .attr("fill-opacity", 0.5)
      .attr("stroke", fillColours[1])
      .attr("stroke-width", 4)


    // for a circle-based 'flower
    /*
    const cicleShape = container.selectAll("path")
      .data(d3.range(numPetals))
      .join("path")
      .attr("d", "M 0,0 a 25,25 0 1,1 50,0a 25,25 0 1,1 -50,0")
      .attr("transform", (d, i) => `rotate(${i * (360 / numPetals)})scale(${4})`)
        .attr("fill", "pink")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "plum")
        .attr("stroke-width", 1)
    */

    // use a transform scale to scale the whole element 
    // define scaleLinear with scale of [0,1] or [0.25, 0.75]

  }, []);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container27">
      <h1>Day 27</h1>
      <h2>Random Flowers</h2>
      <h3>10th Dec  2020</h3>
      <button
        className="graph-explain-icon"
        onClick={toggleGraphExplanation}
      >
        <FontAwesomeIcon icon={faBookOpen} size="md" />
        <span className="info-span">info</span>
      </button>
      {
        revealGraphExplanation
          ? <GraphExplain />
          : null
      }

      <div className="wrapper wrapper27">
        <svg ref={svgRef}>
        </svg>
      </div>

    </div>
  )
};

export { Petals }