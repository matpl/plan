function drawArc(x, y, context, color)
{
    context.beginPath();
    context.arc(x, y, 3, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

function WallPoint(x, y)
{
    this.x = x;
    this.y = y;
}

function WallChain()
{
    this.points = [];
	
	this.draw = function(context)
	{
		if(this.points.length  > 0)
        {
			drawArc(this.points[0].x,this.points[0].y * -1, context, 'blue');
			
			context.beginPath();
			context.moveTo(this.points[0].x, this.points[0].y * -1);
			for(i = 1; i < this.points.length; i++)
			{
				context.lineTo(this.points[i].x, this.points[i].y * -1);
				context.strokeStyle = 'blue';
				context.stroke();
				
				if(i == this.points.length - 1)
				{
					// only if the last point is not the same as the first one
					if(this.points[i] != this.points[0])
					{
						drawArc(this.points[i].x, this.points[i].y * -1, context);   
					}
				}
			}
		}
	}
}

function FloorPlan()
{
    this.exteriorWallChain = new WallChain();
    this.wallChains = [];
    
    this.draw = function(context)
    {
        this.exteriorWallChain.draw(context);
		
		for(var i = 0; i < this.wallChains.length; i++)
		{
			//todowawa : draw walls her. Other  color perhaps?	
			this.wallChains[i].draw(context);
		}
    }
}

function ThreePlan(floorPlan)
{
	this.floorPlan = floorPlan;
	
	this.draw = function()
	{
		//todowawa: create wall classes and stuff??? events on the floorplan maybe??
		var maxX = Number.MIN_VALUE;
		var maxY = Number.MIN_VALUE;
		var minX = Number.MAX_VALUE;
		var minY = Number.MAX_VALUE;
	
		for(var i = 0; i < this.floorPlan.exteriorWallChain.points.length - 1; i++)
		{
			maxX = Math.max(this.floorPlan.exteriorWallChain.points[i].x, maxX);
			maxY = Math.max(this.floorPlan.exteriorWallChain.points[i].y, maxY);
			
			minX = Math.min(this.floorPlan.exteriorWallChain.points[i].x, minX);
			minY = Math.min(this.floorPlan.exteriorWallChain.points[i].y, minY);
		}
		
		var offsetX = (minX + maxX) / 2;
		var offsetY = (minY + maxY) / 2;
	
		var totalX = 0;
		var totalY = 0;
		for(var i = 0; i < this.floorPlan.exteriorWallChain.points.length - 1; i++)
		{
			var material = new THREE.MeshLambertMaterial( {color: 0xc9c8c4, vertexColors: THREE.FaceColors} );
		
			if(i == 0)
			{
				totalX += this.floorPlan.exteriorWallChain.points[i].x;
				totalY += this.floorPlan.exteriorWallChain.points[i].y;
			}
			totalX += this.floorPlan.exteriorWallChain.points[i+1].x;
			totalY += this.floorPlan.exteriorWallChain.points[i+1].y;
			
			
			var a = this.floorPlan.exteriorWallChain.points[i+1].x - this.floorPlan.exteriorWallChain.points[i].x;
			var b = this.floorPlan.exteriorWallChain.points[i+1].y - this.floorPlan.exteriorWallChain.points[i].y;

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
			
			pivot1.position.x = this.floorPlan.exteriorWallChain.points[i].x - offsetX;
			pivot1.position.z = -(this.floorPlan.exteriorWallChain.points[i].y) + offsetY;
			
			pivot1.add(mesh);
			
			scene.add(pivot1);
			
			//todowawa: targetList and scene are in the other file
			targetList.push(mesh);
		}
		
		
		
		for(var j = 0; j < this.floorPlan.wallChains.length - 1; j++)
		{
			for(var i = 0; i < this.floorPlan.wallChains[j].points.length - 1; i++)
			{
				var material = new THREE.MeshLambertMaterial( {color: 0xc9c8c4, vertexColors: THREE.FaceColors} );
			
				var a = this.floorPlan.wallChains[j].points[i+1].x - this.floorPlan.wallChains[j].points[i].x;
				var b = this.floorPlan.wallChains[j].points[i+1].y - this.floorPlan.wallChains[j].points[i].y;

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
				
				pivot1.position.x = this.floorPlan.wallChains[j].points[i].x - offsetX;
				pivot1.position.z = -(this.floorPlan.wallChains[j].points[i].y) + offsetY;
				
				pivot1.add(mesh);
				
				scene.add(pivot1);
				
				//todowawa: targetList and scene are in the other file
				targetList.push(mesh);
			}
		}
		
		
		
		camera.position.x = totalX / this.floorPlan.exteriorWallChain.points.length;
		camera.position.z = -(totalY / this.floorPlan.exteriorWallChain.points.length);
		
		
		var material = new THREE.MeshLambertMaterial( {color: 0xe6e6e6} );
		material.side = THREE.DoubleSide;
		var rectShape = new THREE.Shape();
		for(var i = 0; i < this.floorPlan.exteriorWallChain.points.length; i++)
		{
			if(i == 0)
			{
				rectShape.moveTo( this.floorPlan.exteriorWallChain.points[i].x - offsetX, this.floorPlan.exteriorWallChain.points[i].y - offsetY);    
			}
			else
			{
				rectShape.lineTo( this.floorPlan.exteriorWallChain.points[i].x - offsetX,this.floorPlan.exteriorWallChain.points[i].y - offsetY);    
			}
		}

		var rectGeom = new THREE.ShapeGeometry( rectShape );
		var rectMesh = new THREE.Mesh( rectGeom, material ) ;
		rectMesh.rotation.x = -90 * Math.PI / 180;
		rectMesh.position.y = -50;
		scene.add( rectMesh );
	}
}

var floorPlan = new FloorPlan();
var threePlan = new ThreePlan(floorPlan);