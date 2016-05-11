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
    this.state = PlanStore.getState();

    this.onStoreChange = this.onStoreChange.bind(this);
    this.setImage = this.setImage.bind(this);
  }
  componentDidMount() {
    PlanStore.addChangeListener(this.onStoreChange);
  }
  componentWillUnmount() {
    PlanStore.removeChangeListener(this.onStoreChange);
  }
  onStoreChange() {
    this.setState(PlanStore.getState());
  }
  setImage(url) {
    this.setState({image: url});
  }
  render() {
       return <div>
                <ToolsComponent />
                <CanvasComponent image={this.state.image} walls={this.state.walls} />
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
