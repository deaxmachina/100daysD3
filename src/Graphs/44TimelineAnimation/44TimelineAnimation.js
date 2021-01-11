// Code based on https://bl.ocks.org/mbostock/6452972 and 
// https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763 


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./44TimelineAnimation.css";
//import dataLoad from "./data/data.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'
import { scaleOrdinal } from "d3";


const formatDateIntoYear = d3.timeFormat("%Y");
const formatDate = d3.timeFormat("%b %Y");
const parseDate = d3.timeParse("%m/%d/%y");

const startDate = new Date("2004-11-01");
const endDate = new Date("2017-04-01");



const TimelineAnimation = () => {

  /// refs ///
  const svgRef = useRef();
  const playButtonRef = useRef();
  const sliderRef = useRef();
  const plotRef = useRef();

  /// states ///
  const [data, setData] = useState([0,1]);
  // whether the timeline is moving 
  const [moving, setMoving] = useState(false);

  /// constatns ///
  // dimensions 
  const margin = {top:50, right:50, bottom:0, left:50};
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  /// Data load ///
  useEffect(() => {
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      // Note these can all be states; moving used to be a var and I set it to a state but the same refactoring can be done with the other elements as well 
      //let moving = false;
      let currentValue = 0;
      let targetValue = width;
      var timer 

      const years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
      const colours = ["white", "red", "maroon", "yellow", "brown", "orange", "green", "blue"]
      const svg = d3.select(svgRef.current)

      // set of colour values for the svg background 
      const scaleColour = d3.scaleOrdinal()
        .domain(years)
        .range(colours)

      /////////////////////
      /////// Slider //////
      /////////////////////

      // Scale for the slider 
      const xScale = d3.scalePoint()
        .domain(years)
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
      
      // Group element to contain the slider 
      const slider = d3.select(sliderRef.current)
        .attr("class", "slider")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

      // Append line to the silder 
      const sliderLine = slider.append("line")
          .attr("class", "track")
          .attr("x1", xScale.range()[0])
          .attr("x2", xScale.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)) })
          .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)) })
          .attr("class", "track-overlay")

      // Circle which is the handle of the slider
      const sliderHandle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 13);

      // Add Text on the slider - not necessary for the selection bit 
      const sliderXAxis = slider.insert("g", ".track-overlay")
          .attr("class", "ticks")
          .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(xScale.domain())
        .join("text")
          .attr("x", xScale)
          .attr("text-anchor", "middle")
          .text(d => d);


      /////////////////////
      /// Slider events ///
      /////////////////////

      // Function which handles the actual changes when the timer is on or when we drag 
      // in this case these are moving the slider handle along and changing the background 
      function update(selectedElement) {
        // move the slider handle to the current position 
        sliderHandle.attr("cx", xScale(selectedElement));
        // change the colour of the background, based on scale
        svg.style("background-color", scaleColour(selectedElement));
      }

      sliderLine
        .call(d3.drag()
        // Don't know what this does but it still works as expected with this 
        // commented out 
        .on("start.interrupt", function() { slider.interrupt() })
        // this is how we get the current position in pixels, by inverting 
        // here event.x is the x position in pixels of the current value and so 
        // xScale.invert(event.x) is the original value 
        .on("start drag", function(event, d) { 
          currentValue = event.x; // important to update this here 
          // call update function with inverted value i.e. the value from the domain
          // corresponding to the pixel value from the drag function
          update(xScale.invert(currentValue)) 
        })
        );

      /////////////////////
      //// Play button ////
      /////////////////////

      // the step on the point scale is distance between points 
      // we need this to figure out what the allowed positions of the 
      // slider during the play is 
      const sizeOfStep = xScale.step()
      // set the time it takes to go through the animation once 
      const timeToAnimate = 1300
      
      // Define what happens when we hit play 
      function step() {
        // 1. perform the update, i.e. moving the slider handle and changing the colour of the background
        update(xScale.invert(currentValue));
        // 2. stop moving if the the current value exceeds the width of the slider container
        currentValue = currentValue + sizeOfStep;
        if (currentValue >= targetValue + sizeOfStep) {
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

export { TimelineAnimation }