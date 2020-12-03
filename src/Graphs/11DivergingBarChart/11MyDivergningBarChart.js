// Code modified from Mike Bostock: https://observablehq.com/@d3/diverging-bar-chart
// Data from https://data.london.gov.uk/dataset/ethnic-group-population-projections

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./11DivergingBarChart.css"
import dataLoad from "./data/ethnic_group_projections.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <> 
      <p>Data source: <a href="https://data.london.gov.uk/dataset/ethnic-group-population-projections" target="_blank">London gov data</a> (https://data.london.gov.uk/dataset/ethnic-group-population-projections)</p>
      <p className="disclaimer">* data copyright: Greater London Authority, 2017</p>
    </>
  )
}

const MyDivergingBarChart = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const barsRef = useRef();
  const barsTextRef = useRef();

  /// states ///
  const [allData, setAllData] = useState(null);
  const [boroughs, setBoroughs] = useState(null);
  const [borough, setBorough] = useState("Hackney");
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// dimensions ///
  const height = 550;
  const width = 850;
  const margin = {top: 30, right: 50, bottom: 20, left: 200};

  /// other constants ///
  const format = d3.format("+,.0%")
  const colourDecrease = "#640D14"
  const colourIncrease = "#274c77"
  const whiteColour = "#f2e9e4"

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad).then(d => {
      // extract all the boroughs 
      const boroughs = _.uniq(_.map(d, "borough"))
      setBoroughs(boroughs)
      // compute difference between 2050 and 2011 data 
      d.forEach(element => {
        element.name = element.ethnic_group;
        element.value0 = +element['2011']
        element.value1 = +element['2050']
        element.value = ((element.value1 - element.value0) / element.value0)
      });
      // sort the values 
      const dSorted = d.sort((a, b) => d3.ascending(a.value, b.value))
      // pick out only the needed data 
      const dUseful = dSorted.map(element => _.pick(element, ["name", "value", "borough"]))
      setAllData(dUseful)
      console.log(_.filter(dUseful, { 'borough': "Brent" }))
    })
  }, [])

  /// D3 code ///
  useEffect(() => {
    if (allData && borough) {
      const data = _.filter(allData, {"borough" : borough})
      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.value)) // change this to allData for consistent scaling 
        .range([margin.left, width - margin.right])
      // Y Scale 
      const y = d3.scaleBand()
        .domain(d3.range(data.length))
        .range([margin.top, height - margin.bottom])
        .padding(0.1)
      
      // Colour scale options 
      const colourScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.value))
        .range([0, 1])
      const interpolator = d3.interpolateRgb("#B76935", "#143642");

      /// Axes ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${margin.top})`)
        .call(d3.axisTop(x).ticks(6).tickFormat(format))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick")
          .attr("color", whiteColour)
        )
      // Y Axis 
      // note that when we move the text based on postion, since this depends on the data 
      // it's important to update both conditions (both values <0 and >= 0) 
      // as we are updating the data; otherwise only one of them will update properly 
      const yAxis = g => g
        .attr("transform", `translate(${x(0)}, ${0})`)
        // display borough on the ticks and remove the tick itself 
        .call(d3.axisLeft(y).tickFormat(i => data[i].name).tickSize(0).tickPadding(7))
        // move the text for the negative values to the left 
        .call(g => g.selectAll(".tick text").filter(i => data[i].value < 0)
          .attr("text-anchor", 'start')
          .attr("x", 7)
        )
        // move the text for the positive values to the right
        .call(g => g.selectAll(".tick text").filter(i => data[i].value >= 0)
          .attr("text-anchor", 'end')
          .attr("x", -7)
        )
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll(".tick")
          .attr("color", whiteColour)
        )

      
      /// Graph ///
      // Graph area 
      const svg = d3.select(svgRef.current)
      // group for the bars 
      const barsG = d3.select(barsRef.current)
      // group for the text on the bars 
      const barsTextG = d3.select(barsTextRef.current)


      // Bars of the bar chart 
      // Importnat //
      // 1. Make sure to add the g element directly in the code and then 
      // refer to it with a useRef; don't append to the svg directly 
      // 2. Need to use enter and update or else the bars will just appear and stay 
      // rather than the desired behaviour of disappearing and being replaced with new 
      // bars upon change -- same applied to the text on the bars
      const bars = barsG
        .selectAll("rect")
        .data(data)
        .join(
          enter => {
            return enter
              .append("rect")     
              //.attr("fill", d => interpolator(colourScale(d.value)))
              .attr("fill", d => d.value < 0? colourDecrease : colourIncrease )
              .attr("stroke", "2b2d42#")
              .attr("stroke-width", 2)
              .attr("stroke-opacity", 0.6)
              // start at x position = value for the negative values 
              // and x position = 0 for the positive values 
              .attr("x", d => x(Math.min(d.value, 0)))
              .attr("y", (d, i) => y(i))
              .attr("width", d => Math.abs(x(d.value) - x(0)))
              .attr("height", y.bandwidth())
          },
          update => {
            update
            .transition()
              .duration(900)
              .attr("fill", d => d.value < 0? "#a31621" : "#053c5e" )
              .attr("x", d => x(Math.min(d.value, 0)))
              .attr("y", (d, i) => y(i))
              .attr("width", d => Math.abs(x(d.value) - x(0)))
          },
        )

      const barText = barsTextG
          .selectAll("text")
          .data(data)
          .join(
            enter => {
              return enter 
                .append("text")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", d => d.value < 0 ? "end" : "start")
                .attr("fill", whiteColour)
                .attr("x", d => x(d.value) + Math.sign(d.value - 0) * 4)
                .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .text(d => format(d.value));
            },
            update => {
              update
                .transition()
                  .duration(900)
                  .attr("text-anchor", d => d.value < 0 ? "end" : "start")
                  .attr("x", d => x(d.value) + Math.sign(d.value - 0) * 4)
                  .text(d => format(d.value));
            }
          )



      /// Call the axes 
      d3.select(xAxisRef.current).call(xAxis);
      d3.select(yAxisRef.current).call(yAxis);

    } else {
      console.log("Missing data")
    }
  }, [allData, borough])

  // to change the borough and thus trigger a chart update 
  const handleBoroughChange = (e) => {
    setBorough(e.target.value)
  }

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container11">
      <h1>Day 11: Diverging bar chart</h1>
      <h2>Ethnic group population projections by 2050, London boroughs</h2>
      <h3>19tn Nov 2020</h3>

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

      <div className="wrapper wrapper11">
        <svg ref={svgRef} width={width} height={height}>
          <g ref={barsRef}></g>
          <g ref={barsTextRef}></g>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>

        <div className="dropdown-menu11">
          <select 
            className="select11"
            id="borough-select" 
            onChange={e => handleBoroughChange(e)}
          >
              <option value="">borough</option>
              {
               boroughs
                ?boroughs.map(boro => (
                  <option value={boro}>{boro}</option>
                ))
                : null
              }
          </select>
        </div>
        <h3 className="selected-borough11">{borough}</h3>
      </div>
    </div>
  )
};

export { MyDivergingBarChart };