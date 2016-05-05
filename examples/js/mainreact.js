// main.js
var $ = window.jQuery = require('jquery');
import React from 'react';
import ReactDOM from 'react-dom';

var bootstrap = require('bootstrap');

import ThreeView from './threeview.js';
import DropZoneComponent from './dropzonecomponent.js';
import CanvasComponent from './canvascomponent.js';
import ToolsComponent from './toolscomponent.js';

import PlanStore from './stores/PlanStore.js';

var planStore = new PlanStore();

//todowawa now now now: check offset with cursor and dotted line when panning fast... it makes no sense. Also there is some kind of offset until the release of middle mouse button...
//todowawa: only show the guide that we snap on??? (at least be an option or something)
//todowawa: have some kind of viewport variable for what part of the canvas is actually visible (so we don't have to do the this.scale formula every single time)
//todowawa: check bootstrap!!!
//todowawa: beware of automatic semi colon insertion, so put every curly brace on the same lineHeight
//todowawa: convert 4 spaces to 2 spaces
//todowawa: clear points and walls when image changes
//todowawa: check performance of recreating the parametric stuff every time
//todowawa: have a zoom in / zoom out. and the "magic" number should be in function of the zoom factor
//todowawa: escape for ending the wall
//todowawa: magic number 6

export default class MainComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = planStore.getState();

    this.setImage = this.setImage.bind(this);
    this.addPoint = this.addPoint.bind(this);
  }
  setImage(url) {
    this.setState({image: url});
  }
  addPoint(point) {
    var newState = $.extend({}, this.state);
    if(newState.walls.length == 0) {
      newState.walls.push({id: 1, points: []});
    }

    var wall = newState.walls[newState.walls.length - 1];

    wall.points.push({id: wall.points.length + 1, x: point.x, y: point.y});
    if(wall.points.length > 1 && wall.points[0].x == wall.points[wall.points.length - 1].x && wall.points[0].y == wall.points[wall.points.length - 1].y) {
     // contour is done
     newState.walls.push({id: newState.walls.length + 1, points: []});
    }

    this.setState(newState);
  }
  render() {
       return <div>
                <ToolsComponent />
                <CanvasComponent image={this.state.image} walls={this.state.walls} addPoint={this.addPoint} />
                <DropZoneComponent setImage={this.setImage} />
                <ThreeView walls={this.state.walls} />
              </div>;
   }
}

//todowawa: not sure if this should be a component
var AddWallCanvasComponent = React.createClass({
 render : function() {

 }
});

ReactDOM.render(
  <MainComponent />,
  document.getElementById('example')
);
