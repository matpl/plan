var EventEmitter = require('events').EventEmitter;
import AppDispatcher from '../dispatcher/AppDispatcher';
import PlanConstants from '../constants/PlanConstants';

var CHANGE_EVENT = 'change';

let planState = {walls: [], image : null};

class PlanStore extends EventEmitter {

  constructor() {
    super();
  }

  getState() {
    return planState;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
}

let planStoreInstance = new PlanStore();

function addPoint(point) {
  if(planState.walls.length == 0) {
    planState.walls.push({id: 1, points: []});
  }

  var wall = planState.walls[planState.walls.length - 1];

  wall.points.push({id: wall.points.length + 1, x: point.x, y: point.y});
  if(wall.points.length > 1 && wall.points[0].x == wall.points[wall.points.length - 1].x && wall.points[0].y == wall.points[wall.points.length - 1].y) {
   // contour is done
   planState.walls.push({id: planState.walls.length + 1, points: []});
  }
}

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case PlanConstants.PLAN_ADD_POINT:
      addPoint(action.data);
      planStoreInstance.emitChange();
      break;
  }

});

export default planStoreInstance;
