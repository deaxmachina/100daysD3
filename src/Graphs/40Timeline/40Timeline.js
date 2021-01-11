// Code based on https://bl.ocks.org/mbostock/6452972 and 
// https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763 


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./40Timeline.css";
//import dataLoad from "./data/data.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'


const formatDateIntoYear = d3.timeFormat("%Y");
const formatDate = d3.timeFormat("%b %Y");
const parseDate = d3.timeParse("%m/%d/%y");

const startDate = new Date("2004-11-01");
const  endDate = new Date("2017-04-01");



const Timeline = () => {

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
      console.log(data)

      // Note these can all be states; moving used to be a var and I set it to a state but the same refactoring can be done with the other elements as well 
      //let moving = false;
      let currentValue = 0;
      let targetValue = width;
      var timer 

      const svg = d3.select(svgRef.current)

      // Scale for the slider 
      const xScale = d3.scaleLinear()
        .domain([0, 180])
        .range([0, width])
        .clamp(true);

      // Group element for the slider
      const slider = d3.select(sliderRef.current)
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");
      
      // Append line to the silder 
      slider.append("line")
        .attr("class", "track")
        .attr("x1", xScale.range()[0])
        .attr("x2", xScale.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)) })
        .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)) })
        .attr("class", "track-overlay")
      .call(d3.drag()
        // Don't know what this does but it still works as expected with this 
        // commented out 
        .on("start.interrupt", function() { slider.interrupt() })
        // this is how we get the current position in pixels, by inverting 
        // here event.x is the x position in pixels of the current value and so 
        // xScale.invert(event.x) is the original value 
        .on("start drag", function(event, d) { 
          currentValue = event.x; // important to update this here 
          update(xScale.invert(currentValue)) 
        })
        );

      // Function which handles the actual changes when the timer is on or when we drag 
      // in this case these are moving the slider handle along and changing the background 
      function update(h) {
          // move the slider handle to the current position 
          handle.attr("cx", xScale(h));
          // change the colour of the background, which is a function of the 
          // x-position i.e. the passed in value h 
          svg.style("background-color", d3.hsl(h, 0.8, 0.8));
        }

      // Add Text on the slider - not necessary for the selection bit 
      slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(xScale.ticks(10))
      .join("text")
        .attr("x", xScale)
        .attr("text-anchor", "middle")
        .text(function(d) { return d + "°"; });
      
      // Circle which is the handle of the slider
      const handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);


      /// Play button ///
      function step() {
          // 1. perform the update, i.e. moving the slider handle and changing the colour of the background
          update(xScale.invert(currentValue));
          // 2. stop moving if the the current value exceeds the width of the slider container
          currentValue = currentValue + 2; // don't know what this does but I think it controls the speed of movement 
          if (currentValue > targetValue) {
            //moving = false;
            setMoving(false);
            //currentValue = 0;
            // if we reach the end of the line set the button to replay 
            playButton.text("Replay");
          }
        }
      const playButton = d3.select(playButtonRef.current)
        .on("click", function() {
          // select the current element i.e. the button
          const button = d3.select(this);
          // if the button text is 'pause' clear the timer, set moving to false and then change the button text to play 
          if (button.text() == "Pause") {
            //moving = false;
            setMoving(false)
            clearInterval(timer);
            button.text("Play");
          // if the button text is 'play' set the timer, set moving to true and then change the button text to pause 
          } else if (button.text() == "Play") {
            //moving = true;
            setMoving(true)
            timer = window.setInterval(step, 100);
            button.text("Pause");
          } else {
            // logic to replay 
          }
        })

    } else {
      console.log("Missing data")
    }
  }, [data]);


  return (
    <div className="page-container page-container-40">
      <h1>Day 40</h1>
      <h2>Slider</h2>
      <h3>6th Jan 2021</h3>

      <div className="wrapper wrapper-40">
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

export { Timeline }