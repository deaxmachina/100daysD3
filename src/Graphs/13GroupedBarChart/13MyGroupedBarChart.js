// Code modified from Mike Bostock: https://observablehq.com/@d3/grouped-bar-chart
// Data: https://data.london.gov.uk/dataset/alternative-olympics-2012-medal-table

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./13GroupedBarChart.css";
import dataLoadAbsolute from "./data/ranking-absolute.csv";
import dataLoadPopulation from "./data/ranking-by-population.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';

const GraphExplain = () => {
  return (
    <> 
      <p>Data source: <a href="https://data.london.gov.uk/dataset/alternative-olympics-2012-medal-table" target="_blank">London gov data</a> (https://data.london.gov.uk/dataset/alternative-olympics-2012-medal-table)</p>
      <p className="disclaimer"></p>
    </>
  )
}

const MyGroupedBarChart = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const legendRef = useRef();
  const gRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [dataAbsolute,  setDataAbsolute] = useState(null);
  const [dataPopulation, setDataPopulation] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// dimensions ///
  const width = 850;
  const height = 500;
  const margin = {top: 10, right: 10, bottom: 100, left: 40}

  /// other constants 
  


  /// Data Load ///
  useEffect(() => {
    d3.csv(dataLoadAbsolute, d3.autoType).then(d => {
      const selectedD = d.map(element => _.pick(element, ['Country', "Gold", "Silver", "Bronze"]))   
      setDataAbsolute(selectedD.slice(0,10))
    })
  }, [])
  useEffect(() => {
    d3.csv(dataLoadAbsolute, d3.autoType).then(d => {
      const selectedD = d.map(element => _.pick(element, ['Country', "Gold", "Silver", "Bronze"]))   
      setData(selectedD.slice(0,10))
    })
  }, [])
  useEffect(() => {
    d3.csv(dataLoadPopulation, d3.autoType).then(d => {
      const selectedD = d.map(element => _.pick(element, ['Country', "Gold", "Silver", "Bronze"]))
      setDataPopulation(selectedD.slice(0,10))
    })
  }, [])

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      // columns that we want to use for bars (medal type)
      const keys = ["Gold", "Silver", "Bronze"]
      // what we want to groupby - country 
      const groupKey = "Country"

    /// Scales ///
    // X Scale 0 - for each grouping of bars; one grouping for each country
    // it is a group of containers, one for each bar chart grouping
    // it won't be used to draw actual bars but as a convienient way to measure distance 
    const x0 = d3.scaleBand()
      .domain(data.map(d => d[groupKey])) // list of countries 
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.2)
    // X Scale 0 - for each grouping, create one mini bar chart 
    // whose size is defined by the X scale 0 
    const x1 = d3.scaleBand()
      .domain(keys) // the medal types 
      .rangeRound([0, x0.bandwidth()]) // assume all the groups are equal 
      .padding(0.1)
    // Y Scale 
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))]).nice()
      .rangeRound([height - margin.bottom, margin.top])
    // Colour Scale 
    const color = d3.scaleOrdinal()
      .domain(["Gold", "Silver", "Bronze"])
      .range(["#e9bf35", "#b4b4b4", "#be985e"])

    /// Axes ///
    // X Axis - use the outer x scale x0
    const xAxis = g => g
      .attr("transform", `translate(${0}, ${height - margin.bottom})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("text")
        .style("fill", "black")
        .attr("font-size", "1.1em")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-60)")
      )
    // Y Axis 
    const yAxis = g => g
      .attr("transform", `translate(${margin.left}, ${0})`)
      .call(d3.axisLeft(y).ticks(null, "s")) // change this 
      .call(g => g.select(".domain").remove())

    /// Graph ///
    // Graphing area 
    // importants to append the g into flow directly and don't pick up the svg here 
    const svg = d3.select(gRef.current)

    // create a group for each country; data is one entry per country
    const graphGroups = svg    
      .selectAll("g")
      .data(data)
      .join("g")
      // move each country to its corresponding staring position 
        .attr("transform", d => `translate(${x0(d[groupKey])}, ${0})`)

    // For each group draw a bar chart as usual 
    const t = d3.transition().duration(1000);
    const graph = graphGroups.selectAll("rect")
        .data(d => keys.map(key => ({key: key, value: d[key]})), d => d) // extract entries for given country; key is the type of medal
        .join(
          enter => {
            return enter.append("rect")
              // attr to transition from 
              .attr("x", d => x1(d.key))
              .attr("height", 0)
              .attr("y", height - margin.bottom)
              .attr("width", x1.bandwidth())
              .attr("fill", d => color(d.key))
              .attr("fill-opacity", 1)
          },
          update => update,
        ) // enter + update selection 
        .transition(t)
          .attr("x", d => x1(d.key))
          .attr("height", d => y(0) - y(d.value))
          .attr("y", d => y(d.value))


    /// Legend /// 
    const legendGroups = svg.append("g")
        .attr("transform", `translate(${width}, ${0})`)
      .selectAll("legend-g")
      .data(color.domain().slice())
      .join("g")
        .attr("class", "legend-g")
        .attr("transform", (d, i) => `translate(${0}, ${i * 20})`)

    const legendRects = legendGroups.append("rect")
      .attr("x", -20)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color)

    const legendText = legendGroups.append("text")
      .attr("text-anchor", "end")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("x", -24)
      .attr("y", 9.5)
      .attr("dy", "0.35em")
      .text(d => d)

    // Call the axes 
    d3.select(xAxisRef.current).call(xAxis)
    d3.select(yAxisRef.current).call(yAxis)


    } 
  }, [data])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container13">
      <h1>Day 13: Grouped bar chart</h1>
      <h2>Top 10 Countries by weigthed medal count absolute + by population weights, 2012 London Olympics</h2>
      <h3>21st Nov 2020</h3>

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
      
      <div className="wrapper wrapper13">
        <svg ref={svgRef} height={height} width={width}>
          <g ref={gRef}></g>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
          <g ref={legendRef}></g>
        </svg>
        <button className="btn-select-olympics" onClick={() => setData([...dataAbsolute])}>absolute</button>
        <button className="btn-select-olympics" onClick={() => setData([...dataPopulation])}>population</button>
      </div>
    </div>
  )
};

export { MyGroupedBarChart }

