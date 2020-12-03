// Chart modified from Mike Bostock: https://observablehq.com/@d3/sortable-bar-chart
// Data: https://data.london.gov.uk/dataset/use-of-force

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import _ from "lodash";
//import myDataLoad from "./data/MPS Use of Force - FY20-21.csv";
import myDataLoadProcessed from "./data/useOfForce-borough-counts.csv"
import "./3BarChartSortable.css";
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

const MyBarChartSortable = () => {

  /// Refs to elements for d2 ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();

  /// States ///
  const [data, setData] = useState(null);
  const [sortingOrder, setSortingOrder] = useState("none")
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// Dimensions ///
  const height = 600;
  const width = 850;
  const margin = {top: 60, right: 0, bottom: 150, left: 50};
  const colour = "darkslateblue"

  /*
  // logic to transform the raw data to data we use for this graph 
  // we don't use this here because instead of loading the raw data and 
  // transforming it here, we first transform the data in python and load it 
  // in in its final useful state. This is because the original data file 
  // is too big and therefore it takes to long to load the graph otherwise 
  // the code below is left here for reference. 
  /// Data Load ///
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
      //boroughCountsData.sort((a, b) => d3.descending(a.count, b.count))     
      setData(boroughCountsData)
    });
  }, [])
  */

  useEffect(() => {
    d3.csv(myDataLoadProcessed, d3.autoType).then(d => {
      setData(d)
    })
  }, [])

  /// D3 Code ///
  useEffect(() => {
    if (data) {
      /// Scales ///
      // X Scale 
      const x = d3.scaleBand()
        .domain(data.map(d => d.location))
        .range([margin.left, width - margin.right])
        .padding(0.1)
      // Y Scale 
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)]).nice()
        .range([height - margin.bottom, margin.top])
      // Colour scale options 
      const colourScale = d3.scaleLinear()
          //.domain(d3.extent(data, d => d.count))
          .domain([0, d3.max(data, d => d.count)])
          .range([0, 1])
      const interpolator = d3.interpolateRgb("white", "darkslateblue")
      //const interpolator = d3.interpolateRgb("#f6aa1c", "#621708");

      /// Axes ///
      const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll("text")
          .style("fill", "white")
          .attr("font-size", "1.1em")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-60)")
        )
    
      const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text")
        .style("fill", "white")
        .attr("font-size", "1.0em")
        )

      /// Chart ///
      const svg = d3.select(svgRef.current)
      const g = d3.select(gRef.current)

      const bar = g.selectAll("rect")
        .data(data)
        .join("rect")
        //.attr("fill", colour)
        .attr("fill", d => interpolator(colourScale(d.count)))
        //.style("mix-blend-mode", "multiply")
        .attr("x", d => x(d.location))
        .attr("y", d => y(d.count))
        .attr("height", d => y(0) - y(d.count))
        .attr("width", x.bandwidth())

      const gx = d3.select(xAxisRef.current)
        .call(xAxis);
  
      const gy = d3.select(yAxisRef.current)
        .call(yAxis);
      
      // Trigger the animation along the x-axis of the bar 
      // when the sortingOrder is updated
      const t = svg.transition().duration(750);

      if (sortingOrder == "ascending"){
        x.domain(data.sort((a, b) => a.count - b.count).map(d => d.location));
      } else if (sortingOrder == "descending") {
        x.domain(data.sort((a, b) => b.count - a.count).map(d => d.location));
      } else if (sortingOrder == "alphabetical") {
        x.domain(data.sort((a, b) => a.location.localeCompare(b.location)).map(d => d.location));
      }
      else {
        x.domain(data.map(d => d.location));
      }   
      bar.data(data, d => d.location)
            .order() // seems to work even without this so not sure why necessary 
        .transition(t)
          .delay((d, i) => i * 20)
          .attr("x", d => x(d.location));

      gx.transition(t)
          .call(xAxis)
        .selectAll(".tick")
          .delay((d, i) => i * 20);

    } else {
      console.log("Missing data")
    }
  }, [data, sortingOrder])

  function sortOrder(sortingOrder){
    if (sortingOrder == "ascending"){
      setSortingOrder("ascending")
    } else if (sortingOrder == "descending") {
      setSortingOrder("descending")
    } else if (sortingOrder == "alphabetical") {
      setSortingOrder("alphabetical")
    }
  }

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }


  return (
    <div className="page-container page-container3">
      <h1>Day 3: Sortable bar chart</h1>
      <h2>Use of force by the London Metropolitan Police by borough in 2019 (number of recorded incidents)</h2>
      <h3>11th Nov 2020</h3>

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
      
      <div className="wrapper wrapper3">
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}></g>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>
        <div className="button-group3">
          <button onClick={() => sortOrder("ascending")}>
            ascending
          </button>
          <button onClick={() => sortOrder("descending")}>
            descending
          </button>
          <button onClick={() => sortOrder("alphabetical")}>
            alphabetical
          </button>
        </div>
      </div>
    </div>
  )
};

export { MyBarChartSortable }