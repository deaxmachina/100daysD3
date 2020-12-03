import React, { useRef, useEffect } from 'react';
import { 
  scaleLinear, 
  scaleTime, 
  max, 
  timeFormat, 
  extent, 
  bin, 
  timeMonths, 
  sum, 
  brushX,
  select,
} from 'd3';
import * as d3 from "d3";
import { Marks } from './Marks';
import { AxisBottom } from './AxisBottom';
import { AxisLeft } from './AxisLeft';


const margin = { top: 0, right: 30, bottom: 20, left: 50 };
const xAxisLabelOffset = 55;
const yAxisLabelOffset = 30;

const DateHistogram = ({ data, height, width, setBrushExtent, xValue }) => {

  const brushRef = useRef();

  const xAxisLabel = 'Time';

  const yValue = d => d['Total Dead and Missing'];
  const yAxisLabel = 'Total Dead and Missing';

  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const xAxisTickFormat = timeFormat('%m/%d/%Y');

  const xScale = scaleTime()
    .domain(extent(data, xValue))
    .range([0, innerWidth])
    .nice();

  const [start, stop] = xScale.domain() 
  const binnedData = bin()
    .value(xValue)
    .domain(xScale.domain())
    .thresholds(timeMonths(start, stop))(data)
    .map(array => ({
      y: sum(array, yValue),
      x0: array.x0,
      x1: array.x1
    }))

  const yScale = scaleLinear()
    .domain([0, max(binnedData, d => d.y)])
    .range([innerHeight, 0]);


  // event.selection gives [start pixel of brush, end pixel of brush]
  // you can invert these pixel value to find the original values of the 
  // date that they correspond to, in this case the start and end dates 
  // 'brush end' means that we are listening for the two events brush and end 
  useEffect(() => {
      const brush = brushX().extent([[0, 0], [innerWidth, innerHeight]]);
      brush(select(brushRef.current));
      brush.on('brush end', (event) => {
        setBrushExtent(event.selection && event.selection.map(xScale.invert));
      });
    }, [innerWidth, innerHeight]);

  return (
    <>  
    <rect width={width} height={height} fill="white"></rect>
    <g transform={`translate(${margin.left},${margin.top})`}>  
      <AxisBottom
          xScale={xScale}
          innerHeight={innerHeight}
          tickFormat={xAxisTickFormat}
          tickOffset={5}
        />
        <text
          className="axis-label"
          textAnchor="middle"
          transform={`translate(${-yAxisLabelOffset},${innerHeight /
            2}) rotate(-90)`}
        >
          {yAxisLabel}
        </text>
      <AxisLeft yScale={yScale} innerWidth={innerWidth} tickOffset={5} />
        <text
          className="axis-label"
          x={innerWidth / 2}
          y={innerHeight + xAxisLabelOffset}
          textAnchor="middle"
        >
          {xAxisLabel}
      </text>
      <Marks
        binnedData={binnedData}
        xScale={xScale}
        yScale={yScale}
        tooltipFormat={xAxisTickFormat}
        innerHeight={innerHeight}
      />
      <g ref={brushRef} />
    </g>
    </>
  )

}

export { DateHistogram };