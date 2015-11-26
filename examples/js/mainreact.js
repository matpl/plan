// main.js
var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');

//todowawa fast: check the clear rect on mouse move with panning


//todowawa: have some kind of viewport variable for what part of the canvas is actually visible (so we don't have to do the this.scale formula every single time)
//todowawa: check bootstrap!!!
//todowawa: beware of automatic semi colon insertion, so put every curly brace on the same lineHeight
//todowawa: convert 4 spaces to 2 spaces
//todowawa: clear points and walls when image changes
//todowawa: check performance of recreating the parametric stuff every time
//todowawa: have a zoom in / zoom out. and the "magic" number should be in function of the zoom factor
//todowawa: escape for ending the wall
//todowawa: magic numbers -10000 and 10000 and 6

function getDistance(point, point2) {
  return Math.sqrt(Math.pow(point.x - point2.x, 2) + Math.pow(point.y - point2.y, 2));
}

function getIntersection(parametricLine, parametricLine2) {
  //http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
  var r = {x: parametricLine2.x1 - parametricLine2.x0, y: parametricLine2.y1 - parametricLine2.y0};
  var s = {x: parametricLine.x1 - parametricLine.x0, y: parametricLine.y1 - parametricLine.y0};
  var res = r.x * s.y - r.y * s.x;
  if(res == 0) {
    // lines are parallel
    return null;
  } else {
    var t = ((parametricLine.x0 - parametricLine2.x0) * s.y - (parametricLine.y0 - parametricLine2.y0)  * s.x) / res;
    
    return {x: parametricLine2.x0 + t*r.x, y: parametricLine2.y0 + t*r.y};
  }    
}

function getParametricLine(point, point2, minX, maxX, minY, maxY) {
  var line = {x0: point.x, y0: point.y, x1: point2.x, y1: point2.y};
  line.y1my0 = line.y1 - line.y0;
  line.y0my1 = line.y0 - line.y1;
  line.x1mx0 = line.x1 - line.x0;
  line.x0y1 = line.x0 * line.y1;
  line.x1y0 = line.x1 * line.y0;
  line.norm = Math.sqrt(Math.pow(line.x1mx0, 2) + Math.pow(line.y1my0, 2));
  line.normPow = Math.pow(line.x1mx0, 2) + Math.pow(line.y1my0, 2);
  
  // get the 2 points of the line to draw on the canvas
  var canvasLines = [{x0: minX, y0: minY, x1: maxX, y1: minY}, {x0: minX, y0: minY, x1: minX, y1: maxY}, {x0: minX, y0: maxY, x1: maxX, y1: maxY}, {x0: maxX, y0: minY, x1: maxX, y1: maxY}];
  var canvasPoints = [];
  for(var i = 0; i < canvasLines.length; i++) {
    var intersection = getIntersection(line, canvasLines[i]); 
    if(intersection != null && intersection.x >= minX && intersection.x <= maxX && intersection.y >= minY && intersection.y <= maxY && (canvasPoints.length == 0 || canvasPoints[0] != intersection.x || canvasPoints[0].y != intersection.y)) {
      canvasPoints.push(intersection);
      if(canvasPoints.length == 2) {
          break;
      }
    }
  }
  
  line.p0 = canvasPoints[0];
  line.p1 = canvasPoints[1];
  
  return line;
}

function getClosestPoint(parametricLines, point, closestDistance) {
  var currentDist = -1;
  var currentPoint = null;
  for(var i = 0; i < parametricLines.length; i++) {
    var dist = Math.abs(parametricLines[i].y0my1 * point.x + parametricLines[i].x1mx0 * point.y + (parametricLines[i].x0y1 - parametricLines[i].x1y0)) / parametricLines[i].norm;
    
    if(dist <= closestDistance && (currentDist == -1 || dist < currentDist)) {
      // scalar projection
      var scalar = (parametricLines[i].x1mx0 * (point.x - parametricLines[i].x0) + parametricLines[i].y1my0 * (point.y - parametricLines[i].y0)) / parametricLines[i].normPow;
      var newX = scalar * parametricLines[i].x1mx0 + parametricLines[i].x0;
      var newY = scalar * parametricLines[i].y1my0 + parametricLines[i].y0;
     
      currentDist = dist;
      currentPoint = {x: newX, y: newY};
    }
  }  
  return currentPoint;
}


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
   render: function()
   {
       return <div>
                <CanvasComponent image={this.state.image} walls={this.state.walls} addPoint={this.addPoint} />
                <DropZoneComponent setImage={this.setImage} />
              </div>;
   }
});

