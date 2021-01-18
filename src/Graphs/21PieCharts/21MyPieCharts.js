// Code based on 
// Data from

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import * as chroma from "chroma-js";
import _ from "lodash";
import "./21PieCharts.css";
import dataLoad from "./data/genres_per_decade_dict.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

// manually add the categories for the animes 
const genres_categories = [
  {category: "genres1", genres: ["Romance", "Shoujo", "Josei", "Slice of Life", "School", 'Comedy', "Parody", "Music"]},
  {category: "genres2", genres: ['Drama']},
  {category: "genres3", genres: ['Kids']},
  {category: "genres4", genres: ['Shounen','Action', "Thriller",'Fantasy', 'Adventure', 
  "Supernatural", "Super Power", "Magic", "Demons", "Historical", "Seinen", 
  "Mystery", "Horror", "Sports",  "Game", "Martial Arts",  "Samurai",  
  "Vampire","Cars"]},
  {category: "genres5", genres: ['Sci-Fi', "Mecha", "Space", "Psychological", "Dementia", "Police", "Military"]},
  {category: "genres6", genres: ['Hentai', "Ecchi", "Harem", "Shounen Ai", "Shoujo Ai", "Yaoi", "Yuri"]}
];
// define the start and end colour for each category 

// Colour Scale per category of genres 
const colorScale1 = chroma.scale(["#f14f8a", "#9e0059"]).colors(_.find(genres_categories, { 'category': 'genres1' }).genres.length)
const colorScale2 = chroma.scale(["#9e0059", "#9e0059"]).colors(_.find(genres_categories, { 'category': 'genres2' }).genres.length)
const colorScale3 = chroma.scale(["#21ABC0", "#21ABC0"]).colors(_.find(genres_categories, { 'category': 'genres3' }).genres.length)
const colorScale4 = chroma.scale(["#21ABC0", "#268ECF"]).colors(_.find(genres_categories, { 'category': 'genres4' }).genres.length)
const colorScale5 = chroma.scale(["#4a4e69", "#22223b"]).colors(_.find(genres_categories, { 'category': 'genres5' }).genres.length)
const colorScale6 = chroma.scale(["#f14f8a", "#f14f8a"]).colors(_.find(genres_categories, { 'category': 'genres6' }).genres.length)
const colorScales = {
        "genres1": colorScale1,
        "genres2": colorScale2,
        "genres3": colorScale3,
        "genres4": colorScale4,
        "genres5": colorScale5,
        "genres6": colorScale6
}
      // exmaple use 
      // 1. select the colour scale correspoding to that category 
      // 2. find the index of the genre in the array of genres for that category 
      // 3. thus call the correct scale with the correct number
      //(d, i) => colorScales[d.category][_.find(genres_categories, { 'category': d.category }).genres.indexOf(d.genre)]

      
    


