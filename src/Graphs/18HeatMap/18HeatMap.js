import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./18HeatMap.css";
import dataLoad from "./data/vaccines.json"

const HeatMap = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  /// states ///
  const [data, setData] = useState(null);

  /// constants ///
  // dimensions 
  const height = 16;
  const width = 900;
  const margin = {top: 20, right: 1, bottom: 40, left: 40}

  // formatting
  const f = d3.format(",d");
  const format = d => isNaN(d) ? "N/A cases"
    : d === 0 ? "0 cases"
    : d < 1 ? "<1 case"
    : d < 1.5 ? "1 case"
    : `${f(d)} cases`

  /// Data load ///
  useEffect(() => {
    const names = ["Alaska", "Ala.", "Ark.", "Ariz.", "Calif.", "Colo.", "Conn.", "D.C.", "Del.", "Fla.", "Ga.", "Hawaii", "Iowa", "Idaho", "Ill.", "Ind.", "Kan.", "Ky.", "La.", "Mass.", "Md.", "Maine", "Mich.", "Minn.", "Mo.", "Miss.", "Mont.", "N.C.", "N.D.", "Neb.", "N.H.", "N.J.", "N.M", "Nev.", "N.Y.", "Ohio", "Okla.", "Ore.", "Pa.", "R.I.", "S.C.", "S.D.", "Tenn.", "Texas", "Utah", "Va.", "Vt.", "Wash.", "Wis.", "W.Va.", "Wyo."];
    const values = [];
    const year0 = d3.min(dataLoad[0].data.values.data, d => d[0]);
    const year1 = d3.max(dataLoad[0].data.values.data, d => d[0]);
    const years = d3.range(year0, year1 + 1);
    for (const [year, i, value] of dataLoad[0].data.values.data) {
      if (value == null) continue;
      (values[i] || (values[i] = []))[year - year0] = value;
    };
    const data = {
      values: values,
      names: names,
      years: years,
      year: dataLoad[0].data.chart_options.vaccine_year
    };
    setData(data)
  }, []);

  /// D3 code ///
  useEffect(() => {
    if (data){
      console.log(data)
      const innerHeight = height * data.names.length;
      /// Scales ///
      // X Scale 
      const x = d3.scaleLinear()
        .domain([d3.min(data.years), d3.max(data.years) + 1])
        .rangeRound([margin.left, width - margin.right])
      // Y Scale - think of it as a bar chart 
      const y = d3.scaleBand()
        .domain(data.names) // one band for each name
        .rangeRound([margin.top, margin.top + innerHeight]) // top to bottom
      // Colour scale 
      const color = d3.scaleSequentialSqrt([
        0, d3.max(data.values, d => d3.max(d))
      ], d3.interpolatePuRd)

      /// Axes ///
      // X Axis - top and bottom 
      const xAxis = g => g
        // top axis with the years 
        .call(g => g.append("g")
          .attr("transform", `translate(${0}, ${margin.top})`)
          .call(d3.axisTop(x).ticks(null, "d"))
          .call(g => g.select(".domain").remove())
        )
        // bottom axis for the year of the vaccine 
        // with a long tick like a line through the whole graph
        .call(g => g.append("g")
        .attr("transform", `translate(0,${innerHeight + margin.top + 4})`)
        .call(d3.axisBottom(x)
            .tickValues([data.year])
            .tickFormat(x => x)
            .tickSize(-innerHeight - 10))
        .call(g => g.select(".tick text")
            .clone()
            .attr("dy", "2em")
            .style("font-weight", "bold")
            .text("Measles vaccine introduced"))
        .call(g => g.select(".domain").remove()));

        // Y Axis - simply display the names
        const yAxis = g => g  
          .attr("transform", `translate(${margin.left}, ${0})`)
          .call(d3.axisLeft(y).tickSize(0))
          .call(g => g.select(".domain").remove())

        /// Graph ///
        // Graph area 
        const svg = d3.select(svgRef.current)
          .attr("height", innerHeight + margin.top + margin.bottom)
          .attr("width", width)
          .attr("font-family", "sanf-serif")
          .attr("font-size", 10)
            .append("g");

        // Heat map groups 
        // Create one group for each row i.e 
        // corresponding to each name
        const heatMapGroups = svg.selectAll("g")
          .data(data.values)
          .join("g")
            .attr("transform", (d, i) => `translate(${0}, ${y(data.names[i])})`)
        
        // you don't need the y attributes as that's calculated from the groups translations 
        // the heat map is drawing one row each time 
        const heatMap = heatMapGroups.selectAll("rect")
          .data(d => d)
          .join("rect")
            .attr("x", (d, i) => x(data.years[i]) + 1)
            .attr("width", (d, i) => x(data.years[i] + 1) - x(data.years[i]) - 1)
            //.attr("width", (d, i) => 18)
            .attr("height", y.bandwidth() - 1)
            .attr("fill", d => isNaN(d) ? "#eee" : d === 0 ? "#fff" : color(d))

      // Call the axes 
      d3.select(xAxisRef.current).call(xAxis);
      d3.select(yAxisRef.current).call(yAxis);
        










    } else {
      console.log("Missing data")
    }
  }, [data])


  return (
    <>
      <h1>Day 18: Heat Map</h1>
      <div className="wrapper">
        <svg ref={svgRef}>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </svg>
      </div>
    </>
  )
};

export { HeatMap }