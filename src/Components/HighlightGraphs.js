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
import { MyGroupedBarChart } from "../Graphs/13GroupedBarChart/13MyGroupedBarChart";
import { MyStackedBarChart } from "../Graphs/14StackedBarChart/14MyStackedBarChart";
import { MyAreaChart } from "../Graphs/15AreaChart/15MyAreaChart"
import { MyBrushableHistogram } from "../Graphs/26Histogram/26MyBrushableHistogram";
import { UpdateAnimations } from "../Graphs/31UpdateAnimations/31UpdateAnimats"
import { MyInteractions } from "../Graphs/33Interactions/33MyInteractions";
import { VoronoiTree } from "../Graphs/36VoronoiTree/36MyVoronoiTree";
import { MyTimelineAnimation } from "../Graphs/44TimelineAnimation/44MyTimelineAnimation";


import { WorldHeritageSites } from "../Graphs/25WorldHeritageSites/App";
import { PieCharts } from "../Graphs/21PieCharts/21MyPieCharts";
import { MyForceLayout } from "../Graphs/30ForceLayout/30MyForceLayout";
import { MyScatterPlot } from "../Graphs/17ScatterPlot/17MyScatterPlot";
import { MyPieChart } from "../Graphs/12PieChart/12MyPieChart";
import { Petals } from "../Graphs/27Petals/27Petals";
import { MyRadialAreaChart } from "../Graphs/19RadialAreaChart/19MyRadialAreaChart";



import Hero from "./Hero";

const HighlightGraphs = () => {

  return (
    <>
      <Hero />

      <WorldHeritageSites />
      <PieCharts />
      <MyForceLayout />
      <MyScatterPlot />
      <MyPieChart />
      <Petals />
      <MyRadialAreaChart />
      <MyTimelineAnimation />
      <VoronoiTree />
      <MyInteractions />  
      <MyDivergingBarChart />
      <MyGroupedBarChart />
      <MyLineChart />
      <MyBarChartStackedNormalized />
      <MyBarChartSortable />
      <MyRadialGradient />
      <UpdateAnimations />
      <MyBrushableHistogram /> 
      <MyBarChartHorizontal />    
      <MyStackedBarChart />
      <MyAreaChart />
      <MyTwoLineChart />  
      <MyStreamGraph />
      <MyBarChartVertical /> 
    </>
  )
};


export default HighlightGraphs;