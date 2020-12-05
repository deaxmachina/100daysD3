import React from 'react';
import ReactDOM from 'react-dom';
import { useWorldAtlas } from './useWorldAtlas';
import { useCities } from "./useCities";
import { Marks } from './Marks';
import "./App.css";

const width = 960;
const height = 500;

const BubbleMap = () => {
  const worldAtlas = useWorldAtlas();
  const cities = useCities();


  if (!worldAtlas) {
    return <pre>Loading...</pre>;
  }

  return (
    <svg width={width} height={height}>
      <Marks 
        worldAtlas={worldAtlas} 
        cities={cities}
      />
    </svg>
  );
};

export { BubbleMap };
