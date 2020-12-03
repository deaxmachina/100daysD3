import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { TimelineLite, Back } from "gsap/all";

import "./Waffle.css";

const Waffle = () => {
  const chartRef = useRef();
  const [animation, setAnimation] = useState(null);

  const data = [{
    "year": 2015,
    "tour": "The Red Bullet",
    "venue": "Rosemont theatre",
    "capacity": 4400,
    "boxes": 18
  },
  {
    "year": 2017,
    "tour": "Wings",
    "venue": "Allstate arena",
    "capacity": 18500,
    "boxes": 74
  },
  {
    "year": 2018,
    "tour": "Love Yourself",
    "venue": "United center",
    "capacity": 23500,
    "boxes": 94
  },
  {
    "year": 2019,
    "tour": "Love Yourself - Speak Yourself",
    "venue": "Soldier Field",
    "capacity": 61500,
    "boxes": 246
  }
  ];

  useEffect(() => {
    // SCALES //
    //  map years to colours 
    const colors = ["#FF8E79", "#FF6B5B", "#FF4941", "#DB1D25"];
    const scaleColor = d3.scaleOrdinal()
      .domain(data.map(d => d.year))
      .range(colors);


    // FORMAT DATA //
    // create one data element for each box in the boxes cat 
    const uncount = (data, accessor) =>
      data.reduce((arr, item) => {
        const count = accessor(item)
        for (let i = 0; i < count; i++) {
          arr.push({
            ...item
          })
        }
        return arr
      }, []);

    const boxes = uncount(data, d => d.boxes);

    const nest = d3
      .group(boxes, d => d.venue)


    // GRAPH //

    /* Within the chart div, create one div with class container 
     for each element in the nest array - i.e. 4 elements 
     these are the divs that hold the group data */
    const graph = d3.select(".chart");
    const group = graph
      .selectAll(".container")
      .data(nest)
      .join("div")
      .attr("class", "container")

    // the little div boxes inside the 4 big boxes
    group
      .selectAll(".box")
      //.data(d => d.values) // v5 code 
      .data(d => d[1])
      .join("div")
      .attr("class", "box")
      .style("background-color", d => scaleColor(d.year))
      .on("click", function (e, datum, roots) {
        console.log({ e, datum, roots })
      })


    // LEGEND //
    const legendContainer = graph
      .append("div")
      .attr("class", "legend-container")

    const legendBoxes = legendContainer
      .selectAll(".legend")
      .data([
        { "name": "one", "year": 2015 },
        { "name": "two", "year": 2017 },
        { "name": "three", "year": 2018 },
        { "name": "four", "year": 2019 }
      ])
      .join("div")
      .attr("class", "legend")
      .style("background-color", d => scaleColor(d.year))

    legendBoxes
      .selectAll(".legend-text")
      .data(d => [d.name])
      .join("p")
      .attr("class", "legend-text")
      .text(d => d + d + d)

    // ANIMATION //
    //intitiate paused animation
    let anim = new TimelineLite({ paused: true });
    anim.staggerTo(".box", 1, {
      scale: 1,
      ease: Back.easeOut,
      stagger: {
        grid: "auto",
        from: "start",
        axis: "y",
        each: 0.08
      }
    });
    setAnimation(anim)

  }, [])

  // Button events for triggering the animation
  const playAnimation = (e) => {
    e.preventDefault();
    if (!animation.isActive()) {
      animation.play(0);
    }
  }
  const reverseAnimation = (e) => {
    e.preventDefault();
    animation.reverse();
  }


  return (
    <>
      <div id="root">
        <div ref={chartRef} className="chart"></div>
      </div>
      <button onClick={playAnimation}>Play</button>
        <button onClick={reverseAnimation}>Reverse</button>
    </>
  )
};

export default Waffle;