import React, { useEffect, useState } from "react";
import "./App.css";
//import DecreasingPanels from "./Components/DecreasingPanels";
import HighlightGraphs from "./Components/HighlightGraphs";
//import OrderedGraphs from "./Components/OrderedGraphs"
import HeroMobile from "./Components/HeroMobile";
//import { EventsTimeline } from "./Graphs/50EventsTimeline/50EventsTimeline";


const App = () => {

  const [isDesktop, setIsDesktop] = useState(null)
  const updatePredicate = function () {
    setIsDesktop(window.innerWidth > 1000)
  }
  useEffect(() => {
    updatePredicate();
    window.addEventListener("resize", updatePredicate);
  }, [])


  return (
    <>
    {isDesktop ? <HighlightGraphs /> : <HeroMobile />}
    </>  
  )
}


export default App;