
import React from 'react';

export default class DropZoneComponent extends React.Component {
   onDragOver(e) {
     e.stopPropagation();
     e.preventDefault();
     e.dataTransfer.dropEffect = 'copy';
   }
   onDrop(e) {
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
   }
   render() {
       return <div onDragOver={this.onDragOver} onDrop={this.onDrop}>{"Drop files here"}</div>;
   }
}
