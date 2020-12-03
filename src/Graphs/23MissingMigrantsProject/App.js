import React, { useState } from 'react';
import { useWorldAtlas } from './Map/useWorldAtlas';
import { useData } from './useData';
import "./styles.css";
import {BubbleMap} from "./Map/BubbleMap";
import {DateHistogram} from "./ScatterPlot/DateHistogram";

const width = 960;
const height = 500;
const dateHistogramSize = 0.2;

const xValue = d => d['Reported Date'];

const Map = () => {
  const worldAtlas = useWorldAtlas();
  const data = useData();
  const [brushExtent, setBrushExtent] = useState();


  if (!worldAtlas || !data) {
    return <pre>Loading...</pre>;
  }

  const filteredData = brushExtent? data.filter(d => {
    const date = xValue(d);
    return date > brushExtent[0] && date < brushExtent[1]
  }) : data;
  
  return (
    <svg width={width} height={height}>
      <BubbleMap data={filteredData} worldAtlas={worldAtlas} />
      <g transform={`translate(${0}, ${height - dateHistogramSize * height})`}>
        <DateHistogram 
          data={data} 
          width={width}
          height={dateHistogramSize * height}
          setBrushExtent={setBrushExtent}
          xValue={xValue}
        />
      </g>
    </svg>
  );
};

export { Map }