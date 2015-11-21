// main.js
var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');


//todowawa: check bootstrap!!!

var CommentList = React.createClass({
  getInitialState: function() {
      return {stuff: []};
  },
  loadLoop: function()
  {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
          this.setState({stuff: data});
      }.bind(this),
      error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment)
  {
      var comments = this.state.stuff;
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({stuff: newComments});
    /*$.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({stuff: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });*/
  },
  componentDidMount: function()
  {
      this.loadLoop();
      setInterval(this.loadLoop, this.props.pollInterval);
  },
  render: function()
  {
      var comments = [];
      this.state.stuff.forEach(function(data) {
         comments.push(<CommentBox key={data.id} teststuff={data.name}>{data.text}</CommentBox>); 
      });
    return <div><CommentForm onCommentSent={this.handleCommentSubmit} />{comments}</div>;
  }
});

var CommentBox = React.createClass({
  render: function() {
      return (<h1>{this.props.teststuff}. {this.props.children}</h1>);
  }
});

var CommentForm = React.createClass({
    handleSubmit: function(e)
    {
      e.preventDefault();
      var name = this.refs.name.value.trim();
      var email = this.refs.email.value.trim();
      if(!name || !email)
          return;
      
      this.props.onCommentSent({id: 4, name: name, text: email});
      this.refs.name.value = '';
      this.refs.email.value = '';
      
      return;
    },
   render: function() {
     return (<form onSubmit={this.handleSubmit}>
               <input type="text" ref="name" placeholder="Your name" />
               <input type="text" ref="email" placeholder="Your email" />
               <input type="submit" value="Send" />
            </form>);
   }   
});


var Graphic = React.createClass({ 

  componentDidMount: function() {
    var context = this.getDOMNode().getContext('2d');
    this.paint(context);
  },

  componentDidUpdate: function() {
    var context = this.getDOMNode().getContext('2d');
    context.clearRect(0, 0, 200, 200);
    this.paint(context);
  },

  paint: function(context) {
    context.save();
    context.translate(100, 100);
    context.rotate(this.props.rotation, 100, 100);
    context.fillStyle = '#F00';
    context.fillRect(-50, -50, 100, 100);
    context.restore();
  },

  render: function() {
      console.error('render', 'render', 'render');
    return <canvas width={200} height={200} id={this.props.rotation} />;
  }

});

var App = React.createClass({

  getInitialState: function() {
    return { rotation: 0 };
  },

  componentDidMount: function() {
    requestAnimationFrame(this.tick);
  },

  tick: function() {
    this.setState({ rotation: this.state.rotation + .01 });
    requestAnimationFrame(this.tick);
  },

  render: function() {
    return <div><Graphic rotation={this.state.rotation} /></div>
  }

});


var MainComponent = React.createClass({
   render: function()
   {
       return <div>
                <CanvasComponent />
                <DropZoneComponent />
              </div>;
   }
});

var DropZoneComponent = React.createClass({
   onDragOver: function(e)
   {
     e.stopPropagation();
     e.preventDefault();
     e.dataTransfer.dropEffect = 'copy';
   },
   onDrop: function(e)
   {
     e.stopPropagation();
     e.preventDefault();
     
     var files = e.dataTransfer.files;
     for (var i = 0; i < files.length; i++)
     {
       if (!files[i].type.match('image.*'))
       {
         continue;
       }
       //todowawa: transfer this to the top as a state or something
       alert(URL.createObjectURL(files[i]));
     }
   },
   render: function()
   {
       return <div onDragOver={this.onDragOver} onDrop={this.onDrop}>{"Drop files here"}</div>;
   }
});

var CanvasComponent = React.createClass({
   mousePosition : {x : -1, y : -1},
   
   onClick : function(e)
   {
       //this.wawa = this.wawa + 1;
       //alert(this.wawa);
   },
   onMouseMove : function(e)
   {
     var offset =  $(this.refs.planCanvas).offset();
     var relativeX = (e.pageX - offset.left);
     var relativeY = (offset.top - e.pageY) * -1;
     
     // compute the best mousePosition with snapping
     this.mousePosition.x = relativeX;
     this.mousePosition.y = relativeY;
     
     this.context.save();
     this.context.strokeStyle = 'green';
     this.context.beginPath();
     this.context.moveTo(this.mousePosition.x - 5, this.mousePosition.y);
     this.context.lineTo(this.mousePosition.x + 5, this.mousePosition.y);
     this.context.stroke();
     this.context.beginPath();
     this.context.moveTo(this.mousePosition.x, this.mousePosition.y - 5);
     this.context.lineTo(this.mousePosition.x, this.mousePosition.y + 5);
     this.context.stroke();
     this.context.restore();
     
     this.contextBackground.save();
     this.contextBackground.strokeStyle = 'red';
     this.contextBackground.beginPath();
     this.contextBackground.moveTo(this.mousePosition.x - 5 + 5, this.mousePosition.y + 5);
     this.contextBackground.lineTo(this.mousePosition.x + 5 + 5, this.mousePosition.y + 5);
     this.contextBackground.stroke();
     this.contextBackground.beginPath();
     this.contextBackground.moveTo(this.mousePosition.x+5, this.mousePosition.y - 5+5);
     this.contextBackground.lineTo(this.mousePosition.x+5, this.mousePosition.y + 5+5);
     this.contextBackground.stroke();
     this.contextBackground.restore();
     
     //todowawa: have 2 canvases that overlap each other

     //context.clearRect(0, 0, $("#planCanvas").width(), $("#planCanvas").height());                      
     //context.drawImage(plan, 0, 0);
     //floorPlan.draw(context);
   },
   componentDidMount: function()
   {
     this.context = this.refs.planCanvas.getContext("2d");  
     this.contextBackground = this.refs.backgroundCanvas.getContext("2d");  
   },
   render: function()
   {
       return <div className="canvasContainer" style={{width: 500 + "px", height: 500 + "px"}}>
                <canvas ref="backgroundCanvas" width={500} height={500} style={{width: 500 + "px", height: 500 + "px"}} />
                <canvas ref="planCanvas" width={500} height={500} style={{width: 500 + "px", height: 500 + "px"}} onMouseMove={this.onMouseMove} onClick={this.onClick} />
              </div>;
   }   
    
});

ReactDOM.render(
  <MainComponent />,
  document.getElementById('example')
);