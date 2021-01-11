import React, { useEffect, useState } from "react";
import "./App.css";
//import DecreasingPanels from "./Components/DecreasingPanels";
import OrderedGraphs from "./Components/OrderedGraphs"
import HeroMobile from "./Components/HeroMobile";


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
    {isDesktop ? <OrderedGraphs /> : <HeroMobile />}
    </>  
  )
}


export default App;