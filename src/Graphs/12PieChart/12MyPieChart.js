// Code modified from Mike Bostock : https://observablehq.com/@d3/pie-chart
// Icon from flaticons : https://www.flaticon.com/svg/static/icons/svg/61/61624.svg
// Data from : https://www.meyou-paris.com/en/blog/24-hours-in-the-life-of-a-cat-n29

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./12PieChart.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <> 
      <p>Data source: <a href="https://www.meyou-paris.com/en/blog/24-hours-in-the-life-of-a-cat-n29" target="_blank">Meyou Paris</a> (https://www.meyou-paris.com/en/blog/24-hours-in-the-life-of-a-cat-n29)</p>
      <p className="disclaimer">* just for fun :)</p>
      <p>Icons made by 
          <a href="https://www.flaticon.com/authors/freepik"> Freepik </a> 
          from 
          <a href="https://www.flaticon.com/"> nwww.flaticon.com </a>
      </p>
    </>
  )
}

const MyPieChart = () => {

  /// refs ///
  const svgRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// dimensions ///
  const innerHeight = 480;
  const height = 530;
  const innerWidth = 600;
  const width = 700;
 
  const innerRadius = 90;
  const outerRadius = Math.min(innerHeight, innerWidth)/2 - 10;
  const padAngle = 0.07;
  const conerRadius = 30;

  /// other constants ///
  const colours = [
    "#e574bc",
    "#ef94d5",
    "#eabaf6",
    "#c4c7ff",
    "#96d7ff",
    "#7fdeff"
  ]


  /// Data load ///
  useEffect(() => {
    const dataLoad = [
      {name: "sleep", value: 16},
      {name: "groom", value: 2},
      {name: "explore", value: 2},
      {name: "observe the world", value: 2},
      {name: "play and chase", value: 1},
      {name: "eat", value: 1}
    ];
    setData(dataLoad)
  }, [])

  /// D3 Code ///
  useEffect(() => {
    if (data){

      /// Scales ///
      // Colour Scale 
      const colour = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(colours)

      /// Graph ///
      // 1. Pie 
      // this is what you use on the data 
      const pie = d3.pie()
        .sort(null)
        .value(d => d.value)
      const arcs = pie(data)

      // 2. Arc 
      // this is what you use when drawing the graph
      // it becomes the d attribute of paths
      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .padAngle(padAngle)
        .cornerRadius(conerRadius)

      // 3. Arch Label 
      // find position which corresponds to where we want to place the labels 
      // using the arc we already defined. Here the inner and outer radius 
      // coinside and that's how we find a single position; the 0.8 number 
      // ends up correpsonding to the disance from the center (between 0 and 1)
      // of the pie chart, so 0.8 is close to the edge while 1 is on the edge and 0 at center 
      const radius = Math.min(innerWidth, innerHeight) / 2 * 1.1
      const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius)

      /// Graph ///
      // Graph area 
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
          .append("g")
            .attr("transform", `translate(${width/1.7},${height/2})`)
      
      // Pie chart 
      const pieChart = svg.selectAll("path") 
        .data(arcs)
        .join("path")
        //.attr("stroke", d => "#F8F7FF")
        .attr("stroke", d => colour(d.data.name))
        .attr("stroke-opacity", 0.3)
          .attr("stroke-width", 10)
          .attr("fill", d => colour(d.data.name)) // d.data comes from the arc transformation we did 
          .attr("fill-opacity", 1)
          .attr("d", arc)
        
        // Text on the pie chart 
        const pieChartText = svg.append("g")
          .selectAll("text")
          .data(arcs)
          .join("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
            .call(text => text.append("tspan")
                  .attr("y", "-0.6em")
                  .attr("font-weight", "bold")
                  .attr("fill-opacity", 0.8)
                  .attr("fill", "white")
                  .text(d => d.data.name))
            .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
              .attr("x", 0)
              .attr("y", "0.7em")
              .attr("fill-opacity", 0.6)
              .attr("fill", "white")
              .attr("font-size", "22px")
              .text(d => `${d.data.value}h`))

        /// Cat images /// 
        const imgSvg = svg.append("g");   
        const img = imgSvg.append("svg:image")
              //.attr("xlink:href", "https://www.flaticon.com/svg/static/icons/svg/57/57162.svg")
              .attr("xlink:href", "https://www.flaticon.com/svg/static/icons/svg/61/61624.svg")
              .attr("width", 100)
              .attr("height", 100)
              .attr("x", -50)
              .attr("y", -50)
              .attr("opacity", 0.3)


    } 
  }, [data])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container12">
      <h1>Day 12: Pie Charts</h1>   
      <h2>A day in the life of a cat</h2>
      <h3>20tn Nov 2020</h3>

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
      
      <div className="wrapper wrapper12">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
};

export { MyPieChart }