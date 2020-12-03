import React , { useEffect } from "react";

import {MyBarChartVertical} from "../Graphs/1BarChartVertical/1BarChartVertical";
import { MyBarChartHorizontal } from "../Graphs/2BarChartHorizontal/2MyBarChartHorizontal";
import { MyBarChartSortable } from "../Graphs/3BarChartSortable/3MyBarChartSortable"
import { MyBarChartStackedNormalized } from "../Graphs/4BarChartStackedNormalized/4MyBarChartStackedNormalized"
import { MyLineChart } from "../Graphs/5LineChart/5MyLineChart";
import  { MyTwoLineChart } from "../Graphs/7MultiLineChart/7MyTwoLineChart";
import { MyRadialGradient } from "../Graphs/8RadialGradient/8MyRadialGradient";
import { MyStreamGraph } from "../Graphs/9Streamgraph/9MyStreamGraph";
import { MyDivergingBarChart } from "../Graphs/11DivergingBarChart/11MyDivergningBarChart"
import { MyPieChart } from "../Graphs/12PieChart/12MyPieChart";
import { MyGroupedBarChart } from "../Graphs/13GroupedBarChart/13MyGroupedBarChart";
import { MyStackedBarChart } from "../Graphs/14StackedBarChart/14MyStackedBarChart";
import { MyAreaChart } from "../Graphs/15AreaChart/15MyAreaChart"
import { MyScatterPlot } from "../Graphs/17ScatterPlot/17MyScatterPlot";
//import { HeatMap } from "./Graphs/18HeatMap/18HeatMap";
import { MyRadialAreaChart } from "../Graphs/19RadialAreaChart/19MyRadialAreaChart"

import Hero from "./Hero";

const OrderedGraphs = () => {

  return (
    <>
    {/* 
      <MyBarChartVertical />
      <MyBarChartHorizontal />
      <MyBarChartSortable />
    */}
      <MyBarChartStackedNormalized />
      <MyLineChart />
      <MyTwoLineChart />
      <MyRadialGradient />
      <MyStreamGraph />
      <MyDivergingBarChart />
      <MyPieChart />
      <MyGroupedBarChart />
      <MyStackedBarChart />
      <MyAreaChart />
      <MyScatterPlot />
      <MyRadialAreaChart />
    </>
  )
};


export default OrderedGraphs;