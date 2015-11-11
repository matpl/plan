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
}

function FloorPlan()
{
    this.exteriorWallChain = new WallChain();
    this.wallChains = [];
    
    this.draw = function(context)
    {
        if(this.exteriorWallChain.points.length  > 0)
        {
            drawArc(this.exteriorWallChain.points[0].x,this.exteriorWallChain.points[0].y * -1, context, 'blue');
            
            //todowawa: this should be in the draw() of WallChain
            context.beginPath();
            context.moveTo(this.exteriorWallChain.points[0].x, this.exteriorWallChain.points[0].y * -1);
            for(i = 1; i < this.exteriorWallChain.points.length; i++)
            {
                context.lineTo(this.exteriorWallChain.points[i].x, this.exteriorWallChain.points[i].y * -1);
                context.strokeStyle = 'blue';
                context.stroke();
                
                if(i == this.exteriorWallChain.points.length - 1)
                {
                    // only if the last point is not the same as the first one
                    if(this.exteriorWallChain.points[i] != this.exteriorWallChain.points[0])
                    {
                        drawArc(this.exteriorWallChain.points[i].x, this.exteriorWallChain.points[i].y * -1, context);   
                    }
                }
            }
        }
        
        /*for(i = 0; i < this.walls.length; i++)
        {
            drawArc(this.walls[i].x1,this.walls[i].y1 * -1, context);
            
            context.beginPath();
            context.moveTo(this.walls[i].x1, this.walls[i].y1 * -1);
            context.lineTo(this.walls[i].x2, this.walls[i].y2 * -1);
            context.strokeStyle = 'green';
            context.stroke();
            
            drawArc(this.walls[i].x2, this.walls[i].y2 * -1, context);
        }*/
    }
}

var floorPlan = new FloorPlan();