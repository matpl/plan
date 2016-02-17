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
    this.renderer.shadowMap.enabled	= true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
	  //this.renderer.shadowMapType 		= THREE.PCFSoftShadowMap;

    //var light = new THREE.AmbientLight( 0xc0c0c0 ); // soft white light
    //this.scene.add( light );

    //var ambient	= new THREE.AmbientLight( 0x444444 );
    //this.scene.add( ambient );


    var posX = 0;
    var posY = 0;
    var posZ = 0;

    this.scene.add(this.buildAxes(1000));

    this.addLights();

    // Add OrbitControls so that we can pan around with the mouse.
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.animate();
    this.wallsOffset = this.scene.children.length;
  }
  addLights() {


    this.scene.add( new THREE.AmbientLight( 0x222233 ) );

    var pointLight = new THREE.SpotLight(0xFFAA88 );

    // set its position
    //pointLight.position.x = posX;
    //pointLight.position.y = posY;
    //pointLight.position.z = posZ;
    pointLight.target.position.set(0,2,0);

    pointLight.shadowCameraNear	= 0.01;
    pointLight.castShadow		= true;
    pointLight.shadowDarkness	= 0.5;
    pointLight.shadowCameraVisible	= true;

    // add to the scene
    //this.scene.add(pointLight);
    //this.scene.add(new THREE.PointLightHelper(pointLight, 3));

    //var hemLight = new THREE.HemisphereLight(0xfff4ca, 0xffce0f, .1);
    //hemLight.position.set( 0, -1, 0 );
    //this.scene.add(hemLight);

    //var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    //dirLight.position.set(100, 100, 50);
    //this.scene.add(dirLight);

    //var ambLight = new THREE.AmbientLight(0x404040);
    //this.scene.add(ambLight);

    //var bluePoint = new THREE.PointLight(0x0033ff, 3, 0);
    //bluePoint.position.set( 70, 5, 70 );
    //this.scene.add(bluePoint);
    //this.scene.add(new THREE.PointLightHelper(bluePoint, 3));

    //var greenPoint = new THREE.PointLight(0x33ff00, 1, 0);
    //greenPoint.position.set( -70, 5, 70 );
    //this.scene.add(greenPoint);
    //this.scene.add(new THREE.PointLightHelper(greenPoint, 3));

    var spotLight = new THREE.PointLight( 0xffffff, 1, 1000 );
    spotLight.castShadow = true;
    spotLight.shadowCameraNear = 1;
    spotLight.shadowCameraFar = 1000;
    //spotLight.shadowBias = 0.01;
    //var spotLight = new THREE.PointLight(0x33ff00, 1, 1000);
    //spotLight.castShadow = true;
    //spotLight.shadowCameraVisible = true;
    /*pointLight.shadowCameraNear = 1;
		pointLight.shadowCameraFar = 30;
		pointLight.shadowBias = 0.01;*/
    spotLight.position.set( 75, 200, 0 );
    this.scene.add(spotLight);

    var spotLight2 = new THREE.PointLight( 0x33ff00, 1, 1000 );
    spotLight2.castShadow = true;
    spotLight2.shadowCameraNear = 1;
    spotLight2.shadowCameraFar = 1000;
    //spotLight.shadowBias = 0.01;
    //var spotLight = new THREE.PointLight(0x33ff00, 1, 1000);
    //spotLight.castShadow = true;
    //spotLight.shadowCameraVisible = true;
    /*pointLight.shadowCameraNear = 1;
		pointLight.shadowCameraFar = 30;
		pointLight.shadowBias = 0.01;*/
    spotLight2.position.set( -75, 200, 0 );
    this.scene.add(spotLight2);

    //var spotTarget = new THREE.Object3D();
    //spotTarget.position.set(0, 150, 1000);
    //spotLight.target = spotTarget;

    var headMaterial = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30 } );
    var sphere2 = new THREE.Mesh(
		new THREE.SphereGeometry( 16, 32, 16 ), new THREE.MeshPhongMaterial( {
      color: 0xff0000,
      shininess: 50,
      specular: 0x222222,
      shading: THREE.SmoothShading
    } ) );
    sphere2.receiveShadow = true;
    sphere2.castShadow = true;
	  sphere2.position.x = 0;
	  sphere2.position.y = 200;
	  sphere2.position.z = 0;
	  this.scene.add( sphere2 );

    var sphere3 = new THREE.Mesh(
		new THREE.SphereGeometry( 16, 32, 16 ), new THREE.MeshPhongMaterial( {
      color: 0xff0000,
      shininess: 50,
      specular: 0x222222,
      shading: THREE.SmoothShading
    } ) );
    sphere3.receiveShadow = true;
    sphere3.castShadow = true;
	  sphere3.position.x = 0;
	  sphere3.position.y = 150;
	  sphere3.position.z = 0;
	  this.scene.add( sphere3 );

    /*var torusGeometry =  new THREE.TorusKnotGeometry( 14, 1, 150, 20 );
    var torusKnot = new THREE.Mesh( torusGeometry, new THREE.MeshPhongMaterial( {
      color: 0xff0000,
      shininess: 50,
      specular: 0x222222,
      shading: THREE.SmoothShading
    } ) );
    torusKnot.position.set( 0, 200, 0 );
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    this.scene.add( torusKnot );*/


    this.scene.add(new THREE.PointLightHelper(spotLight, 1));
    this.scene.add(new THREE.CameraHelper(spotLight.shadow.camera));
    this.scene.add(new THREE.CameraHelper(spotLight2.shadow.camera));


    /*var wallMaterial = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30 } );

    var wallGeometry = new THREE.BoxGeometry( 500, 10, 500 );
    var ground = new THREE.Mesh( wallGeometry, wallMaterial );
    ground.position.set( 0, 50, 0 );
    //ground.scale.multiplyScalar( 3 );
    ground.receiveShadow = true;
    this.scene.add( ground );*/

  }
  buildAxes(length) {
    var axes = new THREE.Object3D();

    axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
    axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
    axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
    axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
    axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
    axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

    return axes;
  }
  buildAxis( src, dst, colorHex, dashed ) {
    var geom = new THREE.Geometry(),
      mat;

    if(dashed) {
      mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
    } else {
      mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
    }

    geom.vertices.push( src.clone() );
    geom.vertices.push( dst.clone() );
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    var axis = new THREE.Line( geom, mat, THREE.LinePieces );

    return axis;

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
			  var material = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30, shading: THREE.SmoothShading } );

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

			  var geometry = new THREE.BoxGeometry( 2, 500, distance);

			  mesh = new THREE.Mesh( geometry, material );

			  mesh.position.x = 0;
			  mesh.position.y = -100;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

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

      var objectMaterial = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30 } );
      var objectGeometry = new THREE.TorusGeometry( 1.5, 0.4, 8, 16 );
      var mesh = new THREE.Mesh( objectGeometry, objectMaterial );
      mesh.position.x = 0;
      mesh.position.y = 0;
      mesh.position.z = 0;
      this.scene.add(mesh);

      for(var j = 1; j < this.props.walls.length; j++) {
			  for(var i = 0; i < this.props.walls[j].points.length - 1; i++) {
  				var material = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30 } );

  				var a = this.props.walls[j].points[i+1].x * -1 - this.props.walls[j].points[i].x * -1;
  				var b = this.props.walls[j].points[i+1].y - this.props.walls[j].points[i].y;

  				var distance = Math.sqrt(a*a + b*b);
  				var angle = Math.atan2(a, b);

  				var pivot1 = new THREE.Object3D();
          pivot1.castShadow = true;
          pivot1.receiveShadow = true;

  				var geometry = new THREE.BoxGeometry( 2, 100, distance);

  				mesh = new THREE.Mesh( geometry, material );
          mesh.castShadow = true;
          mesh.receiveShadow = true;

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
		    var material = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30 } );
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
        rectMesh.castShadow = false;
        rectMesh.receiveShadow = true;
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
