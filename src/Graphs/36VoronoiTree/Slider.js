import React from 'react';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import "./36VoronoiTree.css";


const PrettoSlider = withStyles({
  root: {
    color: '#43aa8b',
    height: 10,
    width: 300,
    padding: 0,

  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

const marks = [
  {
    value: 0,
    label: 'FY15',
  },
  {
    value: 20,
    label: 'FY16',
  },
  {
    value: 40,
    label: 'FY17',
  },
  {
    value: 60,
    label: 'FY18',
  },
  {
    value: 80,
    label: 'FY19',
  },
  {
    value: 100,
    label: 'FY20',
  },
];

function valuetext(value) {
  return `${value}`;
}

function MySlider(props) {

  return (
    <div className='slider36'>
      <PrettoSlider 
        onChangeCommitted={(e, v) => props.onChange(e, v)}
        track={false}
        aria-labelledby="track-false-range-slider"
        getAriaValueText={valuetext}
        defaultValue={0}
        //step={20}
        step={null}
        marks={marks}
      />
    </div>
  );
}


export default MySlider; 