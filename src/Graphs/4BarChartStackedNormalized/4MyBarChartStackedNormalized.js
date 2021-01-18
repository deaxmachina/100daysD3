// code from Mike Bostock :https://observablehq.com/@d3/stacked-normalized-horizontal-bar
// data from: https://data.london.gov.uk/dataset/families-with-savings-under-1500

import React, { useState,  useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./4BarChartStackedNormalized.css";
import dataLoad19 from "./data/savingsunder1500_2019.csv"
import dataLoad18 from "./data/savingsunder1500_2018.csv"
import dataLoad17 from "./data/savingsunder1500_2017.csv"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <> 
      <p>Data source: <a href="https://data.london.gov.uk/dataset/families-with-savings-under-1500" target="_blank">London gov data</a> (https://data.london.gov.uk/dataset/families-with-savings-under-1500)</p>
      <p className="disclaimer">* for a full disclaimer of the data collection methodology and meaning, refer to the data origin source.</p>    
    </>
  )
}

const MyBarChartStackedNormalized = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [data19, setData19] = useState(null);
  const [data18, setData18] = useState(null);
  const [data17, setData17] = useState(null);

  const [regions, setRegions] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// Formatting ///
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en");
  const formatPercent = d3.format(".1%");

  /// Dimensions ///
  const width = 850;
  const height = 420;
  const margin = {top: 30, right: 10, bottom: 10, left: 110}
  const colours = {        
    "Savings £0": "#772e25",
    "Savings but under £1500": "#c44536",
    "Savings £1500 or more": "#197278"
  }

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad19, d3.autoType).then(d => {
      // for each entry create col with the total of all the numeric values
      const columns = d.columns.slice(1)
      d.forEach(dataPoint => {
        dataPoint.total = d3.sum(columns, col => dataPoint[col])
      });
      setRegions(d.sort((a, b) => b["Savings £0"] / b.total - a["Savings £0"] / a.total).map(d => d['Region']))
      setData19(d)
      setData(d)
    });
    d3.csv(dataLoad18, d3.autoType).then(d => {
      // for each entry create col with the total of all the numeric values
      const columns = d.columns.slice(1)
      d.forEach(dataPoint => {
        dataPoint.total = d3.sum(columns, col => dataPoint[col])
      });
      setData18(d)
    });
    d3.csv(dataLoad17, d3.autoType).then(d => {
      // for each entry create col with the total of all the numeric values
      const columns = d.columns.slice(1)
      d.forEach(dataPoint => {
        dataPoint.total = d3.sum(columns, col => dataPoint[col])
      });
      setData17(d)
    });
  }, [])


  /// D3 Code ///
  useEffect(() => {
    if (data && regions){
      /// Data transform ///
      // Create 3 arrays - one for each category (in this case level of savings)
      // Each array contains as many elements as the original data (one for each region)
      // Each element in those arrays contains start point, end point, key and the data itself in an object
      const stack = d3.stack()
        .keys(data.columns.slice(1))
        .offset(d3.stackOffsetExpand) // this is to make sure that the bars always reach 100% of the width of the graph
      const series = stack(data)
          .map(d => (d.forEach(v => v.key = d.key), d)) // this just adds the "key" to each col, i.e. the name of the original column

      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .range([margin.left, width - margin.right])
      // Y Scale 
      const y = d3.scaleBand()
        .domain(regions) // the regions, total of 12 
        .range([margin.top, height - margin.bottom])
        .padding(0.05)
      // Colour Scale 
      const colour = d3.scaleOrdinal()
        .domain(series.map(d => d.key)) // each savings band, total of 3
        .range(d3.schemeSpectral[series.length]) // 3 = savings bands

      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${margin.top})`)
        .call(d3.axisTop(x).ticks(width / 100, "%"))
        .call(g => g.selectAll(".domain").remove())
      
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y))
        .call(g => g.selectAll(".domain").remove())

      /// Graph ///
      const svg = d3.select(gRef.current)
        .style("overflow", "visible")
      
      // create one group for each of the 9 categories (i.e. 9 age groups)
      const groups = svg.selectAll("g")
        .data(series)
        .join("g")
        
      // Create the bars and animation
      // Animation happens only on update of the data 
      const t = d3.transition().duration(1000)
      const rects = groups.selectAll("rect")
        .data(d => d) // each d here is 52 elements, one for each state
        .join(enter => {
          return enter.append("rect")
            .attr("x", d => x(d[0]))
            .attr("width", d => x(d[1]) - x(d[0]))
            .attr("y", d => y(d.data['Region']))
            .attr("height", y.bandwidth())
            .attr("fill", d => colours[d.key])
        },
          update => { update.transition(t)
            .attr("x", d => x(d[0]))
            .attr("width", d => x(d[1]) - x(d[0]))
          },
          exit => exit
          )

      // Call the axes 
      const cx = d3.select(xAxisRef.current)
        .call(xAxis)
      const cy = d3.select(yAxisRef.current)
        .call(yAxis)

    } 
  }, [data])

  const changeYear = (year) => {
    if (year === "2019"){
      setData(data19)
    } else if (year === "2018"){
      setData(data18)
    } else if (year === "2017"){
      setData(data17)
    }
  }

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container4">
      <h1>Day 4: Stacked horizontal normalised bar chart</h1>
      <h2>Families with savings under £1500 by region in the UK</h2>
      <h3>12th Nov 2020</h3>

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

      <div className="wrapper wrapper4">
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}></g>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>

        <div className="legend4">
          <div className="legend-colours4">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="legend-text4">
            <p>Savings £0</p>
            <p>Savings but under £1500</p>
            <p>Savings £1500 or more</p>
          </div>

        </div>
        <div className="btn-group4">
          <button onClick={() => changeYear("2019")}>2019</button>
          <button onClick={() => changeYear("2018")}>2018</button>
          <button onClick={() => changeYear("2017")}>2017</button>
        </div>
      </div>
    </div>
  )
};

export { MyBarChartStackedNormalized }