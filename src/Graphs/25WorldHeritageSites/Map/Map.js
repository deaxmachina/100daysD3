import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature, mesh } from 'topojson-client';


// colours 
const colourLand = "#ede0d4"
const colourBoundaries = "white"
const colourBubbles = "#804D57" //"#b5838d";



const BubbleMap = ({worldAtlas: { land, interiors }, data, width, height, brushExtent}) => {
  /// refs ///
  const gRef = useRef();
  const pathRef1 = useRef();
  const pathRef2 = useRef();

  const projection = d3.geoMercator()
  //.fitSize([width, height], land)
  .scale(160)
  .center([0, 13])


  const path = d3.geoPath(projection);
  const graticule = d3.geoGraticule();


  /// D3 code ///
  useEffect(() => {

    if (!land || !interiors || !data) {
      console.log("np land")
    } else {
      // zoom and pan
      /*
      const zoom = d3.zoom()
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        })
        .scaleExtent([1, 10]);
      */

      // select the existing group 
      const g = d3.select(gRef.current)
        // This is for when you zoom on the background, it will zoom
        //.call(zoom)
        // This is going to be the country group

      // draw the countries 
      const countriesPaths = g.selectAll("path")
        .data(land.features, d => d)
        .join("path")
        .attr("class", "land")
        .attr("d", d => path(d))
        .attr("fill", colourLand)

      // append a path for the interiors 
      const interiorsPath = g.append("path")
        .attr("class", "interiors")
        .attr("d", path(interiors))
        .attr("fill", "none")
        .attr("stroke", "#6d6875")
        .attr("stroke-opacity", 0.1)

      // Add buddles for each site 
      const bubbles = g.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "bubbles")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", 3)
        .attr("fill", colourBubbles)
        .attr("fill-opacity", 0.7)
        .attr("stroke", colourBubbles)
        .attr("stroke-opacity", 1)
    }


  }, [land, interiors, data]);



  return (
    <>
      <g className="marks" ref={gRef}>
        <path ref={pathRef1}></path>
        <path ref={pathRef2}></path>
      </g>
    </>
  )
}

export { BubbleMap }