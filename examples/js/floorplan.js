function drawArc(x, y, context, color)
{
    context.lineWidth = "1";
    context.beginPath();
    context.arc(x, y, 3, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

function ParametricLine(x0, y0, x1, y1)
{
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    
    this.y0my1 = this.y0 - this.y1;
    this.y1my0 = this.y1 - this.y0;
    this.x1mx0 = this.x1 - this.x0;
    this.x0y1 = this.x0 * this.y1;
    this.x1y0 = this.x1 * this.y0;
    this.norm = Math.sqrt(Math.pow(this.x1 - this.x0, 2) + Math.pow(this.y1 - this.y0, 2));
    this.normPow = Math.pow(this.x1 - this.x0, 2) + Math.pow(this.y1 - this.y0, 2);
    
    this.getClosestPoint = function(x, y)
    {
        var dist = Math.abs((this.y0my1 * x + this.x1mx0 * y + (this.x0y1 - this.x1y0))) / this.norm;
        
        // scalar projection:
        var scalar = (this.x1mx0 * (x - this.x0) + this.y1my0 * (y - this.y0)) / this.normPow;
        
        var newX = scalar * this.x1mx0 + this.x0;
        var newY = scalar * this.y1my0 + this.y0;
         
        return {x: newX, y: newY, distance: dist};
    }
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
			
            context.lineWidth = "1";
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
    
    this.getClosestPoint = function(x, y, closestDistance)
    {
        var closestPoint = null;
        for(var i = 0; i < this.points.length - 1; i++)
        {
            //todowawa: this should be saved when a point  is added/removed/modified or something
            var x0 = this.points[i].x;
            var y0 = this.points[i].y;
            
            var x1 = this.points[i + 1].x;
            var y1 = this.points[i + 1].y;
            
            var dist = Math.abs(((y0 - y1) * x + (x1 - x0) * y + (x0 * y1 - x1 * y0))) / Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
            
            if(dist <= closestDistance)
            {
                if(closestPoint == null || dist < closestPoint.distance)
                {
                    var scalar = ((x1 - x0) * (x - x0) + (y1 - y0) * (y - y0)) / (Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
                 
                    var newX = scalar * (x1 - x0) + x0;
                    var newY = scalar * (y1 - y0) + y0;
                    
                    closestPoint = {x: newX, y: newY, distance : dist};   
                }
            }
        }
        
        return closestPoint;
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
    
    this.getClosestPoint = function(x, y, closestDistance)
    {
        var point = this.exteriorWallChain.getClosestPoint(x, y, closestDistance);
        
        if(point == null)
        {
            for(var i = 0; i < this.wallChains.length; i++)
            {
                point = this.wallChains[i].getClosestPoint(x, y, closestDistance);
                if(point != null)
                {
                    return point;
                }
            }
        }
        
        return point;
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

function GuideLines(wallPoint)
{
    this.wallPoint = wallPoint;
    
    this.parametricLines = [];
    this.parametricLines.push(new ParametricLine(wallPoint.x, wallPoint.y, wallPoint.x + 1, wallPoint.y));
    this.parametricLines.push(new ParametricLine(wallPoint.x, wallPoint.y, wallPoint.x, wallPoint.y + 1));
    this.parametricLines.push(new ParametricLine(wallPoint.x, wallPoint.y, wallPoint.x + 1, wallPoint.y + 1));
    this.parametricLines.push(new ParametricLine(wallPoint.x, wallPoint.y, wallPoint.x + 1, wallPoint.y - 1));
    
    this.getClosestPoint = function(x, y)
    {
        var closestPoint = null;
        for(var i = 0; i < this.parametricLines.length; i++)
        {
            var point = this.parametricLines[i].getClosestPoint(x, y);
            if(i == 0 || point.distance < closestPoint.distance)
            {
                closestPoint = point;
            }
        }
        
        return closestPoint;
    }
}

var floorPlan = new FloorPlan();
var threePlan = new ThreePlan(floorPlan);