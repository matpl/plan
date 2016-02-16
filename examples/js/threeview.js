import React from 'react'
import ReactDOM from 'react-dom'

export default class ThreeView extends React.Component {
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
			  maxX = Math.max(this.props.walls[0].points[i].x * -1, maxX);
			  maxY = Math.max(this.props.walls[0].points[i].y, maxY);

			  minX = Math.min(this.props.walls[0].points[i].x * -1, minX);
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
				  totalX += this.props.walls[0].points[i].x * -1;
				  totalY += this.props.walls[0].points[i].y;
			  }
			  totalX += this.props.walls[0].points[i+1].x * -1;
			  totalY += this.props.walls[0].points[i+1].y;


			  var a = this.props.walls[0].points[i+1].x * -1 - this.props.walls[0].points[i].x * -1;
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

			  pivot1.position.x = this.props.walls[0].points[i].x * -1 - offsetX;
		  	pivot1.position.z = -(this.props.walls[0].points[i].y) + offsetY;

		  	pivot1.add(mesh);

			  this.scene.add(pivot1);

			//todowawa: targetList and scene are in the other file
			//targetList.push(mesh);
		  }

      for(var j = 1; j < this.props.walls.length; j++) {
			  for(var i = 0; i < this.props.walls[j].points.length - 1; i++) {
  				var material = new THREE.MeshLambertMaterial( {color: 0xc9c8c4, vertexColors: THREE.FaceColors} );

  				var a = this.props.walls[j].points[i+1].x * -1 - this.props.walls[j].points[i].x * -1;
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

  				pivot1.position.x = this.props.walls[j].points[i].x * -1 - offsetX;
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
			  	  rectShape.moveTo( this.props.walls[0].points[i].x * -1 - offsetX, this.props.walls[0].points[i].y - offsetY);
		  	  } else {
	  			  rectShape.lineTo( this.props.walls[0].points[i].x * -1 - offsetX, this.props.walls[0].points[i].y - offsetY);
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
