// Chart from Mike Bostock: https://observablehq.com/@d3/sortable-bar-chart

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import _ from "lodash";
import dataLoad from "./data/alphabet.csv" // you need to import the data this way in react


const BarChartSortable = () => {
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();
  // States for data etc //

  const [data, setData] = useState(null);
  const [dataOriginal, setDataOriginal] = useState(null);
  const [sortingOrder, setSortingOrder] = useState("none")

  // Dimensions //
  const height = 500;
  const width = 600;
  const margin = {top: 30, right: 0, bottom: 30, left: 40}
  const color = "steelblue"

  useEffect(() => {
    // Load in data // 
    d3.csv(dataLoad).then(d => {
      d.forEach(element => {
        element.name = element.letter;
        element.value = +element.frequency
      });
      //d.sort((a, b) => d3.descending(a.value, b.value))
      const usefulData = _.map(d, entry => {
          return _.pick(entry, ['name', 'value'])
        });    
      setData(usefulData)
      setDataOriginal(usefulData)
    });
  }, [])

  useEffect(() => {
    if (data) {
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1)
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
      .range([height - margin.bottom, margin.top])

    const xAxis = d3.select(xAxisRef.current)
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
    
    const yAxis = d3.select(yAxisRef.current)
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())

    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)

    const bar = g.selectAll("rect")
      .data(data) 
      .join("rect")
        .attr("fill", "steelblue")
        .style("mix-blend-mode", "multiply")
        //.attr("y", d => height - margin.bottom)
        //.attr("height", 0)
        .attr("y", d => y(d.value))
        .attr("height", d => y(0) - y(d.value))
        .attr("width", x.bandwidth())
        .attr("x", d => x(d.name))

      // Trigger the animation along the x-axis of the bar 
      // when the sortingOrder is updated
      const t = svg.transition().duration(750);

      if (sortingOrder == "ascending"){
        x.domain(data.sort((a, b) => a.value - b.value).map(d => d.name));
      } else if (sortingOrder == "descending") {
        x.domain(data.sort((a, b) => b.value - a.value).map(d => d.name));
      } else if (sortingOrder == "alphabetical") {
        x.domain(data.sort((a, b) => a.name.localeCompare(b.name)).map(d => d.name));
      }
      else {
        x.domain(data.map(d => d.name));
      }   
      bar.data(data, d => d.name)
            .order() // seems to work even without this so not sure why necessary 
        .transition(t)
          .delay((d, i) => i * 20)
          .attr("x", d => x(d.name));


    }
  }, [data, dataOriginal, sortingOrder])


  function sortOrder(sortingOrder){
    if (sortingOrder == "ascending"){
      setSortingOrder("ascending")
    } else if (sortingOrder == "descending") {
      setSortingOrder("descending")
    } else if (sortingOrder == "alphabetical") {
      setSortingOrder("alphabetical")
    }
  }

  return (
    <>
    <h1>Day 3: Bar Chart with Horizonal Animation</h1>
    <h3>11th November 2020</h3>
    <div>
      <svg ref={svgRef} width={width} height={height}>
        <g ref={gRef}></g>
        <g ref={xAxisRef}></g>
        <g ref={yAxisRef}></g>
      </svg>
    </div>
    <div className="button-group-3">
      <button onClick={() => sortOrder("ascending")}>
        Ascending
      </button>
      <button onClick={() => sortOrder("descending")}>
        Descending
      </button>
      <button onClick={() => sortOrder("alphabetical")}>
        Alphabetical
      </button>
    </div>
      {
        data 
        ? <h1>{data[0]['value']}</h1>
        : null
      }

    </>
  )
}

export {BarChartSortable};