var EventEmitter = require('events').EventEmitter;


export default class PlanStore extends EventEmitter {

  constructor() {
    super();
    this.walls = [];
    this.image = null;
  }

  getState() {
    return {walls: this.walls, image: this.image};
  }

  addChangeListener(callback) {
    this.on('sup all', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('sup all', callback);
  }
}
