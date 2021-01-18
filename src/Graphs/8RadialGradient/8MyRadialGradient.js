// Using dummy data, but in my mind I will be using this kind of chart for an 
// earthquakes victims project, hence the naming of the dummy data variables etc. 
// based on Mike Bostock: https://observablehq.com/@d3/radial-stacked-bar-chart
// using gradients tutorial from Nadieh Bremer: https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./RadialGradient.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <> 
      <p>Svg gradients tutorial by <a href="https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient" target="_blank">Nadieh Bremer</a> (https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient)</p>
    </>
  )
}

const MyRadialGradient = () => {
  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  // DUMMY DATA //
  // Simulating what the data would look like for the 
  // earthquakes project 
  // for all the earthquakes data would be like this 
  const myallData = [
    {
      "earthquake1": {
        "name": "deaths", 
        "value": 1000 
      },
      "earthquake2": {
        "name": "deaths", 
        "value": 600 
      },
      "earthquake3": {
        "name": "deaths", 
        "value": 300 
      },
    },
    {
      "earthquake1": {
        "name": "injuries", 
        "value": 1000 
      },
      "earthquake2": {
        "name": "injuries", 
        "value": 400 
      },
      "earthquake3": {
        "name": "injuries", 
        "value": 1600 
      },
    },
    {
      "earthquake1": {
        "name": "missing", 
        "value": 2000 
      },
      "earthquake2": {
        "name": "missing", 
        "value": 1800 
      },
      "earthquake3": {
        "name": "missing", 
        "value": 1000 
      },
    },
  ]

  // for a single earthquake data would be like this 
  const mydata = [
    { "name": "deaths", "value": 500 },
    { "name": "injuries", "value": 1000 },
    { "name": "missing", "value": 2000 }
  ]
  // the max data which is static 
  const mymaxData = [
    { "name": "deaths", "value": 1000 },
    { "name": "injuries", "value": 2000 },
    { "name": "missing", "value": 3000 }
  ]
  /// states ///
  const [data, setData] = useState(mydata);
  const [maxData, setMaxData] = useState(mymaxData);
  const [allData, setAllData] = useState(myallData);
  const [selectedEarthquake, setSelectedEarthquake] = useState("earthquake1")
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// dimensions ///
  const width = 550;
  const height = 500;
  const innerRadius = 0;
  const outerRadius = 250;
  const margin = {top: 10, bottom: 10, right: 10, left: 30}
  const coloursDeaths = ["#355070", "#070A0E"];
  const coloursInjuries = ["#6d597a", "#151118"];
  const coloursMissing = ["#b56576", "1#C0D10"];

  /// D3 code ///
  useEffect(() => {
    if (data){

      /// Scales ///
      // X Scale 
      const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, 2 * Math.PI])
        //.align(0)
        .padding(0.05)
      // Y Scale 
      // This scale maintains area proportionality of radial bars
      const y = d3.scaleRadial()
        .domain([0, 3000]) // use constant if you don't want the scale to jump when data changes 
        .range([innerRadius, outerRadius])
      // Color Scale 
      // As a backup; we will actually use gradients 
      const z = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(["red", "maroon", "pink"])

      /// Axes ///
      const yAxis = g => g
      .attr("text-anchor", "middle")
      .call(g => g.append("text")
        .attr("y", d => -y(y.ticks(3).pop()))
        .attr("dy", "-1em")
        .text("Number of People"))
      .call(g => g.selectAll("g")
        .data(y.ticks(3).slice(1))
        .join("g")
        .attr("transform", `translate(${width/2 + margin.left}, ${height/2 + margin.top})`)
        .attr("fill", "none")
        .call(g => g.append("circle")
          .attr("stroke", "white")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "5,5")
          .attr("r", y))
        .call(g => g.append("text")
          .attr("y", d => -y(d))
          .attr("dy", "0.35em")
          .attr("stroke", "#fff")
          .attr("stroke-width", 5)
          .text(y.tickFormat(5, "s"))
          .clone(true)
          .attr("fill", "#000")
          .attr("stroke", "none")))

      /// Gradients ///
      // Graph container 
      const svg = d3.select(gRef.current)
        .style("font", "10px sans-serif")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
      // Colour gradients 
      //Append a defs (for definition) element to SVG
      var defs = svg.append("defs");
      //Append a linearGradient element to the defs and give it a unique id
      function getLinearGradient(x1, y1, x2, y2, startColor, endColor, id){
        const linearGradient = defs.append("linearGradient")
          .attr("id", id)
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2);
        //Set the color for the start (0%)
        linearGradient.append("stop") //why is this a stop and not a start? 
          .attr("offset", "0%")
          .attr("stop-color", startColor); 
        //Set the color for the end (100%)
        linearGradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", endColor); 
        return linearGradient
      }
      const linearGradient0 = getLinearGradient("0%", "70%", "70%", "0%", coloursDeaths[0], coloursDeaths[1], "linear-gradient-0")
      const linearGradient1 = getLinearGradient("30%", "0%", "70%", "70%", coloursInjuries[0], coloursInjuries[1], "linear-gradient-1")
      const linearGradient2 = getLinearGradient("100%", "50%", "0%", "0%", coloursMissing[0], coloursMissing[1], "linear-gradient-2")
      // Striped pattern //
      const pattern = defs
        .append("pattern")
        .attr("id", "striped-pattern")
        .attr("height", 0.02)
        .attr("width", 0.03);
      pattern
        .append("rect")
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("fill", "black");
      pattern
        .append("rect")
        .attr("x", 0)
        .attr("y", 2)
        .attr("height", "1%")
        .attr("width", "5%")
        .attr("fill", "white");

      // Gaussian blur //
      // the standard deviation defined how blurry it gets 
      const gaussian  = defs
        .append("filter")
        .attr("id", "blur")
        .append("feGaussianBlur")
        .attr("stdDeviation", 3); 

      // Noise //
      const noise = defs
        .append("filter")
        .attr("id", "displacementFilter")
        .append("feTurbulence")
        .attr("baseFrequency", 0.7)
        .attr("numOctaves", 2)
        .attr("type", "turbulence")
        //.attr("type", "fractalNoise")



      /// Graph /// 
      // animation for transitioning the radial bars 
      const t = d3.transition().duration(1000);
      // Arc 
      const arc = d3.arc()
        .innerRadius(y(0))
        .outerRadius(d => y(d.value))
        .startAngle(d => x(d.name))
        .endAngle(d => x(d.name) + x.bandwidth() - 0.9)
        .padRadius(innerRadius)

      // Graph - this is bound to the dynamic earthquake data  
      // dynamic earthquake graph
      const graph = svg.select(".graph")
        .selectAll("g")
        .data(allData)
        .join("g")
        .attr("transform", `translate(${width/2 + margin.left}, ${height/2 + margin.top})`)
        .attr("class", "all-cases")
        .style("fill", (d, i) => `url(#linear-gradient-${i})`)
        .attr("filter", d => "url(#blur)")
        //.attr("filter", d => "url(#displacementFilter)")
        .attr("opacity", 1)

      // segments of constant values for the maxes 
      const maxes = svg.select(".maxes")
        .selectAll("g")
        .data(maxData)
        .join("g")
        .attr("transform", `translate(${width/2 + margin.left}, ${height/2 + margin.top})`)
        .attr('fill', "url('#striped-pattern')")
        .attr("opacity", 0.1)
        .selectAll("path")
        .data(d => [d])
        .join("path")
        .transition(t)
        .attr("d", arc); 

      // define this separately just so that we ca n refer to it later 
      const graphDraw = graph
        .selectAll("path")
        .data(d => [d[selectedEarthquake]])
        .join("path")
        .transition(t)
        .attr("stroke", "white")
        .attr("stroke-dasharray", "1,1")
        .attr("d", arc);

    // call the Y axis 
    d3.select(yAxisRef.current).call(yAxis)



    } 
  }, [data, maxData, allData, selectedEarthquake])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container8">
      <h1>Day 8: Radial Pie with gradients</h1>
      <h3>16th Nov 2020</h3>
      <h2>Synthetic data</h2>  

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
      
      <div className="wrapper wrapper8">
        <button className="radial-gradient-button" onClick={() => setSelectedEarthquake(`earthquake${_.random(1, 3)}`)}>random</button>
        <svg id="chart-wrapper" 
          width={width + margin.left + margin.right} 
          height={height + margin.top + margin.bottom} 
          ref={svgRef}>
          <g id="chart-wrapper-g" ref={gRef}>
              <g className="maxes"></g>
              <g className="graph"></g>         
              <g className="y-axis" ref={yAxisRef}></g>
              <g className="legend"></g>
          </g>
        </svg>
      </div>
    </div>
  )
};

export { MyRadialGradient } 