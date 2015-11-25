// main.js
var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');

//todowawa: check bootstrap!!!
//todowawa: beware of automatic semi colon insertion, so put every curly brace on the same lineHeight
//todowawa: convert 4 spaces to 2 spaces
//todowawa: clear points and walls when image changes
//todowawa: check performance of recreating the parametric stuff every time
//todowawa: have a zoom in / zoom out. and the "magic" number should be in function of the zoom factor
//todowawa: escape for ending the wall

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

function getParametricLine(point, point2, canvasWidth, canvasHeight) {
  var line = {x0: point.x, y0: point.y, x1: point2.x, y1: point2.y};
  line.y1my0 = line.y1 - line.y0;
  line.y0my1 = line.y0 - line.y1;
  line.x1mx0 = line.x1 - line.x0;
  line.x0y1 = line.x0 * line.y1;
  line.x1y0 = line.x1 * line.y0;
  line.norm = Math.sqrt(Math.pow(line.x1mx0, 2) + Math.pow(line.y1my0, 2));
  line.normPow = Math.pow(line.x1mx0, 2) + Math.pow(line.y1my0, 2);
  
  // get the 2 points of the line to draw on the canvas
  var canvasLines = [{x0: 0, y0: 0, x1: canvasWidth, y1: 0}, {x0: 0, y0: 0, x1: 0, y1: canvasHeight}, {x0: 0, y0: canvasHeight, x1: canvasWidth, y1: canvasHeight}, {x0: canvasWidth, y0: 0, x1: canvasWidth, y1: canvasHeight}];
  var canvasPoints = [];
  for(var i = 0; i < canvasLines.length; i++) {
    var intersection = getIntersection(line, canvasLines[i]); 
    if(intersection != null && intersection.x >= 0 && intersection.x <= canvasWidth && intersection.y >= 0 && intersection.y <= canvasHeight && (canvasPoints.length == 0 || canvasPoints[0] != intersection.x || canvasPoints[0].y != intersection.y)) {
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
   scale: 1,
   image: null,
   guideLines : [],
   guidePoints : [],
   onMouseMove : function(e)
   {
     // todo: do the panning on the whole window. the click has to be in the canvas, but the drag can be anywhere.
     if(this.panning) {
       this.context.translate((e.pageX - actualMousePosition.x) / this.scale, (e.pageY - actualMousePosition.y) / this.scale);
       this.drawWalls();
     }
     
     actualMousePosition = {x: e.pageX, y: e.pageY};
       
     var offset =  $(this.refs.planCanvas).offset();
     var relativeX = (e.pageX - offset.left) / this.scale;
     var relativeY = (offset.top - e.pageY) * -1  / this.scale;
    
    this.contextCursor.clearRect(0, 0, this.refs.cursorCanvas.width, this.refs.cursorCanvas.height);
    this.clearContext(this.contextCursorLine, this.refs.cursorLineCanvas);
    this.clearContext(this.contextGuides, this.refs.guidesCanvas);
    
     // compute the best mousePosition with snapping
     var point = {x: relativeX, y: relativeY};
     if(this.props.walls.length > 0) {
       var wall = this.props.walls[this.props.walls.length - 1];
       // todo: 6 is the magic number...
       if(wall.points.length > 1 && getDistance(wall.points[0], {x: relativeX, y: relativeY}) < 6) {
         point = wall.points[0];
       } else {
         if(e.ctrlKey) {
           var closestPoint = null;
           
           // snap to guide points
           if(e.shiftKey) {
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
           
           for(var i = 0; i < this.guideLines.length; i++) {
             this.contextGuides.save();
             this.contextGuides.setLineDash([2, 2]);
             this.contextGuides.lineWidth = "1";
             this.contextGuides.beginPath();
             this.contextGuides.moveTo(this.guideLines[i].p0.x, this.guideLines[i].p0.y);
             this.contextGuides.lineTo(this.guideLines[i].p1.x, this.guideLines[i].p1.y);
             this.contextGuides.strokeStyle = 'lightgray';
             this.contextGuides.stroke();
             this.contextGuides.restore();
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
         this.contextCursorLine.strokeStyle = 'lightgray';
         this.contextCursorLine.stroke();
         this.contextCursorLine.restore();
       }
     }
     
     // draw cursor
     this.contextCursor.save();
     this.contextCursor.lineWidth = "2";
     this.contextCursor.strokeStyle = 'green';
     this.contextCursor.beginPath();
     this.contextCursor.moveTo(point.x * this.scale, point.y * this.scale - 5);
     this.contextCursor.lineTo(point.x * this.scale, point.y * this.scale + 5);
     this.contextCursor.stroke();
     this.contextCursor.beginPath();
     this.contextCursor.moveTo(point.x * this.scale - 5, point.y * this.scale);
     this.contextCursor.lineTo(point.x * this.scale + 5, point.y * this.scale);
     this.contextCursor.stroke();
     this.contextCursor.restore();
     
     this.mousePosition = point;
   },
   onWheel: function(e) {
     // todo: make it smooth and have a max / min zoom
     e.stopPropagation();
     e.preventDefault();
     if(e.deltaY < 0) {
       this.scale = this.scale * 2;
       this.context.scale(2, 2);
       this.contextBackground.scale(2, 2);
       this.contextGuides.scale(2, 2);
       this.contextCursorLine.scale(2, 2);
     } else {
       this.scale = this.scale * 0.5;
       this.context.scale(0.5, 0.5);
       this.contextBackground.scale(0.5, 0.5);
       this.contextGuides.scale(0.5, 0.5);
       this.contextCursorLine.scale(0.5, 0.5);
     }
     
     this.onMouseMove(e);
     this.drawWalls();
     
     this.clearContext(this.contextBackground, this.refs.backgroundCanvas);
     this.contextBackground.drawImage(this.image, 0, 0);
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
   },
   componentDidUpdate: function() {
     this.context = this.refs.planCanvas.getContext("2d");  
     this.contextBackground = this.refs.backgroundCanvas.getContext("2d");  
     
     if(this.loadedImage) {
         this.clearContext(this.contextBackground, this.refs.backgroundCanvas);
         this.contextBackground.drawImage(this.loadedImage, 0, 0);
         this.image = this.loadedImage;
         this.loadedImage = null;
     }
   },
   clearContext: function(context, canvas) {
     context.clearRect(0, 0, canvas.width / this.scale, canvas.height / this.scale);
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
         this.drawPoint(wall.points[j], 'gray', this.context);
       }
         
       this.drawLine(wall, 'gray');
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
             this.guideLines.push(getParametricLine(wall.points[j - 1], wall.points[j], this.refs.planCanvas.width, this.refs.planCanvas.height));
           }
           this.guideLines.push(getParametricLine(wall.points[j], {x: wall.points[j].x + 1, y: wall.points[j].y}, this.refs.planCanvas.width, this.refs.planCanvas.height));
           this.guideLines.push(getParametricLine(wall.points[j], {x: wall.points[j].x, y: wall.points[j].y + 1}, this.refs.planCanvas.width, this.refs.planCanvas.height));
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
     }
     return false;
   },
   render: function() {
       return <div className="canvasContainer" style={{width: this.width + "px", height: this.height + "px"}}>
                <canvas ref="backgroundCanvas" width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />
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