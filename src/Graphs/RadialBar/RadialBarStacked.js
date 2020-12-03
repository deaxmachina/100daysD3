import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import "./RadialBarStacked.css";
import myData from './data-2.csv';
//import myData from './data-3.csv';

const RadialBarStacked = () => {

  const svgRef = useRef();
  const wrapperRef = useRef();
  const [data, setData] = useState([]);

  // Variables
  const width = 900;
  const height = width;
  const innerRadius = 150;
  const outerRadius = 350

  useEffect(() => {
    d3.csv(myData).then(d => {
      setData(d)
    })
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      // CHART //

      // SCALES //

      // X Scale 
      const x = d3.scaleBand()
        .domain(data.map(d => d.State))
        .range([0, 2 * Math.PI])
        //.align(0)
        .padding(0.1)

      // Y Scale 
      // This scale maintains area proportionality of radial bars
      const y = d3.scaleRadial()
        .domain([0, d3.max(data, d => d.total)])
        .range([innerRadius, outerRadius])

      // Z Scale 
      const z = d3.scaleOrdinal()
        .domain(data.columns.slice(1, 7))
        .range([
          "#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"
        ])

      // AXES //

      // X Axis 

      const xAxis = g => g
        .attr("text-anchor", "middle")
        .call(g => g.selectAll("g")
          .data(data)
          .join("g")
          .attr("transform", d => `
          rotate(${((x(d.State) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
          translate(${innerRadius},0)
        `)
          .call(g => g.append("line")
            .attr("x2", -5)
            .attr("stroke", "#000"))
          .call(g => g.append("text")
            .attr("transform", d => (x(d.State) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
              ? "rotate(90)translate(0,16)"
              : "rotate(-90)translate(0,-9)")
            .text(d => d.State)))


      // Y Axis 

      const yAxis = g => g
        .attr("text-anchor", "middle")
        .call(g => g.append("text")
          .attr("y", d => -y(y.ticks(5).pop()))
          .attr("dy", "-1em")
          .text("Population"))
        .call(g => g.selectAll("g")
          .data(y.ticks(5).slice(1))
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

            
            console.log(y.domain())
            console.log(y.range())
            console.log(y.ticks())
            console.log(y(80000))

      // LEGEND //
      const legend = g => g.append("g")
        .selectAll("g")
        .data(data.columns.slice(1, 7).reverse())
        .join("g")
        .attr("transform", (d, i) => `translate(-40,${(i - (data.columns.length - 1) / 2) * 20})`)
        .call(g => g.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", z))
        .call(g => g.append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .text(d => d))



      // Arc //
      const arc = d3.arc()
        .innerRadius(d => y(d[0]))
        .outerRadius(d => y(d[1]))
        .startAngle(d => x(d.data.State))
        .endAngle(d => x(d.data.State) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius)

      const svg = d3.select(wrapperRef.current)
        .append("svg")
        .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
        .style("width", "100%")
        .style("height", "auto")
        .style("font", "10px sans-serif");


      svg.append("g")
        .selectAll("g")
        .data(d3.stack().keys(data.columns.slice(1, 7))(data))
        .join("g")
        .attr("fill", d => z(d.key))
        .selectAll("path")
        .data(d => d)
        .join("path")
        .attr("d", arc);

      svg.append("g")
        .call(xAxis);

      svg.append("g")
        .call(yAxis);

      svg.append("g")
        .call(legend);

    }
  }, [data])



  return (
    <div className="container">
      <div className="wrapper" ref={wrapperRef}>
      </div>
    </div>
  )
};

export default RadialBarStacked;