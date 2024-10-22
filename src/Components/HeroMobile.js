import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faStar } from '@fortawesome/free-solid-svg-icons'
import { faStar } from '@fortawesome/free-regular-svg-icons'

const HeroMobile = () => {
  return (
    <>
      <div className="hero-section">
          <h1 className="hero-heading">
            100 Days of D3 
          </h1>
          <p className="hero-description">
            Follow my journey of learning D3.js with React.js. 
            <FontAwesomeIcon icon={faStar} size="md"/>
          </p>
          <br />
          <br />
          <br />
          <p>Sorry! Currently not optimised for mobile. If you have the chance please view on a device with a larger screen.</p>
          <div class="arrow"></div>
      </div>
    </>
  )
};

export default HeroMobile; 