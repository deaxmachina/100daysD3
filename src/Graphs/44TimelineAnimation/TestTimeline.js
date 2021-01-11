// Code based on https://bl.ocks.org/mbostock/6452972 and 
// https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763 


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import "./44TimelineAnimation.css";
import { faBandAid } from "@fortawesome/free-solid-svg-icons";



// define a finctional list of complaints 
const complaints = [
  "complaint 1",
  "complaint 2",
  "complaint 3",
  "complaint 4",
  "complaint 5",
]
const moves = [1, 2, 3, 4, 5, 6, 7, 8, 9]




const TestTimeline = () => {

  /// refs ///
  const svgRef = useRef();
  const playButtonRef = useRef();
  const sliderRef = useRef();
  const plotRef = useRef();

  /// states ///
  const [data, setData] = useState(complaints);
  // whether the timeline is moving 
  const [moving, setMoving] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  /// constatns ///
  // dimensions 
  const margin = {top:70, right:50, bottom:0, left:50};
  const width = 950 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  // set the time it takes to go through the animation once 
  const timeToAnimate = 2000;


  /// D3 Code ///
  useEffect(() => {
    if (data) {

      console.log(data)

      // Note these can all be states; moving used to be a var and I set it to a state but the same refactoring can be done with the other elements as well 
      //let moving = false;
      let currentValue = 0;
      let targetValue = width;
      var timer 

      const svg = d3.select(svgRef.current)

      // set of colour values for the svg background 
      const colours = ["#90be6d", "#43aa8b", "#f94144", "#f3722c", "#f8961e"]
      const scaleColour = chroma.scale(colours
        .map(color => chroma(color).saturate(0.1)))
        .colors(moves.length+1)



      /////////////////////
      /////// Graph ///////
      /////////////////////

      // Scale for aligning text vertically 
      const scaleYText = d3.scaleBand()
        .domain(complaints)
        .range([0, height - margin.top - margin.bottom])

      const graphG = d3.select(plotRef.current)
        .attr("transform", `translate(${margin.left}, ${margin.top * 2})`)

      const graphRect = graphG
        .selectAll(".graph-rect-44")
        .data([0])
        .join("rect")
        .classed("graph-rect-44", true)
          .attr("width", 400)
          .attr("height", 500)
          .attr("fill", "white")

      // groups for the text 
      const complaintsTextG = graphG
        .selectAll(".complaints-text-g")
        .data(complaints)
        .join("g")
        .classed("complaints-text-g", true)
          .attr("transform", (d, i)  => `translate(${0}, ${scaleYText(d) + scaleYText.bandwidth() / 2 })`)

      // text with the complaints 
      const complaintsText = complaintsTextG
        .append("text")
        .text(d => d)
        .attr("dy", "0.35em")
        .attr("x", 100)

      // checkbox next to the text 
      const complaintsCheckbox = complaintsTextG
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "maroon")
        .attr("fill-opacity", 0)
        .attr("y", "-0.5em")
        .attr("x", 30)
        .attr("stroke", "maroon")
        .attr("stroke-width", 2)

      /////////////////////
      /////// Slider //////
      /////////////////////

      // Scale for the slider 
      const xScale = d3.scalePoint()
        .domain(moves)
        .range([0, width])

      // define invert function for the scale as point scale and band scale don't 
      // have one built-in
      xScale.invert = (function(){
        var domain = xScale.domain()
        var range = xScale.range()
        var scale = d3.scaleQuantize().domain(range).range(domain)
        return function(x){
            return scale(x)
          }
      })()


      /////////////////////
      //// Play button ////
      /////////////////////

      // Function which handles the actual changes when the timer is on or when we drag 
      // in this case these are moving the slider handle along and changing the background 
      function update(selectedElement) {
        // move the slider handle to the current position 
        //sliderHandle.attr("cx", xScale(selectedElement));
        // change the colour of the background, based on scale
        graphRect
          .attr("fill", (d, i) => scaleColour[parseInt(selectedElement)]);
        // tick only the first box ect 
        complaintsCheckbox
          .attr("fill-opacity", function(d, i, nodes) {
            const allData = d3.selectAll(nodes).data() // all data for this selection
            console.log(allData)
            let boxesToTick;
            if (i == selectedElement - 1) { return 1 }
            else { return 0 }
          })
      }

      // the step on the point scale is distance between points 
      // we need this to figure out what the allowed positions of the 
      // slider during the play is 
      const sizeOfStep = xScale.step()
      
      // Define what happens when we hit play 
      function step() {
        // 1. perform the update, i.e. moving the slider handle and changing the colour of the background
        update(xScale.invert(currentValue));
        // 2. stop moving if the the current value exceeds the width of the slider container
        currentValue = currentValue + sizeOfStep;
        if (currentValue > targetValue ) {
          setMoving(false);
          // if we reach the end of the line set the button to replay 
          playButton.text("Replay")
        }
      }
 
      // select play button & define the click event on it 
      const playButton = d3.select(playButtonRef.current)
        .on("click", function() {
          // select the current element i.e. the button
          const button = d3.select(this);
          // if the button text is 'pause' clear the timer, set moving to false and then change the button text to play 
          if (button.text() == "Pause") {
            setMoving(false)
            clearInterval(timer);
            button.text("Play");
          // if the button text is 'play' set the timer, set moving to true and then change the button text to pause 
          } else if (button.text() == "Play") {
            setMoving(true)
            timer = setInterval(step, timeToAnimate);
            button.text("Pause");
          } else if (button.text() == "Replay") {
            // setting the currentValue back to 0 moves you back to the start of the slider
            currentValue = 0;
            button.text("Pause");
          }
        })

 
    } else {
      console.log("Missing data")
    }
  }, [data])
  
  return (
    <div className="page-container page-container-44">
      <h1>Day 44</h1>
      <h2>Timeline Animation</h2>
      <h3>10th Jan 2021</h3>

      <div className="wrapper wrapper-44">
        <button id="play-button" ref={playButtonRef}>Play</button>
        <svg ref={svgRef} 
          width={width + margin.left + margin.right} 
          height={height + margin.top + margin.bottom}
        >
            <g ref={sliderRef}></g>
            <g ref={plotRef}></g>
        </svg>
      </div>

    </div>
  )
};

export { TestTimeline }