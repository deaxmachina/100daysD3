// Modified from these two Mike Bostock examples 
// 1. https://observablehq.com/@d3/streamgraph
// 2. https://observablehq.com/@d3/streamgraph-transitions
// Data from the Worldbank: https://datacatalog.worldbank.org/dataset/world-development-indicators 

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./9StreamGraph.css";
import dataLoadContinent from "./data/out_of_school_by_continent.csv";
import dataLoadIncome from "./data/out_of_school_by_income.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <> 
      <p>Data source: <a href="https://datacatalog.worldbank.org/dataset/world-development-indicators" target="_blank">World Bank</a> (https://datacatalog.worldbank.org/dataset/world-development-indicators)</p>
      <p className="disclaimer">* 0 values indicate missing data</p>
    </>
  )
}

const MyStreamGraph = () => {
  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const legendRef = useRef();

  /// states ///
  const [data, setData] = useState(null)
  const [dataByContinent, setDataByContinent] = useState(null);
  const [dataByIncome, setDataByIncome] = useState(null);
  // as we are grouping either by continent or by economic indicator
  const continents = ["Africa", "Europe", "Asia", "North America", "South America", "Oceania"]
  const income = ["High income", "Upper middle income", "Lower middle income", "Low income"]
  const [grouping, setGrouping] = useState(continents)
  const [groupingName, setGroupingName] = useState("continents")
  

  /// Offset options ///
  const optionsOffset = [
    {name: "none", value: d3.stackOffsetNone},
    {name: "expand", value: d3.stackOffsetExpand},
    {name: "silhouette", value: d3.stackOffsetSilhouette},
    {name: "wiggle", value: d3.stackOffsetWiggle},
    {name: "diverging", value: d3.stackOffsetDiverging}
  ];
  const optionsStackOrder = [
    {name: "none", value: d3.stackOrderNone},
    {name: "appearance", value: d3.stackOrderAppearance},
    {name: "ascending", value: d3.stackOrderAscending},
    {name: "descending", value: d3.stackOrderDescending},
    {name: "insideOut", value: d3.stackOrderInsideOut}, 
    {name: "reverse", value: d3.stackOrderReverse}
  ]
  // keep selected option in a state 
  const [optionOffset, setOptionOffset] = useState("none")
  const [optionStackOrder, setOptionStackOrder] = useState("none")
  
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /*
  const coloursContinents = [
    "#370617",
    "#49081f",
    "#542b39",
    "#61414c",
    "#896f78",
    "#d1c7ca"
  ]
  */

  const coloursContinents = [
    "#a1d2ce",
    "#78cad2",
    "#62a8ac",
    "#5497a7",
    "#50858b",
    "#086375"
  ]

  const coloursIncome = [ 
    "#d1c7ca",
    "#896f78",
    "#542b39",
    "#370617",
  ]

  /// Dimensions ///
  const height = 550;
  const width = 850;
  const margin = {top: 20, right: 20, bottom: 30, left: 50}

  /// Data load ///
  // By Continent
  useEffect(() => {
    d3.csv(dataLoadContinent, d3.autoType).then(d => {
      d.forEach(element => {
        element.date = new Date(+element.date, 0, 1) // from string to datetime object
      });
      // Transforming to standard object as it will be hard to set 
      // states for the data afterwards if using the d3.csv format 

      const dUseful = d.map(element => {
        return _.pick(element, ['date'].concat(continents))
      })
      setData(dUseful)
      setDataByContinent(dUseful)
    })
  }, []);

  // By Income Group
  useEffect(() => {
    d3.csv(dataLoadIncome, d3.autoType).then(d => {
      d.forEach(element => {
        element.date = new Date(+element.date, 0, 1) // from string to datetime object
      });
      const dUseful = d.map(element => {
        return _.pick(element, ['date'].concat(income))
      })
      setDataByIncome(dUseful)
    })
  }, []);

  /// D3 code ///
  useEffect(() => {
    if (data && dataByContinent && dataByIncome) {
      console.log(data)
      /// Data transform ///
      const stack = d3.stack()
        // will create an entry for each contininent (or similar) and this then 
        // corresponds to the number of areas on the stacked area graph 
        .keys(grouping)
        .offset(_.find(optionsOffset, { 'name': optionOffset}).value) // selected offset 
        .order(_.find(optionsStackOrder, { 'name': optionStackOrder}).value) // selected stack order     
      const series = stack(data)

      /// Scales ///
      // X Scale - time scale 
      const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date)) // all the dates 
        .range([margin.left, width - margin.right])
      // Y Scale - vertical start and end position for each area 
      const y = d3.scaleLinear()
        .domain([
          d3.min(series, element => d3.min(element, d => d[0])), // the smallest of the lower coord values,
          d3.max(series, element => d3.max(element, d => d[1])) // the largest of the upper coord values 
        ])
        .range([height - margin.bottom, margin.top])
      // Colour scale - discrete with as many numbers as categories 
      let colours = []
      if (groupingName == "continents"){
        colours = coloursContinents
      } else if (groupingName == "income"){
        colours = coloursIncome
      }
      const color = d3.scaleOrdinal()
        .domain(grouping)
        .range(colours)


      /// Axes ///
      // X Axis 
      const xAxis = g => g 
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(10).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text")
          .attr("fill", "#1f2421")
        )
        .call(g => g.selectAll(".tick")
          .attr("color", "#1f2421")
        )
      // Y Axis -- this is meaningless 
      // how to make it work? 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y))

      /// Graph ///
      // Chart area
      const svg = d3.select(gRef.current)
        
      // Area
      const area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveNatural)

      // Graph 
      // one path element for each element in the series 
      // i.e. each area that will get stacked 
      // and its d attribute is area 
      const graph = svg.selectAll("path")
        .data(series)
        .join("path")
          .attr("fill", ({key}) => color(key))
          //.attr("d", area)
          .transition()
          .duration(1000)
          .attr("d", area)


      /// Interaction events ///
      /*
      graph
      .on("mousemove", function(event){
        const pointer = d3.pointer(event, this); 
        //get the original x value of the data point
        const x_original = x.invert(pointer[0]); 
        console.log(x_original)
        // get the original y value of the data point 
        const y_original = y.invert(pointer[1]); 
        console.log(y_original)

        const selectedElement0 = _.find(series, function(element){
          return (element[0][0] < y_original && element[0][1] > y_original);
        })
        graph.attr("fill", d => d === selectedElement0 ? color(d.key) : "grey")
        //graph.attr("opacity", d => d === selectedElement ? 1 : 0.5)
      })
      .on("mouseleave", function(e){
        graph.attr("fill", ({key}) => color(key))
      });
      */

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis);
      //d3.select(yAxisRef.current).call(yAxis);

      /// Legend ///
      const legend = d3.select(legendRef.current)
        .attr("transform", `translate(${width - margin.right - 140}, ${3})`)
      const legendRects = legend 
        .selectAll("rect")
        .data(grouping)
        .join("rect")
        .attr("x", (d, i) => d%2 == 0? 0 : 20)
        .attr("y", (d, i) => i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => color(d))
      const legendText = legend
        .selectAll("text")
        .data(grouping)
        .join("text")
        .text((d, i) => d)
        .attr("x", (d, i) => 40)
        .attr("y", (d, i) => i * 21)
        .attr("dy", "0.5em")
        .attr("text-anchor", "center")
        .attr("font-size", 12)
        .attr("fill", "#1f2421")


    } else {
      console.log("Missing data")
    }
  }, [data, dataByContinent, dataByIncome, optionOffset, optionStackOrder, grouping, groupingName])

  // function to select the stack order  
  const selectStackOrder = (e) => {
    const selectedOption = e.target.value;
    setOptionStackOrder(selectedOption)
  }
  // function to select the offset 
  const selectOffset = (e) => {
    const selectedOption = e.target.value;
    setOptionOffset(selectedOption)
  }

  // functios to select grouping 
  // either by income or by continent
  const setContinent = () => {
    setGroupingName("continents")
    setGrouping(continents)
    setData(dataByContinent)
  };

  const setIncome = () => {
    setGroupingName("income")
    setGrouping(income)
    setData(dataByIncome)
  }

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

 return (
    <div className="page-container page-container9">
      <h1>Day 9&10: Stacked Area Graphs</h1>    
      <h2>Worldwide adolescents out of school (% of lower secondary school age)</h2>
      <h3>17th-18th Nov 2020</h3>

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
      
      <div className="wrapper wrapper9">
        <div className="grouping-selectors9">
          {/* 
          <button onClick={setContinent}>By Continent</button>
          <button onClick={setIncome}>By Income Group</button>
          */}
        </div>

        <div className="dropdown-menu-stack-orders9">
              <select className="select9" id="stack-order-select" onChange={e => selectStackOrder(e)}>
                {
                  optionsStackOrder.map(option => (
                    <option value={option.name}>{option.name}</option>
                  ))
                }
              </select>
          </div>
          <div className="dropdown-menu-offsets9">
              <select className="select9" id="offset-select" onChange={e => selectOffset(e)}>
                {
                  optionsOffset.map(option => (
                    <option value={option.name}>{option.name}</option>
                  ))
                }
              </select>
          </div>
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}></g>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
          <g ref={legendRef}></g>
        </svg>
      </div>
    </div>
  )
};

export { MyStreamGraph }