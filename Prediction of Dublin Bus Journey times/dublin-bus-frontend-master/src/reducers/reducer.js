import { LOGIN_ACTION, LOGOUT_ACTION, SAVE_LEAP_DETAILS } from '../constants';
import { assign } from 'lodash';

const initialState = {
    isAuthenticated: false,
    user: {},
    leapCardAccountInfo: null
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_ACTION:
            return assign({}, state, {
                isAuthenticated: true,
                user: action.user
            });
        case LOGOUT_ACTION:
            return assign({}, state, {
                isAuthenticated: false,
                user: {}
            });
        case SAVE_LEAP_DETAILS:
            return assign({}, state, {
                leapCardAccountInfo: action.leapCardAccountInfo
            });
        default:
            return state;
    }
}

export default reducer;