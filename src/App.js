import React , { useEffect, useState } from "react";
import "./App.css";
import DecreasingPanels from "./Components/DecreasingPanels";
import HeroMobile from "./Components/HeroMobile";


const App = () => {

  const [isDesktop, setIsDesktop] = useState(null)
  const updatePredicate = function () {
    setIsDesktop(window.innerWidth > 1100)
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