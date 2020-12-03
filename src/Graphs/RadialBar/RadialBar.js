import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from "lodash"
import dataLoad from './data-2.csv';
//import myData from './data-3.csv';

const RadialBar = () => {

  const svgRef = useRef();
  const [data, setData] = useState(null);

  // Variables
  const width = 1200;
  const height = width;
  const innerRadius = 150;
  const outerRadius = 350

  useEffect(() => {

    d3.csv(dataLoad).then(data => {
      const filteredData = []
      data.forEach(row => {
        row.name = row['State']
        row.value = +row['Under 5 Years']
        const selectedColumns = _.pick(row, ['name', 'value']);
        filteredData.push(selectedColumns)
      })
      setData(filteredData)
    })

  }, [])

  useEffect(() => {
    if (data) {
      // SCALES //

      // X Scale 
      const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, 2 * Math.PI])
        //.align(0)
        .padding(0.1)

      // Y Scale 
      // This scale maintains area proportionality of radial bars
      const y = d3.scaleRadial()
        .domain([0, d3.max(data, d => d.value)]) // for 0 to the max value for any bar 
        .range([innerRadius, outerRadius])

      // Color Scale 
      const z = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.quantize(t =>
          d3.interpolateSpectral(t * 0.8 + 0.1),
          data.length
        ).reverse())


      // GRAPH //
      // Arc //
      const arc = d3.arc()
        .innerRadius(y(0))
        .outerRadius(d => y(d.value))
        .startAngle(d => x(d.name))
        .endAngle(d => x(d.name) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius)

      const svg = d3.select(svgRef.current)
        //.append("svg")
        .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
        .style("width", "90%")
        .style("height", "auto")
        .style("font", "10px sans-serif");


      svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("fill", d => z(d.name))
        .selectAll("path")
        .data(d => [d])
        .join("path")
        .attr("d", arc);


      // AXES //

      // X Axis 

      const xAxis = g => g
        .attr("text-anchor", "middle")
        .call(g => g.selectAll("g")
          .data(data)
          .join("g")
          .attr("transform", d => `
          rotate(${((x(d.name) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
          translate(${innerRadius},0)
        `)
          .call(g => g.append("line")
            .attr("x2", -5)
            .attr("stroke", "#000"))
          .call(g => g.append("text")
            .attr("transform", d => (x(d.name) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
              ? "rotate(90)translate(0,16)"
              : "rotate(-90)translate(0,-9)")
            .text(d => d.name)))

      svg.append("g")
        .call(xAxis);


      const yAxis = g => g
        .attr("text-anchor", "middle")
        .call(g => g.append("text")
          .attr("y", d => -y(y.ticks(3).pop()))
          .attr("dy", "-1em")
          .text("Population"))
        .call(g => g.selectAll("g")
          .data(y.ticks(3).slice(1))
          .join("g")
          .attr("fill", "none")
          .call(g => g.append("circle")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.5)
            .attr("r", y))
          .call(g => g.append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text(y.tickFormat(5, "s"))
            .clone(true)
            .attr("fill", "#000")
            .attr("stroke", "none")))

      svg.append("g")
        .call(yAxis);


    }
  }, [data])


  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  )
};

export default RadialBar;