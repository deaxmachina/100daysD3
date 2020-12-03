import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from "lodash"
import "./RadialBarStacked.css";


const RadialBar = () => {

  const svgRef = useRef();

  // DIMENSIONS //
  const width = 1200;
  const height = width;
  const innerRadius = 0;
  const outerRadius = 550

  // DUMMY DATA //
  // Simulating what the data would look like for the 
  // earthquakes project 
  // for all the earthquakes data would be like this 
  const myallData = [
    {
      "earthquake1": {
        "name": "deaths", 
        "value": 500 
      },
      "earthquake2": {
        "name": "deaths", 
        "value": 600 
      },
    },
    {
      "earthquake1": {
        "name": "injuries", 
        "value": 1000 
      },
      "earthquake2": {
        "name": "injuries", 
        "value": 800 
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

  const [data, setData] = useState(mydata);
  const [maxData, setMaxData] = useState(mymaxData);
  const [allData, setAllData] = useState(myallData);

  useEffect(() => {

    // SCALES //

    // X Scale 
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, 2 * Math.PI])
      //.align(0)
      .padding(0.1)

    // Y Scale 
    // This scale maintains area proportionality of radial bars
    const y = d3.scaleRadial()
      .domain([0, 3000]) // use this if you don't want the scale to jump when data changes 
      //.domain([0, d3.max(maxData, d => d.value)]) // for 0 to the max value for any bar 
      .range([innerRadius, outerRadius])

    // Color Scale 
    const z = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(["red", "maroon", "pink"])

    // GRAPH //
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style("width", "90%")
      .style("height", "auto")
      .style("font", "10px sans-serif");
    
    // GRADIENTS AND PATTERNS //
    //Append a defs (for definition) element to SVG
    var defs = svg.append("defs");

    // Linear gradients // 
    //Append a linearGradient element to the defs and give it a unique id

    function getLinearGradient(x1, y1, x2, y2, startColor, endColor, id){
      const linearGradient = defs.append("linearGradient")
        .attr("id", id)
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2);
      //Set the color for the start (0%)
      linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", startColor); 
      //Set the color for the end (100%)
      linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", endColor); 
      return linearGradient
    }

    const linearGradient0 = getLinearGradient("0%", "100%", "100%", "0%", "white", "black", "linear-gradient-0")
    const linearGradient1 = getLinearGradient("0%", "0%", "100%", "100%", "red", "maroon", "linear-gradient-1")
    const linearGradient2 = getLinearGradient("100%", "50%", "10%", "10%", "white", "green", "linear-gradient-2")

    // Striped pattern //
    const pattern = defs
      .append("pattern")
      .attr("id", "green-pattern")
      .attr("height", 0.02)
      .attr("width", 0.03);
    pattern
      .append("rect")
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("fill", "grey");
    pattern
      .append("rect")
      .attr("x", 0)
      .attr("y", 2)
      .attr("height", "2%")
      .attr("width", "10%")
      .attr("fill", "white");


    // Graw the graph // 
    // animation for transitioning the radial bars 
    const t = d3.transition().duration(2000);

    // Arc //
    const arc = d3.arc()
      .innerRadius(y(0))
      .outerRadius(d => y(d.value))
      .startAngle(d => x(d.name))
      .endAngle(d => x(d.name) + x.bandwidth() - 0.9)
      //.padAngle(0.9)
      .padRadius(innerRadius)

    // Graph - this is bound to the dynamic earthquake data 
    const graph = svg.select(".graph")
      .selectAll("g")
      .data(allData)
      //.data(data)
      .join("g")
      .attr("class", "all-cases")
      //.attr("fill", d => z(d.name))
      .style("fill", (d, i) => `url(#linear-gradient-${i})`)
      //.attr("fill", d => z(d['earthquake1'].name))
      .attr("opacity", 1)

    // define this separately just so that we ca n refer to it later 
    const graphDraw = graph
      .selectAll("path")
      .data(d => [d['earthquake2']])
      //.data(d => [d])
      .join("path")
      .transition(t)
      .attr("d", arc);

  
    // segments of constant values for the maxes 
    const maxes = svg.select(".maxes")
      .selectAll("g")
      .data(maxData)
      .join("g")
      //.attr("fill", d => z(d.name))
      .attr('fill', "url('#green-pattern')")
      .attr("opacity", 0.2)
      .selectAll("path")
      .data(d => [d])
      .join("path")
      .transition(t)
      .attr("d", arc); 


    // AXES //

    const yAxis = g => g
      .attr("text-anchor", "middle")
      .call(g => g.append("text")
        .attr("y", d => -y(y.ticks(3).pop()))
        .attr("dy", "-1em")
        .text("Number of People"))
      .call(g => g.selectAll("g")
        .data(y.ticks(3).slice(1))
        .join("g")
        .attr("fill", "none")
        .call(g => g.append("circle")
          .attr("stroke", "maroon")
          .attr("stroke-opacity", 0.2)
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

    svg.append("g")
      .call(yAxis);

    // Legend 
    const legend = g => g.append("g")
      .selectAll("g")
      .data([1, 2, 3])
      .join("g")
      .attr("transform", (d, i) => `translate(-150,${(i - ([1, 2, 3].length - 1) / 2) * 20 - 200})`)
        .call(g => g.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", (d, i) => z[i])) // fix 
        .call(g => g.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text("text"))

    svg.append("g")
        .call(legend);

  }, [data, maxData, allData])

  function buttonClick() {
    const newMaxData = [
      { "name": "deaths", "value": 800 },
      { "name": "injuries", "value": 1500 },
      { "name": "missing", "value": 1000 }
    ]
    setMaxData(newMaxData)
  }


  return (
    <>
    <svg
      ref={svgRef}
      width={width}
      height={height}
    >
      <g className="graph"></g>
      <g className="maxes"></g>
      <g className="x-axis"></g>
      <g className="y-axis"></g>
      <g className="legend"></g>
    </svg>
    <button onClick={buttonClick}>Click me</button>
    </>
  )
};

export default RadialBar;