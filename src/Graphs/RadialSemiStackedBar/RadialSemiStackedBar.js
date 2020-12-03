import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import "./RadialSemiStackedBar.css";

const RadialSemiStackedBar = () => {

  const svgRef = useRef();

  // VARIABLES //
  const width = 1000;
  const height = width;
  const innerRadius = 200;
  const outerRadius = 400;
  //const outerRadius = Math.min(width, height) / 2; 

  // DATA // 
  const myData = d3.csvParse(`Month,Other,Wounds,Disease
      Apr1854,5,0,1
      May1854,9,0,12
      Jun1854,6,0,11
      Jul1854,23,0,359
      Aug1854,30,1,828
      Sep1854,70,81,788
      Oct1854,128,132,503
      Nov1854,106,287,844
      Dec1854,131,114,1725
      Jan1855,324,83,2761
      Feb1855,361,42,2120
      Mar1855,172,32,1205
      Apr1855,57,48,477
      May1855,37,49,508
      Jun1855,31,209,802
      Jul1855,33,134,382
      Aug1855,25,164,483
      Sep1855,20,276,189
      Oct1855,18,53,128
      Nov1855,32,33,178
      Dec1855,28,18,91
      Jan1856,48,2,42
      Feb1856,19,0,24
      Mar1856,35,0,15
      `, (d, _, columns) => {
        let total = 0;
        for (let i = 1; i < columns.length; ++i) total += d[columns[i]] = +d[columns[i]];
        d.total = total;
        return d;
      })

  const [data, setData] = useState(myData)

  useEffect(() => {

    // CANVAS //
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style("font", "10px sans-serif");    
   
    // SCALES //
    const x = d3.scaleBand()
      .domain(data.map(d => d.Month))
      .range([-0.5*Math.PI,  0.5*Math.PI])
      .align(0)

    const y = d3.scaleRadial()
    .domain([0, d3.max(data, d => d.total)])
    .range([innerRadius, outerRadius])

    const z = d3.scaleOrdinal()
    .domain(data.columns.slice(1)) 
    .range(["#FF3700", "#DB004C", "#8CCBFF"])  

    // AXES //
    // X Axis 
    const xAxis = g => g
      .attr("text-anchor", "middle")
      .call(g => g.selectAll("g")
        .data(data)
        .join("g")
          .attr("transform", d => `
            rotate(${((x(d.Month) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
            translate(${innerRadius},0)
          `)
          .call(g => g.append("line")
              .attr("x2", -5)
              .attr("stroke", "#000"))
          .call(g => g.append("text")
              .attr("transform", d => (x(d.Month) + x.bandwidth() / 2 + Math.PI / 2) % (Math.PI) < 0.5*Math.PI
                  ? "rotate(180)translate(30,3)"
                  : "rotate(0)translate(-30,3)")
              .text(d => d.Month)))

    // Y Axis 
    const yAxis = g => g
    .attr("text-anchor", "middle")
    .call(g => g.selectAll("g")
      .data(y.ticks(5).slice(1))
      .join("g")
        .attr("fill", "none")
        .call(g => g.append("path")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.05)
            .attr("d", d3.arc()
              .innerRadius(y)
              .outerRadius(y)
              .startAngle(-0.5*Math.PI)
              .endAngle(0.5*Math.PI) ))

          .call(g => g.append("text")
            .attr("x", d => -y(d))
            .attr("dx", "0.35em")
            .attr("dy", "0.35em")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text(y.tickFormat())
        .clone(true)
            .attr("fill", "#000")
            .attr("stroke", "none"))
        .call(g => g.append("text")
            .attr("x", d => y(d))
            .attr("dx", "0.35em")
            .attr("dy", "-0.35em")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text(y.tickFormat())
        .clone(true)
            .attr("fill", "#000")
            .attr("stroke", "none"))
        )

    // Legend 
    const legend = g => g.append("g")
        .selectAll("g")
        .data(data.columns.slice(1).reverse())
        .join("g")
          .attr("transform", (d, i) => `translate(-20,${(i - (data.columns.length - 1) / 2) * 20-40})`)
          .call(g => g.append("rect")
              .attr("width", 18)
              .attr("height", 18)
              .attr("fill", z))
          .call(g => g.append("text")
              .attr("x", 24)
              .attr("y", 9)
              .attr("dy", "0.35em")
              .text(d => d))

    // GRAPH //
    const arc = d3.arc()
        .innerRadius(d => y(d[0]))
        .outerRadius(d => y(d[1]))
        .startAngle(d => x(d.data.Month))
        .endAngle(d => x(d.data.Month) + x.bandwidth())
        .padRadius(innerRadius)
    
    svg.select(".graph")
        .selectAll("g")
        .data(d3.stack().keys(data.columns.slice(1))(data))
        .join("g")
          .attr("fill", d => z(d.key))
        .selectAll("path")
        .data(d => d)
        .join("path")
          .attr("d", arc);

    svg.select(".x-axis")
      .call(xAxis);
    
    svg.select(".y-axis")
      .call(yAxis);

    svg.select(".legend")
      .call(legend)

  }, [])




  return (
    <div className="container">
      <div className="wrapper">
        <svg 
          ref={svgRef}
          width={width} 
          height={height}
        >
          <g className="graph"></g>
          <g className="x-axis"></g>
          <g className="y-axis"></g>
          <g className="legend"></g>
        </svg>
        </div>
    </div>
  )
};

export default RadialSemiStackedBar;