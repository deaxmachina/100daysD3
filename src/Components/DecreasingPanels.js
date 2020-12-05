import React , { useEffect } from "react";
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

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
import { MyRadialAreaChart } from "../Graphs/19RadialAreaChart/19MyRadialAreaChart";
import { PieCharts } from "../Graphs/21PieCharts/21MyPieCharts";
import { WorldHeritageSites } from "../Graphs/25WorldHeritageSites/App";

import Hero from "./Hero";

const DecreasingPanels = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".panel").forEach((panel, i) => {
      ScrollTrigger.create({
        trigger: panel,
        start: "top top", 
        pin: true, 
        pinSpacing: false 
      });
    });

    ScrollTrigger.create({
      //snap: 1 / 12 // snap whole page to the closest section!
    });

    gsap.set(".panel", { zIndex: (i, target, targets) => targets.length - i });
  }, [])

  return (
    <>

      <Hero />

      <div id="content">
        <div id="panels">
          <section className="panel">
            <WorldHeritageSites />
          </section>
          <section className="panel">
            <PieCharts />
          </section>
          <section className="panel">
            <MyRadialAreaChart />
          </section>
          <section className="panel">
            <MyScatterPlot />
          </section>
          <section className="panel">
            <MyAreaChart />
          </section>
          <section className="panel">
            <MyStackedBarChart />
          </section>
          <section className="panel">
            <MyGroupedBarChart />
          </section>
          <section className="panel">
            <MyPieChart />
          </section>
          <section className="panel">
            <MyDivergingBarChart />
          </section>
          <section className="panel">
            <MyStreamGraph />
          </section>
          <section className="panel">
            <MyRadialGradient />
          </section>
          <section className="panel">
            <MyTwoLineChart />
          </section>
          <section className="panel">
            <MyLineChart />
          </section>
          <section className="panel">
            <MyBarChartStackedNormalized />
          </section>
          <section className="panel">
            <MyBarChartSortable />
          </section>
          <section className="panel">
            <MyBarChartHorizontal />
          </section>
          <section className="panel">
            <MyBarChartVertical />
          </section>

          <section className="panel">
          </section>
        </div>
      </div>
    </>
  )
};


export default DecreasingPanels;