const GraphExplain = () => {
  return (
    <>
      <p>Data source: <a href="https://myanimelist.net/" target="_blank">My Anime List </a> (https://myanimelist.net/)</p>
      <p className="disclaimer">* I distributed the anime genres (total of 43 on My Anime List) into 4 broad categories. 
      These are by no means "accurate" but rather my initial intuition. The idea is to give an overview with colours of how these 
      broad categories have changed over time, rather than focus on a specific genre. It is a quick visualisation that I would love to 
      improve one day when I have more time. 
      </p>
    </>
  )
}

const PieChart = (props) => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();

  /// states ///
  const [data, setData] = useState(null);

  /// constatns ///
  // dimensions 
  /// dimensions ///
  const width = 420;
  const height = 420;
  const innerRadius = 4;
  const outerRadius = 210;
  const margin = {top: 0, bottom: 0, right: 0, left: 0}


  /// Data load ///
  useEffect(() => {
    // filter to genres with more than 1 anime 
    const dataDecade = dataLoad[props.decade]
    const dataDecadeFilter =  _.filter(dataDecade, function(element) { return element.value > 0 });
    setData(dataDecadeFilter)
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      /// Scales ///
      // X Scale - map the genres to bands 
      const x = d3.scaleBand()
        .domain(data.map(d => d.genre))
        .range([0, 2 * Math.PI])
        //.align(0)
        .padding(0)
      // Y Scale - to the max value of that decade 
      // This scale maintains area proportionality of radial bars
      const y = d3.scaleRadial()
        .domain([0, d3.max(data, d => +d.value)])  
        .range([innerRadius, outerRadius])
      // Colour Scale 
      // single colour scale for all the genres 
      const colorScale = chroma.scale(["#3a0ca3", "#f72585"]).mode('lab').colors(43)
      //const colorScale = chroma.scale(['#f72585', '#adc178', '#480ca8', '#3f37c9', '#4cc9f0']).mode('lab').colors(43)
      // use like this 
      //(d, i) => colorScale[i]

      
      /// Axes ///
      // Y Axis - concentric circles 
      const yAxis = g => g
      .attr("text-anchor", "middle")
      .call(g => g.append("text")
        .attr("y", d => -y(y.ticks(2).pop()))
        .attr("dy", "-1em")
        .text("number of anime"))
      .call(g => g.selectAll("g")
        .data(y.ticks(3).slice(1))
        .join("g")
        .attr("transform", `translate(${width/2 + margin.left}, ${height/2 + margin.top})`)
        .attr("fill", "none")
        .call(g => g.append("circle")
          .attr("stroke", "#010B14")
          .attr("stroke-opacity", 0.2)
          .attr("stroke-dasharray", "5,5")
          .attr("r", y))
        .call(g => g.append("text")
          .attr("y", d => y(d))
          .attr("dy", "0.35em")
          .attr("stroke", "#fff")
          .attr("stroke-width", 0)
          .text(y.tickFormat(5))
          .clone(true)
          .attr("fill", "#4a4e69")
          .attr("fill-opacity", 0.5)
          ))

      /// Graph /// 
      // Graph container 
      const svg = d3.select(gRef.current)
        .style("font", "10px sans-serif")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
      // animation for transitioning the radial bars 
      const t = d3.transition().duration(1000);
      // Arc 
      const arc = d3.arc()
        .innerRadius(y(0))
        .outerRadius(d => y(d.value))
        .startAngle(d => x(d.genre))
        // use this to add or remove 'padding' between the radial bars 
        .endAngle(d => x(d.genre) + x.bandwidth()/0.90 -0.6)
        .padRadius(innerRadius)

      // Graph 
      const graph = svg
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", `translate(${width/2 + margin.left}, ${height/2 + margin.top})`)
        //.attr('fill', (d, i) => colorScale[i])
        .attr('fill', (d, i) => colorScales[d.category][_.find(genres_categories, { 'category': d.category }).genres.indexOf(d.genre)])
        .attr("opacity", 0.6)
        .selectAll("path")
          .data(d => [d])
          .join("path")
          .attr("d", arc); 

      // Display text of the corresponding decade 
      const decadeText = svg
        .selectAll("g-decadeText")
        .data(data, d => d)
        .join("g")
        .attr("class", "g-decadeText")
        .attr("transform", `translate(${width/4}, ${height/2.5})`)
        .append("text")
          .attr("class", "decade-text")
          .attr("dy", "0.35em")
          .text(props.decade.concat("s"))

      // call the Y axis 
      d3.select(yAxisRef.current).call(yAxis)


    } 
  }, [data]);


  return (
    <div className="wrapper wrapper21">
        <svg 
          ref={svgRef} 
          width={width} 
          height={height} 
        >
            <g ref={gRef}></g>  
            <g ref={xAxisRef}></g>
            <g ref={yAxisRef}></g>                
          </svg>
      </div>
  )
};

const PieCharts = () => {

  /// refs ///
  const svgRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// Data load ///
  useEffect(() => {
    // filter to genres with more than 1 anime 
    const dataDecade = dataLoad["2010"]
    const dataDecadeFilter =  _.filter(dataDecade, function(element) { return element.value > 0 });
    setData(dataDecadeFilter)
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      // Legend 
      const svg = d3.select(svgRef.current)
        .attr("width", 1000)
        .attr("height", 100)

      const legend = svg
        .append("g")
        .attr("transform", `translate(${50}, ${0})`)

      const legendRects = legend
        .selectAll("rect")
          .data(data)
          .join("rect")
          .attr("width", 17)
          .attr('height', 11)
          .attr("x", (d, i) => 19*i)
          .attr('fill', (d, i) => colorScales[d.category][_.find(genres_categories, { 'category': d.category }).genres.indexOf(d.genre)])
          .attr("opacity", 0.6)

      const legendText = legend
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", (d, i) => `translate(${19*i}, ${20})`)
        .append("text")
          //.attr("x", (d, i) => 16*i)
          .attr("fill", "black")
          .attr('font-size', 9)
          .attr("text-anchor", 'end')
          .attr("transform", function(d, i) {return `rotate(${-60})` })
          .text(d => d.genre)

            
    } 
  }, [data])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container21">
      <h1>Day 21&22</h1>
      <h2>Anime genres by decade</h2>
      <h3>2nd-3rd Dec 2020</h3>
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
      <br/>
      <br/>
      <br/>

      <div className="legend-container21">
        <svg ref={svgRef} ></svg>
      </div>
      

      <div className="grid-wrapper21">
      <PieChart decade="1930"/>
      <PieChart decade="1940"/>
      <PieChart decade="1950"/>

        <PieChart decade="1960"/>
        <PieChart decade="1970"/>
        <PieChart decade="1980"/>
        <PieChart decade="1990"/>
        <PieChart decade="2000"/>
        <PieChart decade="2010"/>
    </div>

    </div>
  )
}

export { PieCharts }