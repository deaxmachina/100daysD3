// Modified from these two Mike Bostock examples 
// 1. https://observablehq.com/@d3/streamgraph
// 2. https://observablehq.com/@d3/streamgraph-transitions

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./9StreamGraph.css";
import dataLoad from "./data/unemployment-2.csv";

const StreamGraph = () => {
  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  /// states ///
  const [data, setData] = useState();

  /// Dimensions ///
  const height = 500;
  const width = 750;
  const margin = {top: 0, right: 20, bottom: 30, left: 50}

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setData(d)
    })
  }, [])

  /// Offset options ///
  const optionsOffset = [
    {name: "expand", value: d3.stackOffsetExpand},
    {name: "none", value: d3.stackOffsetNone},
    {name: "silhouette", value: d3.stackOffsetSilhouette},
    {name: "wiggle", value: d3.stackOffsetWiggle},
    {name: "diverging", value: d3.stackOffsetDiverging}
  ];
  const optionsStackOrder = [
    {name: "appearance", value: d3.stackOrderAppearance},
    {name: "ascending", value: d3.stackOrderAscending},
    {name: "descending", value: d3.stackOrderDescending},
    {name: "insideOut", value: d3.stackOrderInsideOut},
    {name: "none", value: d3.stackOrderNone},
    {name: "reverse", value: d3.stackOrderReverse}
  ]
  // keep selected option in a state 
  const [optionOffset, setOptionOffset] = useState("none")
  const [optionStackOrder, setOptionStackOrder] = useState("none")

  /// D3 code ///
  useEffect(() => {
    if (data){
      console.log(data)
      /// Data transform ///
      const stack = d3.stack()
        // these are all the columns or fields for which we want to have one 
        // area; in this case they are the 14 job categories
        // we remove the first column which is just the date
        .keys(data.columns.slice(1))
        .offset(_.find(optionsOffset, { 'name': optionOffset}).value) // selected offset 
        .order(_.find(optionsStackOrder, { 'name': optionStackOrder}).value) // selected stack order 
      const series = stack(data);

      /// Scales ///
      // X Scale - time scale 
      const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right])
      // Y Scale - start position and end position vertically for each point 
      const y = d3.scaleLinear()
        .domain(
          [
            d3.min(series, d => d3.min(d, d => d[0])), // the lowest of the low values
            d3.max(series, d => d3.max(d, d => d[1])) // the highest of the high values
          ]
        )
        .range([height - margin.bottom, margin.top]) // reverse
      // Colour Scale 
      const color = d3.scaleOrdinal() // as there is a discrete number of categories
          .domain(data.columns.slice(1)) // the different categories
          .range(d3.schemeCategory10)

      /// Axes ///
      // X Axis 
      const xAxis = g => g 
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(y))

      /// Graph ///
      // Area 
      const area = d3.area()
          .x(d => x(d.data.date)) // x-axis value 
          .y0(d => y(d[0])) // start point of area 
          .y1(d => y(d[1])) // end point of area 
          .curve(d3.curveNatural); // can be used here just like with line 
      // Draw graph using area 
      const svg = d3.select(gRef.current)
      // one path element for each element in the series 
      // i.e. each area that will get stacked 
      // and its d attribute is area 
      const graph = svg.selectAll("path")
          .data(series)
          .join("path")
            .attr("fill", ({key}) => color(key))
          .transition()
          .delay(200)
          .duration(1500)
            .attr("d", area)
        
       // Call the axis 
       d3.select(xAxisRef.current).call(xAxis);
       d3.select(yAxisRef.current).call(yAxis);

    } else {
      console.log("Missing data")
    }
  }, [data, optionOffset, optionStackOrder])

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

  return (
    <>
      <h1>Day 9</h1>
      <div className="wrapper">
        <div className="dropdown-menu-stack-orders">
            <select id="stack-order-select" onChange={e => selectStackOrder(e)}>
              <option value="">stack order</option>
              {
                optionsStackOrder.map(option => (
                  <option value={option.name}>{option.name}</option>
                ))
              }
            </select>
        </div>
        <div className="dropdown-menu-offsets">
            <select id="offset-select" onChange={e => selectOffset(e)}>
              <option value="">offset</option>
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
        </svg>
      </div>
    </>
  )
};

export { StreamGraph }