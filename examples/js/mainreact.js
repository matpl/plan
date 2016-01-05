// main.js
var $ = window.jQuery = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');

var bootstrap = require('bootstrap');

var totalWidth = 19200;
var totalHeight = 10800;

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

class ThreeView extends React.Component {
  constructor(props) {
    super(props);
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
    this.camera.position.z = 0;
    this.camera.position.y = 800;
    this.scene = new THREE.Scene();

    var renderWidth = 500 * window.innerWidth / window.innerHeight;
    var renderHeight = 500;
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(renderWidth, renderHeight);

    var light = new THREE.AmbientLight( 0xc0c0c0 ); // soft white light
    this.scene.add( light );
    var posX = 250;
    var posY = 50;
    var posZ = -700;

    var pointLight = new THREE.PointLight(0x4f4f4f);

    // set its position
    pointLight.position.x = posX;
    pointLight.position.y = posY;
    pointLight.position.z = posZ;

    // add to the scene
    this.scene.add(pointLight);
    this.scene.add(new THREE.PointLightHelper(pointLight, 3));

    var hemLight = new THREE.HemisphereLight(0xfff4ca, 0xffce0f, .1);
    hemLight.position.set( 0, -1, 0 );
    this.scene.add(hemLight);

    // Add OrbitControls so that we can pan around with the mouse.
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.animate();
    this.wallsOffset = this.scene.children.length;
  }
  animate() {
    this.controls.update();
    this.renderer.render(this.scene,this.camera);
    window.requestAnimationFrame(this.animate.bind(this));
  }
  componentDidMount() {
    ReactDOM.findDOMNode(this).appendChild(this.renderer.domElement);
  }
  componentDidUpdate() {

    // todowawa : have something smarter
    for( var i = this.scene.children.length - 1; i >= this.wallsOffset; i--) {
      this.scene.remove(this.scene.children[i]);
    }

    // draw walls here
    if(this.props.walls[0].points.length > 1) {
      var maxX = Number.MIN_VALUE;
		  var maxY = Number.MIN_VALUE;
		  var minX = Number.MAX_VALUE;
		  var minY = Number.MAX_VALUE;

		  for(var i = 0; i < this.props.walls[0].points.length - 1; i++) {
			  maxX = Math.max(this.props.walls[0].points[i].x, maxX);
			  maxY = Math.max(this.props.walls[0].points[i].y, maxY);

			  minX = Math.min(this.props.walls[0].points[i].x, minX);
			  minY = Math.min(this.props.walls[0].points[i].y, minY);
		  }

		  var offsetX = (minX + maxX) / 2;
		  var offsetY = (minY + maxY) / 2;

		  var totalX = 0;
		  var totalY = 0;
      var mesh;
		  for(var i = 0; i < this.props.walls[0].points.length - 1; i++) {
			  var material = new THREE.MeshLambertMaterial( {color: 0xc9c8c4, vertexColors: THREE.FaceColors} );

			  if(i == 0) {
				  totalX += this.props.walls[0].points[i].x;
				  totalY += this.props.walls[0].points[i].y;
			  }
			  totalX += this.props.walls[0].points[i+1].x;
			  totalY += this.props.walls[0].points[i+1].y;


			  var a = this.props.walls[0].points[i+1].x - this.props.walls[0].points[i].x;
			  var b = this.props.walls[0].points[i+1].y - this.props.walls[0].points[i].y;

			  var distance = Math.sqrt(a*a + b*b);
			  var angle = Math.atan2(a, b);

			  var pivot1 = new THREE.Object3D();

			  var geometry = new THREE.BoxGeometry( 2, 100, distance);

			  mesh = new THREE.Mesh( geometry, material );

			  mesh.position.x = 0;
			  mesh.position.y = 0;

			  // has to be half of the length
			  mesh.position.z = 0 - distance / 2.0;

			  pivot1.rotation.y = -angle;

			  pivot1.position.x = this.props.walls[0].points[i].x - offsetX;
		  	pivot1.position.z = -(this.props.walls[0].points[i].y) + offsetY;

		  	pivot1.add(mesh);

			  this.scene.add(pivot1);

			//todowawa: targetList and scene are in the other file
			//targetList.push(mesh);
		  }

      for(var j = 1; j < this.props.walls.length; j++) {
			  for(var i = 0; i < this.props.walls[j].points.length - 1; i++) {
  				var material = new THREE.MeshLambertMaterial( {color: 0xc9c8c4, vertexColors: THREE.FaceColors} );

  				var a = this.props.walls[j].points[i+1].x - this.props.walls[j].points[i].x;
  				var b = this.props.walls[j].points[i+1].y - this.props.walls[j].points[i].y;

  				var distance = Math.sqrt(a*a + b*b);
  				var angle = Math.atan2(a, b);

  				var pivot1 = new THREE.Object3D();

  				var geometry = new THREE.BoxGeometry( 2, 100, distance);

  				mesh = new THREE.Mesh( geometry, material );

  				mesh.position.x = 0;
  				mesh.position.y = 0;

  				// has to be half of the length
  				mesh.position.z = 0 - distance / 2.0;

  				pivot1.rotation.y = -angle;

  				pivot1.position.x = this.props.walls[j].points[i].x - offsetX;
  				pivot1.position.z = -(this.props.walls[j].points[i].y) + offsetY;

  				pivot1.add(mesh);

  				this.scene.add(pivot1);

  				//todowawa: targetList and scene are in the other file
  				//targetList.push(mesh);
  			}
  		}



		  this.camera.position.x = totalX / this.props.walls[0].points.length;
		  this.camera.position.z = -(totalY / this.props.walls[0].points.length);


      if(this.props.walls.length > 1) {
		    var material = new THREE.MeshLambertMaterial( {color: 0xe6e6e6} );
		    material.side = THREE.DoubleSide;
		    var rectShape = new THREE.Shape();
		    for(var i = 0; i < this.props.walls[0].points.length; i++) {
			    if(i == 0) {
			  	  rectShape.moveTo( this.props.walls[0].points[i].x - offsetX, this.props.walls[0].points[i].y - offsetY);
		  	  } else {
	  			  rectShape.lineTo( this.props.walls[0].points[i].x - offsetX, this.props.walls[0].points[i].y - offsetY);
  			  }
		    }

		    var rectGeom = new THREE.ShapeGeometry( rectShape );
        var rectMesh = new THREE.Mesh( rectGeom, material ) ;
        rectMesh.rotation.x = -90 * Math.PI / 180;
		    rectMesh.position.y = -50;
		    this.scene.add( rectMesh );
      }
    }
  }
  render() {
    return <div />;
  }
}

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
   width: 1440,
   height: 810,
   onClick : function(e) {
     // todowawa: this should be in AddWallCanvasComponent
     if(e.button == 0) {
       // the mousePosition can't be the same as the last added point
       var wall = this.props.walls.length == 0 ? null : this.props.walls[this.props.walls.length - 1];
       if(wall == null || wall.points.length == 0 || this.mousePosition.x != wall.points[wall.points.length - 1].x || this.mousePosition.y != wall.points[wall.points.length - 1].y) {
         this.props.addPoint(this.mousePosition);
       }
     }
   },
   panning: false,
   ctrl: false,
   shift: false,
   scale: 1,
   translation: {x: 0, y: 0},
   image: null,
   guideLines : [],
   guidePoints : [],
   pushTransform : function() {
     this.context.save();
     this.contextBackground.save();
     this.contextGuides.save();
     this.contextCursorLine.save();
     this.contextGrid.save();

     this.context.translate(this.width/2, this.height/2);
     this.contextBackground.translate(this.width/2, this.height/2);
     this.contextGuides.translate(this.width/2, this.height/2);
     this.contextCursorLine.translate(this.width/2, this.height/2);
     this.contextGrid.translate(this.width/2, this.height/2);

     this.context.scale(this.scale, this.scale);
     this.contextBackground.scale(this.scale, this.scale);
     this.contextGuides.scale(this.scale, this.scale);
     this.contextCursorLine.scale(this.scale, this.scale);
     this.contextGrid.scale(this.scale, this.scale);

     this.context.translate(-this.width/2, -this.height/2);
     this.contextBackground.translate(-this.width/2, -this.height/2);
     this.contextGuides.translate(-this.width/2, -this.height/2);
     this.contextCursorLine.translate(-this.width/2, -this.height/2);
     this.contextGrid.translate(-this.width/2, -this.height/2);

     // this is the actual translation in scale 1 units
     this.context.translate(this.translation.x, this.translation.y);
     this.contextBackground.translate(this.translation.x, this.translation.y);
     this.contextGuides.translate(this.translation.x, this.translation.y);
     this.contextCursorLine.translate(this.translation.x, this.translation.y);
     this.contextGrid.translate(this.translation.x, this.translation.y);
   },
   popTransform : function() {
     this.context.restore();
     this.contextBackground.restore();
     this.contextGuides.restore();
     this.contextCursorLine.restore();
     this.contextGrid.restore();
   },
   checkBounds : function() {
     // top left corner of the visible
     var firstVisibleX = (this.width - totalWidth / this.scale) / 2  - this.translation.x - ((this.width - totalWidth) / 2) / this.scale;
     // top left corner of the visible + the visible width
     var lastVisibleX = firstVisibleX + this.width / this.scale;
     if(lastVisibleX > (totalWidth + this.width) / 2) {
       this.translation.x = this.translation.x + (lastVisibleX - (totalWidth + this.width) / 2);
     } else if(firstVisibleX < (-totalWidth + this.width) / 2) {
       this.translation.x = this.translation.x + (firstVisibleX - (-totalWidth + this.width) / 2);
     }

     // top left corner of the visible
     var firstVisibleY = (this.height - totalHeight / this.scale) / 2  - this.translation.y - ((this.height - totalHeight) / 2) / this.scale;
     // top left corner of the visible + the visible height
     var lastVisibleY = firstVisibleY + this.height / this.scale;
     if(lastVisibleY > (totalHeight + this.height) / 2) {
       this.translation.y = this.translation.y + (lastVisibleY - (totalHeight + this.height) / 2);
     } else if(firstVisibleY < (-totalHeight + this.height) / 2) {
       this.translation.y = this.translation.y + (firstVisibleY - (-totalHeight + this.height) / 2);
     }
   },
   onMouseMove : function(e) {
     this.pushTransform();
     // todo: do the panning on the whole window. the click has to be in the canvas, but the drag can be anywhere.
     if(this.panning) {

       // translation is in grid units and not pixels
       this.translation = {x: this.translation.x + (e.pageX - this.actualMousePosition.x) / this.scale, y: this.translation.y + (e.pageY - this.actualMousePosition.y) / this.scale};
       this.checkBounds();

       this.drawWalls();
       this.drawGrid();

       if(this.ctrl) {
         this.clearContext(this.contextGuides, this.refs.guidesCanvas);
       }
     }

     this.actualMousePosition = {x: e.pageX, y: e.pageY};

     var offset =  $(this.refs.planCanvas).offset();

     var relativeX = (e.pageX - offset.left) / this.scale + (this.width - totalWidth / this.scale) / 2  - this.translation.x - ((this.width - totalWidth) / 2) / this.scale;
     var relativeY = ((offset.top - e.pageY) * -1) / this.scale + (this.height - totalHeight / this.scale) / 2  - this.translation.y - ((this.height - totalHeight) / 2) / this.scale;

     this.contextCursor.clearRect(0, 0, this.refs.cursorCanvas.width, this.refs.cursorCanvas.height);
     this.clearContext(this.contextCursorLine, this.refs.cursorLineCanvas);

     // compute the best mousePosition with snapping
     var point = {x: relativeX, y: relativeY};
     if(this.props.walls.length > 0) {
       // todowawa: this should be in AddWallCanvasComponent
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

     // take the transformed point and get the untransformed equivalent (reverse equation of the relativeX / relativeY)
     var centerX = (point.x + ((this.width - totalWidth) / 2) / this.scale + this.translation.x - (this.width - totalWidth / this.scale) / 2) * this.scale;
     var centerY = (point.y + ((this.height - totalHeight) / 2) / this.scale + this.translation.y - (this.height - totalHeight / this.scale) / 2) * this.scale;

     this.contextCursor.moveTo(centerX, centerY - 5);
     this.contextCursor.lineTo(centerX, centerY + 5);
     this.contextCursor.stroke();
     this.contextCursor.beginPath();
     this.contextCursor.moveTo(centerX - 5, centerY);
     this.contextCursor.lineTo(centerX + 5, centerY);
     this.contextCursor.stroke();
     this.contextCursor.restore();

     this.mousePosition = point;

     this.popTransform();
   },
   onKeyDown: function(e) {
     this.pushTransform();
     if(e.ctrlKey && !this.ctrl) {
      this.ctrl = true;
      this.drawGuides();
     }
     if(e.shiftKey && !this.shift) {
      this.shift = true;
      this.drawGuides();
     }
     this.popTransform();
   },
   onKeyUp: function(e) {
    this.pushTransform();
    if(e.keyCode == 17 && this.ctrl) {
      this.ctrl = false;
      this.drawGuides();
    }
    if(e.keyCode == 16 && this.shift) {
      this.shift = false;
      this.drawGuides();
    }
    this.popTransform();
   },
   onWheel: function(e) {
     // todo: make it smooth and have a max / min zoom
     e.stopPropagation();
     e.preventDefault();

     if(e.deltaY < 0) {
       if(this.scale < 10) {
         this.scale = this.scale * 2;
       }
     } else {
       if(this.scale * 0.5 >= this.width / totalWidth) {
         this.scale = this.scale * 0.5;
       }
     }
     this.pushTransform();
     this.checkBounds();
     this.popTransform();

     //todowawa: don't call onmousemove directly, but a function or something (that is called by onmousemove). This will remove the unnecessary pop / push
     this.onMouseMove(e);

     this.pushTransform();
     this.drawGrid();
     this.drawWalls();

     this.drawGuides();

     this.clearContext(this.contextBackground, this.refs.backgroundCanvas);
     if(this.image != null) {
       this.contextBackground.drawImage(this.image, 0, 0);
     }

     this.popTransform();
   },
   onMouseDown: function(e) {
     if(e.button == 1) {
       e.stopPropagation();
       e.preventDefault();
       this.panning = true;
     }
   },
   onMouseUp: function(e) {
     if(e.button == 1) {
       this.panning = false;

       this.pushTransform();
       if(this.ctrl) {
         this.drawGuides();
       }
       this.drawWalls();
       this.drawGrid();
       //todowawa: don't call onmousemove directly, but a function or something (that is called by onmousemove). This will remove the unnecessary pop / push
       this.onMouseMove(e);
       this.popTransform();
     }
   },
   onMouseLeave: function(e) {
     if(e.button == 1) {
       this.panning = false;

       this.pushTransform();
       if(this.ctrl) {
         this.drawGuides();
       }
       this.drawWalls();
       this.drawGrid();
       //todowawa: don't call onmousemove directly, but a function or something (that is called by onmousemove). This will remove the unnecessary pop / push
       this.onMouseMove(e);
       this.popTransform();
     }
   },
   componentDidMount: function() {
     this.context = this.refs.planCanvas.getContext("2d");
     this.contextBackground = this.refs.backgroundCanvas.getContext("2d");
     this.contextGuides = this.refs.guidesCanvas.getContext("2d");
     this.contextCursor = this.refs.cursorCanvas.getContext("2d");
     this.contextCursorLine = this.refs.cursorLineCanvas.getContext("2d");
     this.contextGrid = this.refs.gridCanvas.getContext("2d");

     this.pushTransform();

     this.drawGrid();

     this.popTransform();

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

     //todowawa: transform here
     if(this.loadedImage) {
         this.clearContext(this.contextBackground, this.refs.backgroundCanvas);
         this.contextBackground.drawImage(this.loadedImage, 0, 0);
         this.image = this.loadedImage;
         this.loadedImage = null;
     }
   },
   clearContext: function(context, canvas) {
     //context.clearRect(0, 0, canvas.width / this.scale - this.translation.x, canvas.height / this.scale - this.translation.y);

     context.clearRect(-totalWidth / 2 + this.width / 2, -totalHeight / 2 + this.height / 2, totalWidth, totalHeight);
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
   drawGrid: function(start, lineWidth, delta, steps, vertical, horizontal) {
     start = typeof start === 'undefined' ? 0 : start;
     lineWidth = typeof lineWidth === 'undefined' ? 0.4 : lineWidth;
     delta = typeof delta === 'undefined' ? 25 : delta;
     steps = typeof steps === 'undefined' ? 0 : steps;
     horizontal = typeof horizontal === 'undefined' ? true : horizontal;
     vertical = typeof vertical === 'undefined' ? true : vertical;
     var maxX = 5;
     var maxY = 5;
     if(steps == 0) {
         this.clearContext(this.contextGrid, this.refs.gridCanvas);
         maxX = totalWidth / 25;
         maxY = totalHeight / 25;
     }

     var max = Math.max(maxX, maxY);

     for(var i = 0; i < max; i++) {
       if(i != 0) {
         this.contextGrid.save();
         this.contextGrid.lineWidth = lineWidth;
         this.contextGrid.strokeStyle = 'lightgray';
         if(i < maxX && vertical) {
           this.contextGrid.beginPath();
           this.contextGrid.moveTo(start + i * delta - totalWidth / 2 + this.width / 2, -totalHeight / 2 + this.height / 2);
           this.contextGrid.lineTo(start + i * delta - totalWidth / 2 + this.width / 2, totalHeight / 2 + this.height / 2);
           this.contextGrid.stroke();
         } else {
           vertical = false;
         }
         if(i < maxY && horizontal) {
           this.contextGrid.beginPath();
           this.contextGrid.moveTo(-totalWidth / 2 + this.width / 2, start + i * delta - totalHeight / 2 + this.height / 2);
           this.contextGrid.lineTo(totalWidth / 2 + this.width / 2, start + i * delta - totalHeight / 2 + this.height / 2);
           this.contextGrid.stroke();
         } else {
           horizontal = false;
         }
         this.contextGrid.restore();
       }
       //todo: either keep 1 level, or show more levels as it zooms in
       if(steps < 1 && this.scale >= 1) {
         this.drawGrid(start + i * delta, lineWidth / 2.0, delta / 5.0, steps + 1, vertical, horizontal);
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

       this.pushTransform();

       this.drawWalls();

       this.guideLines = [];
       this.guidePoints = [];

       for(var i = 0; i < this.props.walls.length; i++) {
         var wall = this.props.walls[i];

         for(var j = 0; j < wall.points.length; j++) {
           // todo: do not create collinear lines
           if(j > 0) {
             this.guideLines.push(getParametricLine(wall.points[j - 1], wall.points[j], -totalWidth / 2 + this.width / 2, totalWidth / 2 + this.width / 2, -totalHeight / 2 + this.height / 2, totalHeight / 2 + this.height / 2));
           }
           this.guideLines.push(getParametricLine(wall.points[j], {x: wall.points[j].x + 1, y: wall.points[j].y}, -totalWidth / 2 + this.width / 2, totalWidth / 2 + this.width / 2, -totalHeight / 2 + this.height / 2, totalHeight / 2 + this.height / 2));
           this.guideLines.push(getParametricLine(wall.points[j], {x: wall.points[j].x, y: wall.points[j].y + 1}, -totalWidth / 2 + this.width / 2, totalWidth / 2 + this.width / 2, -totalHeight / 2 + this.height / 2, totalHeight / 2 + this.height / 2));
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

       this.popTransform();
     }
     return false;
   },
   render: function() {
     var controls = [];

     return React.createElement('div', {className: 'canvasContainer', style: {width: this.width + 'px', height: this.height + 'px'}},
             <canvas ref='backgroundCanvas' width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />,
             <canvas ref='gridCanvas' width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />,
             <canvas ref='guidesCanvas' width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />,
             <canvas ref='planCanvas' width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />,
             <canvas ref='cursorLineCanvas' width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} />,
             <canvas ref='cursorCanvas' width={this.width} height={this.height} style={{width: this.width + "px", height: this.height + "px"}} onMouseMove={this.onMouseMove} onMouseLeave={this.onMouseLeave} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onClick={this.onClick} onWheel={this.onWheel} />);
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
