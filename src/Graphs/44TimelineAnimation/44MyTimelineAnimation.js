// Code based on https://bl.ocks.org/mbostock/6452972 and 
// https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763 


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import "./44TimelineAnimation.css";
import dataLoad from "./data/word_of_the_year_usa.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'


const GraphExplain = () => {
  return (
    <>
      <p style={{marginTop: '1%'}}>Data source: <a href="https://www.americandialect.org/woty" target="_blank">American Dialect Society </a></p>
    </>
  )
}

const MyTimelineAnimation = () => {

  /// refs ///
  const svgRef = useRef();
  const playButtonRef = useRef();
  const sliderRef = useRef();
  const plotRef = useRef();
  const graphRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  // whether the timeline is moving 
  const [moving, setMoving] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const margin = {top:70, right:50, bottom:0, left:50};
  const width = 950 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  // set the time it takes to go through the animation once 
  const timeToAnimate = 1000;

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => 
      setData(d))
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

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
        .colors(data.map(d => d.year).length)



      /////////////////////
      /////// Graph ///////
      /////////////////////

      const graphG = d3.select(graphRef.current)

      /////////////////////
      /////// Slider //////
      /////////////////////

      // Scale for the slider 
      const xScale = d3.scalePoint()
        .domain(data.map(d => d.year))
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
          .attr("transform", `translate(${0}, ${25})`)
        .selectAll("text")
        .data(xScale.domain())
        .join("text")
          .attr("x", xScale)
          .attr("text-anchor", "middle")
          .attr("fill", "#fffcf2")
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
        const [filteredData] = _.filter(data, d => d.year == selectedElement)
        //svg.style("background-color", scaleColour[_.indexOf(data, filteredData)]);
        graphG.style("background", scaleColour[_.indexOf(data, filteredData)])

        // find the word correponding to the selectedElement 
        const currentWord = _.find(data, word => word.year == selectedElement)
        setSelectedWord(currentWord)
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
      
      // Define what happens when we hit play 
      function step() {
        // 1. perform the update, i.e. moving the slider handle and changing the colour of the background
        update(xScale.invert(currentValue));
        // 2. stop moving if the the current value exceeds the width of the slider container
        currentValue = currentValue + sizeOfStep;
        if (currentValue >= targetValue + sizeOfStep) {
          setMoving(false);
          clearInterval(timer)
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
            setMoving(true)
            timer = setInterval(step, timeToAnimate);
            button.text("Pause");
          }
        })

 
    } 
  }, [data])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }
  
  return (
    <div className="page-container page-container-44">
      <h1>Day 44</h1>
      <h2>Word of the Year (USA)</h2>
      <h3>10th Jan 2021</h3>
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

      <div className="wrapper wrapper-44">
        <button id="play-button" ref={playButtonRef}>Play</button>
        <svg ref={svgRef} 
          width={width + margin.left + margin.right} 
          height={height + margin.top + margin.bottom}
        >
            <g ref={sliderRef}></g>
            <g ref={plotRef}></g>
        </svg>
        <div className="graph-container-44" ref={graphRef}>
          {
            selectedWord
            ? <>
              <h1 className="graph-container-44-word">{selectedWord.word}</h1>
              {
                selectedWord.description !== "missing"
                ? <p className="graph-container-44-description">{selectedWord.description}</p>
                : null
              }
              
            </>
            : <h1 className="graph-container-44-word">Word</h1>
          }
          
        </div>
      </div>

    </div>
  )
};

export { MyTimelineAnimation }