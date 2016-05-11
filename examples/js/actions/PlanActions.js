
import AppDispatcher from '../dispatcher/AppDispatcher';
import PlanConstants from '../constants/PlanConstants';

export default class PlanActions {
  static addPoint(point) {
    AppDispatcher.dispatch({
      actionType: PlanConstants.PLAN_ADD_POINT,
      data: point
    });
  }
}
