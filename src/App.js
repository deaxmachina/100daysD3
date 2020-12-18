import React , { useEffect, useState } from "react";
import "./App.css";
import DecreasingPanels from "./Components/DecreasingPanels";
import HeroMobile from "./Components/HeroMobile";
//import { MyInteractions } from "./Graphs/33Interactions/33MyInteractions";


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
    {isDesktop ? <DecreasingPanels /> : <HeroMobile />}
    </>  
  )
}


export default App;