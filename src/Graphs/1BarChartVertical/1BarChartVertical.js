// Chart from Mike Bostock: https://observablehq.com/@d3/bar-chart
// Data: https://data.london.gov.uk/dataset/use-of-force


import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import dataLoad from "./data/alphabet.csv" // you need to import the data this way in react
//import myDataLoad from "./data/MPS Use of Force - FY20-21.csv";
import myDataLoadProcessed from "./data/useOfForce-location-counts.csv"

import _ from "lodash";
import "./1BarChartVertical.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <>       
      <p>Data source: <a href="https://data.london.gov.uk/dataset/use-of-force" target="_blank">London gov data</a></p>
      <p className="disclaimer">* for a full disclaimer of the data collection methodology and meaning, refer to the data origin source. Chart is not necessarily fully representative, but rather a quick sketch.</p>
    </>
  )
}


  // Useful: picking out some fields of object using lodash //
  // Example 
  const entryObj = { 'a': 1, 'b': '2', 'c': 3 };
  const entriesList = [entryObj, entryObj, entryObj];
  const pickedEntriesObj = _.pick(entryObj, ["a", "c"]) // {a: 1, c: 3}
  const pickedEntriesList = _.map(entriesList, entry => {
    return _.pick(entry, ["a", "c"])
  }) // [{a: 1, c: 3}, {a: 1, c: 3}, {a: 1, c: 3}]

  // count the number of elements of a given type in an array
  const numberYeses = _.reduce(["yes", "yes", "no", "yes", "no"], function(total, n) {
    if (n == "yes"){
      return total + 1;
    } else {
      return total;
    }  
  }, 0); // 3

  function yesNo(x){
    let count = 0;
    if (x == "Yes"){
    } else if (x =="No"){
    }
  }


const BarChartVertical = () => {

  // Ref for d3 elements //
  const svgRef = useRef();

  // States for data etc //
  const [data, setData] = useState(null);

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
      d.sort((a, b) => d3.descending(a.value, b.value))
      setData(d)
    });
  }, [])

  useEffect(() => {
    if (data) {

      /// SCALES ///
      const x = d3.scaleBand()
        .domain(d3.range(data.length)) // array of elements one for each bar
        .range([margin.left, width - margin.right])
        .padding(0.1)
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top]) // from top to bottom

      /// AXES ///
      // X Axis 
      const xAxis = g => g 
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(i => data[i].name).tickSizeOuter(0))
      // Y Axis 
      const yAxis = g => g  
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(6))
        .call(g => g.select(".domain").remove()) // remove the line of the axis and just leave the ticks
        .call(g => g.append("text")
          .attr("x", -margin.left)
          .attr("y", 20)
          .attr("fill", "black")
          .attr("text-anchor", "start")
          .text("Frequency")
        );
      
      /// GRAPH ///
      const svg = d3.select(svgRef.current)
        //.attr("viewBox", [0, 0, width, height])
        .attr("height", height)
        .attr("width", width)

      const graph = svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
          .attr("class", "bar-chart-rects")
          .attr("y", d => y(d.value))
          .attr("x", (d, i) => x(i))
          .attr("height", d => y(0) - y(d.value))
          .attr("width", x.bandwidth)
          .attr("fill", color)

      // Call the axes 
      svg.append("g")
        .call(xAxis);
      svg.append("g")
        .call(yAxis)


    }
  }, [data])


  return (
    <div className="page-container">
      <h1>Day 1: Simple vertical bar chart</h1>
      <h2>Frequency of English alphabet letters</h2>
      <div className="wrapper">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
};



const MyBarChartVertical = () => {

  // ref for d3
  const svgRef = useRef();

  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);
  // data fields we want to use 

  // Dimensions //
  const height = 580;
  const width = 850;
  const color = 'DarkRed';
  const margin = {top: 30, right: 0, bottom: 200, left: 40};

  const dataFields = [
    "Ambulance",
    "Custody Block",
    "Dwelling",
    "Hospital/A&E (non-mental-health setting)",
    "Licensed Premises",
    "Mental Health Setting",
    "Open ground (e.g. park, car park, field)",
    "Other",
    "Police station (excluding custody block)",
    "Police vehicle with prisoner handling cage",
    "Police vehicle without prisoner handling cage",
    "Public Transport",
    "Retail Premises",
    "Sports or Event Stadia",
    "Street/Highway",
  ]
  /*
  // logic to transform the raw data to data we use for this graph 
  // we don't use this here because instead of loading the raw data and 
  // transforming it here, we first transform the data in python and load it 
  // in in its final useful state. This is because the original data file 
  // is too big and therefore it takes to long to load the graph otherwise 
  // the code below is left here for reference. 
  useEffect(() => {
    // Load in data // 
    d3.csv(myDataLoad).then(d => {
      d.forEach(element => {
        dataFields.forEach(dataField =>  {
          element[dataField] = element["Incident Location: ".concat(dataField)]
        });
      });
      // extract just useful fields 
      const usefulData = _.map(d, entry => {
        return _.pick(entry, dataFields)
      });

      // get number of crimes ("yes") per location (field)
      function extractCounts(field){
        const fieldValues = _.map(usefulData, entry => {
          return entry[field]
        });
        const numberYeses = _.reduce(fieldValues, function(total, n) {
          if (n == "Yes"){
            return total + 1;
          } else {
            return total;
          }  
        }, 0); // 3
        return numberYeses
      };

      // iterate over all the locations (fields) and create an array of the form 
      // [{location: "some place", count: 100}, {}, ..]
      var countsByLocation = [];
        dataFields.forEach(location => {
          countsByLocation.push({
            location: location,
            count: extractCounts(location)
        })
      });
      
      // sort by descresing number of incidents 
      countsByLocation.sort((a, b) => d3.descending(a.count, b.count))
      setData(countsByLocation)
    });
  }, [])
  */

  useEffect(() => {
    d3.csv(myDataLoadProcessed, d3.autoType).then(d => {
      setData(d)
    })
  }, [])
  

  // Graphing logic 
  useEffect(() => {
    if (data){
      /// SCALES ///
      // X Scale 
      const x = d3.scaleBand()
        .domain(d3.range(data.length))
        .range([margin.left, width - margin.right])
        .padding(0.1)
      // Y Scale 
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)]).nice()
        .range([height - margin.bottom, margin.top])

      /// AXES ///
      // X Axis 
      const xAxis = g => g
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(i => 
          data[i].location).tickSizeOuter(0)
          )
        .selectAll("text")	// rotating the text of the axis
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
              return "rotate(-60)" 
          });
      // Y Axis 
      const yAxis = g => g  
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format(".2s")))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
          .attr("x", margin.left)
          .attr("y", 10)
          .attr("fill", "black")
          .attr("text-anchor", "start")
          .text("Number of incidents")
        )

      /// GRAPH ///
      const svg = d3.select(svgRef.current)
        .attr("height", height)
        .attr("width", width)
      
      const graph = svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
          .attr("x", (d, i) => x(i))
          .attr("y", d => y(d.count))
          .attr("height", d => y(0) - y(d.count))
          .attr("width", x.bandwidth)
          .attr("fill", color)

      // Call the axes 
      svg.append("g")
          .call(xAxis)
      svg.append("g")
          .call(yAxis)
    } 
  }, [data])

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container1">
      <h1>Day 1: Simple vertical bar chart</h1>
      <h2>Use of force by London Met Police by incident location in 2019</h2>

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

      <div className="wrapper wrapper1">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export {BarChartVertical, MyBarChartVertical};