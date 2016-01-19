// main.js
var $ = window.jQuery = require('jquery');
import React from 'react';
import ReactDOM from 'react-dom';

var bootstrap = require('bootstrap');

import ThreeView from './threeview.js';
import DropZoneComponent from './dropzonecomponent.js';
import CanvasComponent from './canvascomponent.js';

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


var MainComponent = React.createClass({
   getInitialState: function()
   {
        return {image: null, walls: []};
   },
   setImage: function(url)
   {
     this.setState({image: url});
   },
   addPoint: function(point)
   {
     var newState = $.extend({}, this.state);
     if(newState.walls.length == 0)
     {
         newState.walls.push({id: 1, points: []});
     }

     var wall = newState.walls[newState.walls.length - 1];

     wall.points.push({id: wall.points.length + 1, x: point.x, y: point.y});
     if(wall.points.length > 1 && wall.points[0].x == wall.points[wall.points.length - 1].x && wall.points[0].y == wall.points[wall.points.length - 1].y)
     {
       // contour is done
       newState.walls.push({id: newState.walls.length + 1, points: []});
     }

     this.setState(newState);
   },
   render: function() {
       return <div>
                <ToolsComponent />
                <CanvasComponent image={this.state.image} walls={this.state.walls} addPoint={this.addPoint} />
                <DropZoneComponent setImage={this.setImage} />
                <ThreeView walls={this.state.walls} />
              </div>;
   }
});

var ToolsComponent = React.createClass({
  onChange: function(e) {
    alert('yo');
    if(this.refs.wall.checked) {
      alert('wall');
    } else if(this.refs.manipulation.checked) {
      alert('manipulation');
    }
  },
  render: function() {
    return <div className='btn-group' data-toggle='buttons'>
             <label className='btn btn-default'>
               <input type='radio' ref='wall' name='tool' onChange={this.onChange} value='wall'></input>Wall
             </label>
             <label className='btn btn-default'>
               <input type='radio' ref='manipulation' name='tool' onChange={this.onChange} value='manipulation'></input>Manipulation
             </label>
           </div>;
  }
});

//todowawa: not sure if this should be a component
var AddWallCanvasComponent = React.createClass({
 render : function() {

 }
});

ReactDOM.render(
  <MainComponent />,
  document.getElementById('example')
);
