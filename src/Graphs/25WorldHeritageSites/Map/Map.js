import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature, mesh } from 'topojson-client';

const projection = d3.geoNaturalEarth1()
  .center([0, 0])
  .scale(200)
  //.translate([1000 / 2, 600 / 2])


const path = d3.geoPath(projection);
const graticule = d3.geoGraticule();

// colours 
const colourLand = "#ede0d4"
const colourBoundaries = "white"
const colourBubbles = "#b5838d";


const BubbleMap = ({worldAtlas: { land, interiors }, data}) => {
  /// refs ///
  const gRef = useRef();

  /// D3 code ///
  useEffect(() => {
      // select the existing group 
      const g = d3.select(gRef.current)

      // append a path for the sphere 
      const sphere = g.append("path")
        .attr("d", path({ type: 'Sphere' }))
        .attr("class", "sphere")
        //.attr("fill", "#fbfbfb")

      // append a path for the graticules 
      const graticules = g.append("path")
        .attr("d", path(graticule()))
        .attr("class", "graticules")
        .attr("fill", "none")
        //.attr("stroke", "#d9dfe0")

      // draw the countries 
      const countriesPaths = g.selectAll("path")
        .data(land.features)
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
        .attr("stroke-opacity", 0.2)

      // Add buddles for each site 
      const bubbles = g.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "bubbles")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", 1.5)
        .attr("fill", colourBubbles)
        .attr("fill-opacity", 0.6)
        .attr("stroke", colourBubbles)
        .attr("stroke-opacity", 1)

  }, [land, interiors, data]);



  return (
    <>
      <g className="marks" ref={gRef}>
      </g>
    </>
  )
}

export { BubbleMap }