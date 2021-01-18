// Code modified from: https://observablehq.com/@d3/line-chart
// Data from https://data.london.gov.uk/dataset/earning-below-llw
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./5LineChart.css";
import dataLoad from "./data/employees-earning-below-llw-borough.csv"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <> 
      <p>Data source: <a href="https://data.london.gov.uk/dataset/earning-below-llw" target="_blank">London gov data</a> (https://data.london.gov.uk/dataset/earning-below-llw)</p>
      <p className="disclaimer">* for a full disclaimer of the data collection methodology and meaning, refer to the data origin source.</p>     
    </>
  )
}


const MyLineChart = () => {
  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  /// states ///
  const [data, setData] = useState(null);
  const [boroughs, setBoroughs] = useState(null)
  const [borough, setBorough] = useState("Camden")
  const [selectedData, setSelectedData] = useState(null)
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// Dimensions ///
  const height = 500;
  const width = 850;
  const lineColour = "maroon";
  const textColour = "white";
  const margin = {top: 20, right: 35, bottom: 20, left: 45}

  /// Data load ///
  // want the data to look like this for each borough, an array 
  // [{date: 2005, value: 111}, {date: 2006, value: 123}, ...]
  // altogether: 
  /* 
  [
    {
      borough: Lambeth,
      values: [...]
    },
    {
      borough: Hackney,
      values: [...]
    }
  ]
  */
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      // store all the regions 
      const areas = _.map(d, "area")
      setBoroughs(areas)
      const dataTransformed = d.map(element => {
        return {
          borough: element['area'],
          attributes: _.range(2005, 2019).map(year => {
            return {date: year, value: +_.replace(element[year], ",", '')}
          })

        }
      });
      setData(dataTransformed)
      const newSelectedData = dataTransformed.find(element => element.borough === borough).attributes;
      setSelectedData(newSelectedData)
    });
  }, []);

  /// D3 code ///
  useEffect(() => {
    if (selectedData){
      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .domain(d3.extent(selectedData, d => d.date))
        .range([margin.left, width - margin.right])
      // Y Axis 
      const y = d3.scaleLinear()
        .domain([0, d3.max(selectedData, d => d.value)])
        .range([height - margin.bottom, margin.top])

      /// Axes ///
      // X Axis 
      const xAxis = g => g 
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("2")).tickSizeOuter(0))
        .call(g => g.selectAll("text")
        .attr("fill", textColour)
        .attr("font-size", "1.2em")
      )
        .call(g => g.selectAll(".tick")
          .attr("color", textColour)
      )
        .call(g => g.select(".domain")
          .attr("color", textColour)
      )
      // Y Axis 
      const yAxis = g =>g 
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
        /* this is buggy
        .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 5)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("number of people")
        )
        */
        .call(g => g.selectAll("text")
          .attr("fill", textColour)
          .attr("font-size", "1.2em")
        )
        .call(g => g.selectAll(".tick")
          .attr("color", textColour)
      )
      
      /// Graph ///
      // Line 
      const line = d3.line(d => x(d.date), d => y(d.value))
        .curve(d3.curveNatural);

      // Path 
      const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)

      // Importnat //
      // 1. Need to set a class to the path as otherwise 
      // there is a clash with other things which are paths when you use selectAll
      // 2. Need to use enter and update or else the lines will just appear and stay 
      // rather than the desired behaviour of disappearing and being replaced with new 
      // line upon change 
      const graph = svg.selectAll(".path")
        .data([selectedData])
        .join(
          enter => {
            return enter
            .append('path')
            .attr("class", "path")
              .attr("fill", "none")
              .attr("stroke", lineColour)
              .attr("stroke-width", 2.5)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("d", line)
          },
          update => {
            update
            .transition()
              .duration(900)
              .attr('d', line)
          },
          //exit => exit
        );


      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)

    } 
  }, [selectedData])

  const handleBoroughChange = (e) => {
    const selectedBorough = e.target.value;
    setBorough(selectedBorough)
    const newSelectedData = data.find(element => element.borough === selectedBorough).attributes;
    setSelectedData(newSelectedData)
  }

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }


  return (
    <div className="page-container page-container5">
      <h1>Day 5&6: Simple line chart</h1>
      <h2>Employees earning below the London Living Wage by borough</h2>
      <h3>13th-14th Nov 2020</h3>

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
     
      <div className="wrapper wrapper5">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>

        <div className="dropdown-menu5">
          <select className="select5"
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

        <h3 className="selected-borough5">{borough}</h3>

      </div>
    </div>
  )
};

export { MyLineChart }