var DropZoneComponent = React.createClass({
   onDragOver: function(e) {
     e.stopPropagation();
     e.preventDefault();
     e.dataTransfer.dropEffect = 'copy';
   },
   onDrop: function(e) {
     e.stopPropagation();
     e.preventDefault();
     
     var files = e.dataTransfer.files;
     if(files.length == 1) {
       for (var i = 0; i < files.length; i++) {
         if (!files[i].type.match('image.*')) {
           continue;
         }
       
         this.props.setImage(URL.createObjectURL(files[i]));
       }
     }
   },
   render: function() {
       return <div onDragOver={this.onDragOver} onDrop={this.onDrop}>{"Drop files here"}</div>;
   }
});

var CanvasComponent = React.createClass({
   mousePosition : {x: -1, y: -1},
   actualMousePosition: {x: 0, y: 0},
   width: 960,
   height: 540,
   onClick : function(e)
   {
       this.props.addPoint(this.mousePosition);
   },
   panning: false,
   ctrl: false,
   shift: false,
   scale: 1,
   translation: {x: 0, y: 0},
   image: null,
   guideLines : [],
   guidePoints : [],
   onMouseMove : function(e)
   {
     // todo: do the panning on the whole window. the click has to be in the canvas, but the drag can be anywhere.
     if(this.panning) {
       // translation is in grid units and not pixels
       this.translation = {x: this.translation.x + (e.pageX - actualMousePosition.x) / this.scale, y: this.translation.y + (e.pageY - actualMousePosition.y) / this.scale};
       var beforeX = this.translation.x;
       var beforeY = this.translation.y;
       
       //todo: this doesn't work. Fix this properly with the scale limit and stuff
       /*if(this.translation.x < -10000 + (this.refs.planCanvas.width) / this.scale) {
         this.translation.x = -10000 + (this.refs.planCanvas.width) / this.scale;
       } else if(this.translation.x > 10000) {
         this.translation.x = 10000;
       }
       if(this.translation.y < -10000 + (this.refs.planCanvas.height) / this.scale) {
         this.translation.y = -10000 + (this.refs.planCanvas.height) / this.scale;
       } else if(this.translation.y > 10000) {
         this.translation.y = 10000;
       }*/
       
       this.context.translate((e.pageX - actualMousePosition.x) / this.scale + (this.translation.x - beforeX), (e.pageY - actualMousePosition.y) / this.scale);
       this.contextBackground.translate((e.pageX - actualMousePosition.x) / this.scale + (this.translation.x - beforeX), (e.pageY - actualMousePosition.y) / this.scale);
       this.contextGuides.translate((e.pageX - actualMousePosition.x) / this.scale + (this.translation.x - beforeX), (e.pageY - actualMousePosition.y) / this.scale);
       this.contextCursorLine.translate((e.pageX - actualMousePosition.x) / this.scale + (this.translation.x - beforeX), (e.pageY - actualMousePosition.y) / this.scale);
       this.contextGrid.translate((e.pageX - actualMousePosition.x) / this.scale + (this.translation.x - beforeX), (e.pageY - actualMousePosition.y) / this.scale);
       this.drawWalls();
       this.drawGrid();
     }
     
     actualMousePosition = {x: e.pageX, y: e.pageY};
       
     var offset =  $(this.refs.planCanvas).offset();
     
     // relativeX / relativeY are in grid units and not pixels
     var relativeX = (e.pageX - offset.left) / this.scale - this.translation.x;
     var relativeY = ((offset.top - e.pageY) * -1) / this.scale - this.translation.y;
    
    this.contextCursor.clearRect(0, 0, this.refs.cursorCanvas.width, this.refs.cursorCanvas.height);
    this.clearContext(this.contextCursorLine, this.refs.cursorLineCanvas);
    
     // compute the best mousePosition with snapping
     var point = {x: relativeX, y: relativeY};
     if(this.props.walls.length > 0) {
       var wall = this.props.walls[this.props.walls.length - 1];
       // todo: 6 is the magic number...
       if(wall.points.length > 1 && getDistance(wall.points[0], {x: relativeX, y: relativeY}) < 6) {
         point = wall.points[0];
       } else {
         if(this.ctrl) {
           var closestPoint = null;
           
           // snap to guide points
           if(this.shift) {
             var minDist = -1;
             for(var i = 0; i < this.guidePoints.length; i++) {
               var dist = getDistance(point, this.guidePoints[i]);
               if(dist < 6 && (minDist == -1 || dist < minDist)) {
                 // todo: 6 is the magic number again...
                 closestPoint = this.guidePoints[i];
                 minDist = dist;
               }
             }
           }
           
           // todo: 6 is the magic number
           if(closestPoint == null) {
             // snap to guide lines
             closestPoint = getClosestPoint(this.guideLines, point, 6);
           }
           
           if(closestPoint != null) {
             point = closestPoint;
           }
         }
       }
       
       if(wall.points.length > 0) {
         this.contextCursorLine.save();
         this.contextCursorLine.setLineDash([2, 2]);
         this.contextCursorLine.lineWidth = "1";
         this.contextCursorLine.beginPath();
         this.contextCursorLine.moveTo(wall.points[wall.points.length - 1].x, wall.points[wall.points.length - 1].y);
         this.contextCursorLine.lineTo(point.x, point.y);
         this.contextCursorLine.strokeStyle = '#62cdf2';
         this.contextCursorLine.stroke();
         this.contextCursorLine.restore();
       }
     }
     
     // draw cursor
     this.contextCursor.save();
     this.contextCursor.lineWidth = "2";
     this.contextCursor.strokeStyle = '#05729a';
     this.contextCursor.beginPath();
     this.contextCursor.moveTo((point.x + this.translation.x) * this.scale, (point.y + this.translation.y) * this.scale - 5);
     this.contextCursor.lineTo((point.x + this.translation.x) * this.scale, (point.y + this.translation.y) * this.scale + 5);
     this.contextCursor.stroke();
     this.contextCursor.beginPath();
     this.contextCursor.moveTo((point.x + this.translation.x) * this.scale - 5, (point.y + this.translation.y) * this.scale);
     this.contextCursor.lineTo((point.x + this.translation.x) * this.scale + 5, (point.y + this.translation.y) * this.scale);
     this.contextCursor.stroke();
     this.contextCursor.restore();
     
     this.mousePosition = point;
   },
   onKeyDown: function(e) {
     if(e.ctrlKey && !this.ctrl) {
      this.ctrl = true;
      this.drawGuides();
     }
     if(e.shiftKey && !this.shift) {
      this.shift = true;
      this.drawGuides();
     }
   },
   onKeyUp: function(e) {
    if(e.keyCode == 17 && this.ctrl) {
      this.ctrl = false;
      this.drawGuides();
    }
    if(e.keyCode == 16 && this.shift) {
      this.shift = false;
      this.drawGuides();
    }
   },
   onWheel: function(e) {
     // todo: make it smooth and have a max / min zoom
     e.stopPropagation();
     e.preventDefault();
     
     // translate back to original 0,0 before scaling
     this.context.translate(-this.translation.x, -this.translation.y);
     this.contextBackground.translate(-this.translation.x, -this.translation.y);
     this.contextGuides.translate(-this.translation.x, -this.translation.y);
     this.contextCursorLine.translate(-this.translation.x, -this.translation.y);
     this.contextGrid.translate(-this.translation.x, -this.translation.y);
     if(e.deltaY < 0) {
       this.scale = this.scale * 2;       
       this.context.scale(2, 2);
       this.contextBackground.scale(2, 2);
       this.contextGuides.scale(2, 2);
       this.contextCursorLine.scale(2, 2);
       this.contextGrid.scale(2, 2);
     } else {
       this.scale = this.scale * 0.5;
       this.context.scale(0.5, 0.5);
       this.contextBackground.scale(0.5, 0.5);
       this.contextGuides.scale(0.5, 0.5);
       this.contextCursorLine.scale(0.5, 0.5);
       this.contextGrid.scale(0.5, 0.5);
     }
     // re-translate to the right spot
     this.context.translate(this.translation.x, this.translation.y);
     this.contextBackground.translate(this.translation.x, this.translation.y);
     this.contextGuides.translate(this.translation.x, this.translation.y);
     this.contextCursorLine.translate(this.translation.x, this.translation.y);
     this.contextGrid.translate(this.translation.x, this.translation.y);
     
     //todo: do NOT call mouse move.. call drawGuides, drawCursor and stuff like this
     this.onMouseMove(e);
     this.drawGrid();
     this.drawWalls();
     
     this.drawGuides();
     
     this.clearContext(this.contextBackground, this.refs.backgroundCanvas);
     if(this.image != null) {
       this.contextBackground.drawImage(this.image, 0, 0);
     }
   },
   onMouseDown: function(e) {
     this.panning = true;
   },
   onMouseUp: function(e) {
     this.panning = false;
   },
   onMouseLeave: function(e) {
     this.panning = false;
   },
   componentDidMount: function() {
     this.context = this.refs.planCanvas.getContext("2d");  
     this.contextBackground = this.refs.backgroundCanvas.getContext("2d");  
     this.contextGuides = this.refs.guidesCanvas.getContext("2d");
     this.contextCursor = this.refs.cursorCanvas.getContext("2d");
     this.contextCursorLine = this.refs.cursorLineCanvas.getContext("2d");
     this.contextGrid = this.refs.gridCanvas.getContext("2d");
     
     this.drawGrid();
     
     $(document.body).on('keydown', this.onKeyDown);
     $(document.body).on('keyup', this.onKeyUp);
   },
   componentWillUnmount: function() {
     $(document.body).off('keydown', this.onKeyDown);
     $(document.body).off('keyup', this.onKeyUp);
   },
   componentDidUpdate: function() {
     this.context = this.refs.planCanvas.getContext("2d");  
     this.contextBackground = this.refs.backgroundCanvas.getContext("2d");  
     this.contextGuides = this.refs.guidesCanvas.getContext("2d");
     this.contextCursor = this.refs.cursorCanvas.getContext("2d");
     this.contextCursorLine = this.refs.cursorLineCanvas.getContext("2d");
     this.contextGrid = this.refs.gridCanvas.getContext("2d");
     
     if(this.loadedImage) {
         this.clearContext(this.contextBackground, this.refs.backgroundCanvas);
         this.contextBackground.drawImage(this.loadedImage, 0, 0);
         this.image = this.loadedImage;
         this.loadedImage = null;
     }
   },
   clearContext: function(context, canvas) {
     //context.clearRect(0, 0, canvas.width / this.scale - this.translation.x, canvas.height / this.scale - this.translation.y);
     context.clearRect(-10000, -10000, 10000 * 2,  10000 * 2);
   },
   drawPoint: function (point, color, context) {
     context.save();
     context.lineWidth = "1";
     context.beginPath();
     context.arc(point.x, point.y, 3, 0, 2 * Math.PI, false);
     context.fillStyle = color;
     context.fill();
     context.restore();
   },
   drawLine: function(wall, color) {
     this.context.save();
     this.context.beginPath();
     this.context.lineWidth = "1";
     this.context.strokeStyle = color;
     for(var j = 0; j < wall.points.length; j++) {
       if(j == 0) {
         this.context.moveTo(wall.points[j].x, wall.points[j].y);
       } else {
         this.context.lineTo(wall.points[j].x, wall.points[j].y);  
       }
     }
     this.context.stroke();
     this.context.restore();
   },
   drawWalls: function() {
     // draw the points. right now we redraw everything.
     this.clearContext(this.context, this.refs.planCanvas);
     for(var i = 0; i < this.props.walls.length; i++) {
       var wall = this.props.walls[i];
       for(var j = 0; j < wall.points.length; j++) {
         this.drawPoint(wall.points[j], '#2d9ac2', this.context);
       }
         
       this.drawLine(wall, '#2d9ac2');
     }
   },
   drawGuides: function() {
     this.clearContext(this.contextGuides, this.refs.guidesCanvas);
     if(this.ctrl) {
       for(var i = 0; i < this.guideLines.length; i++) {
         this.contextGuides.save();
         this.contextGuides.setLineDash([2, 2]);
         this.contextGuides.lineWidth = "1";
         this.contextGuides.beginPath();
         this.contextGuides.moveTo(this.guideLines[i].p0.x, this.guideLines[i].p0.y);
         this.contextGuides.lineTo(this.guideLines[i].p1.x, this.guideLines[i].p1.y);
         this.contextGuides.strokeStyle = '#62cdf2';
         this.contextGuides.stroke();
         this.contextGuides.restore();
       }
     }
   },
   drawGrid: function(start, lineWidth, delta, steps) {
     start = typeof start === 'undefined' ? 0 : start;
     lineWidth = typeof lineWidth === 'undefined' ? 0.4 : lineWidth;
     delta = typeof delta === 'undefined' ? 25 : delta;
     steps = typeof steps === 'undefined' ? 0 : steps;
     var max = 5;
     if(steps == 0) {
         this.clearContext(this.contextGrid, this.refs.gridCanvas);
         max = 800;
     }
     
     for(var i = 0; i < max; i++) {
       if(i != 0) {
         this.contextGrid.save();
         this.contextGrid.lineWidth = lineWidth;
         this.contextGrid.strokeStyle = 'lightgray';
         this.contextGrid.beginPath();
         this.contextGrid.moveTo(start + i * delta - 10000, -10000);
         this.contextGrid.lineTo(start + i * delta - 10000, 10000);
         this.contextGrid.stroke();
         this.contextGrid.beginPath();
         this.contextGrid.moveTo(-10000, start + i * delta - 10000);
         this.contextGrid.lineTo(10000, start + i * delta - 10000);
         this.contextGrid.stroke();
         this.contextGrid.restore();
       }
       //todo: either keep 1 level, or show more levels as it zooms in
       if(steps < 1 && this.scale >= 1) {
         this.drawGrid(start + i * delta, lineWidth / 2.0, delta / 5.0, steps + 1);
       }
     }
   },
   shouldComponentUpdate: function(nextProps, nextState) {
     if(nextProps.image !== this.props.image) {
       var img = new Image();
       img.src = nextProps.image;
       var imgLoad = function() {
         this.loadedImage = img;
         this.width = img.width;
         this.height = img.height;
         
         // only rerender when the image is loaded
         this.forceUpdate();            
       }
       img.onload = imgLoad.bind(this);
     } else {
       // todo: this won't work for when we drag a point or something... We can't recompute all parametric lines everytime it changes... Only set state on mouse up??? Maybe...
       
       this.drawWalls();
       
       this.guideLines = [];
       this.guidePoints = [];
       
       for(var i = 0; i < this.props.walls.length; i++) {
         var wall = this.props.walls[i];
         
         for(var j = 0; j < wall.points.length; j++) {
           // todo: do not create collinear lines
           if(j > 0) {
             this.guideLines.push(getParametricLine(wall.points[j - 1], wall.points[j], -10000, 10000, -10000, 10000));
           }
           this.guideLines.push(getParametricLine(wall.points[j], {x: wall.points[j].x + 1, y: wall.points[j].y}, -10000, 10000, -10000, 10000));
           this.guideLines.push(getParametricLine(wall.points[j], {x: wall.points[j].x, y: wall.points[j].y + 1}, -10000, 10000, -10000, 10000));
         }
       }
       
       for(var i = 1; i < this.guideLines.length; i++) {
         for(var j = 0; j < i; j++) {
           var point = getIntersection(this.guideLines[i], this.guideLines[j]);
           if(point != null) {
             this.guidePoints.push(point);
           }
         }
       }
       this.drawGuides();
     }
     return false;
   },
   render: function() {
       return <div className="canvasContainer" style={{width: this.width + "px", height: this.height + "px"}}>
                <canvas ref="backgroundCanvas" width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />
                <canvas ref="gridCanvas" width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />
                <canvas ref="guidesCanvas" width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />
                <canvas ref="planCanvas" width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />
                <canvas ref="cursorLineCanvas" width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />
                <canvas ref="cursorCanvas" width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} onMouseMove={this.onMouseMove} onMouseLeave={this.onMouseLeave} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onClick={this.onClick} onWheel={this.onWheel} />
              </div>;
   }
});

ReactDOM.render(
  <MainComponent />,
  document.getElementById('example')
);