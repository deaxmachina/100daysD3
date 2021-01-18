// Chart from Mike Bostock: https://observablehq.com/@d3/horizontal-bar-chart
// Data: https://data.london.gov.uk/dataset/use-of-force

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
//import myDataLoad from "./data/MPS Use of Force - FY20-21.csv";
import myDataLoadProcessed from "./data/useOfForce-borough-counts.csv"
import "./2BarChartHorizontal.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <> 
      <p>Data source: <a href="https://data.london.gov.uk/dataset/use-of-force" target="_blank">London gov data</a> (https://data.london.gov.uk/dataset/use-of-force)</p>
      <p className="disclaimer">* for a full disclaimer of the data collection methodology and meaning, refer to the data origin source. Chart is not necessarily fully representative, but rather a quick sketch.</p>
    </>
  )
}

const MyBarChartHorizontal = () => {

  const svgRef = useRef();
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// Dimensions ///
  const height = 600;
  const width = 850;
  const colour = "LightSlateGrey";
  const margin = {top: 30, right: 0, bottom: 10, left: 150};

  /*
  // logic to transform the raw data to data we use for this graph 
  // we don't use this here because instead of loading the raw data and 
  // transforming it here, we first transform the data in python and load it 
  // in in its final useful state. This is because the original data file 
  // is too big and therefore it takes to long to load the graph otherwise 
  // the code below is left here for reference. 

  // 1. For each element select the borough 
  // get a long list like this [Hackney, Islington, Hackney, ...]
  // 2. Count unique values and end up with list like this 
  // [{location: Hackney, count: 5K}, {location: Islington, count: 10K}, {}, ...]

  useEffect(() => {
    d3.csv(myDataLoad).then(d => {
      // count unique values by field
      const boroughCounts = _.countBy(d, 'Borough')
      // transform data into required array of obj format
      const boroughCountsData = []
      for (const [borough, count] of Object.entries(boroughCounts)) {
        boroughCountsData.push({
          location: borough,
          count: count
        })
      };
      // sort by descresing number of incidents 
      boroughCountsData.sort((a, b) => d3.descending(a.count, b.count))
      setData(boroughCountsData)

    });
  }, [])
  */

  useEffect(() => {
    d3.csv(myDataLoadProcessed, d3.autoType).then(d => {
      setData(d)
    })
  }, [])


  /// d3 code ///
  useEffect(() => {
    if (data) {
      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([margin.left, width - margin.right])
      // Y Scale
      const y = d3.scaleBand()
        .domain(d3.range(data.length))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1)

      // Colour scale options 
      const colourScale1 = d3.scaleLinear()
        .domain(d3.extent(data, d => d.count))
        .range([0, 1])
      //const colorInterpolator = d3.interpolateRgb("white", "maroon")
      const interpolator = d3.interpolateRgb("#f6aa1c", "#621708");
      //colorInterpolator(colourScale1(d.count))

      const colourScale2 = d3.scaleSequential(d3.interpolateBrBG)
        .domain([
          d3.min(data, d => d.count), 
          d3.max(data, d => d.count)
        ])


      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${margin.top})`)
        .call(d3.axisTop(x).ticks(10))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text")
          .style("fill", "white")
          .attr("font-size", "1.0em")
      )
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y).tickFormat(i => data[i].location).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text")
          .style("fill", "white")
          .attr("font-size", "1.2em")
        )

      /// Graph ///
      const svg = d3.select(svgRef.current)
          .attr("height", height)
          .attr("width", width)
      
      const graph = svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
          .attr("fill", d => interpolator(colourScale1(d.count)))
          //.attr("fill", d => colourScale2(d.count))
          .attr("x", x(0))
          .attr("y", (d, i) => y(i))
          .attr("height", y.bandwidth())
          .attr("width", d => x(d.count) - x(0))

      const countFormat = d3.format(".2s")
      const graphText = svg.append("g")
          .selectAll("text")
          .data(data)
          .join("text")
            .attr("fill", "white")
            .attr("text-anchor", "end")
            .attr("font-family", "sans-serif")
            .attr("font-size", "0.7em")
            .attr("x", d => x(d.count))
            .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
            .attr("dx", -4)
            .attr("dy", "0.35em")
            .text(d => countFormat(d.count))
          .call(text => text.filter(d => x(d.count) - x(0) < 30)
            .attr("dx", +4)
            .attr("fill", "black")
            .attr("text-anchor", "start")
          );

      // Call the axes 
      svg.append("g")
          .call(xAxis);
      svg.append("g")
          .call(yAxis);


    } 
  }, [data])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }


  return (
    <div className="page-container page-container2">
      <h1>Day 2: Simple horizontal bar chart</h1>
      <h2>Use of force by the London Metropolitan Police by borough in 2019 (number of recorded incidents)</h2>

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
      
      <div className="wrapper wrapper2">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
};

export { MyBarChartHorizontal }