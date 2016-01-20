
import React from 'react';

export default class ToolsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  onChange(e) {
    alert('yo');
    if(this.refs.wall.checked) {
      alert('wall');
    } else if(this.refs.manipulation.checked) {
      alert('manipulation');
    }
  }
  render() {
    return <div className='btn-group' data-toggle='buttons'>
             <label className='btn btn-default'>
               <input type='radio' ref='wall' name='tool' onChange={this.onChange} value='wall'></input>Wall
             </label>
             <label className='btn btn-default'>
               <input type='radio' ref='manipulation' name='tool' onChange={this.onChange} value='manipulation'></input>Manipulation
             </label>
           </div>;
  }
};
