import { LOGIN_ACTION, LOGOUT_ACTION, API_URL } from '../constants';
import axios from 'axios';

export const login = (username, password) => {
  return dispatch => {
    return axios.post(API_URL + "api/api-token-auth/",
      username,
      password
    ).then(res => {
      localStorage.setItem('authToken', res.data.token);
      setAuthToken(res.data.token);
      dispatch({ type: LOGIN_ACTION, user: { user_id: res.data.user_id, first_name: res.data.first_name } });
    })
  }
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

export const checkAuthentication = (token) => async (dispatch) => {
  await setAuthToken(token);
  // return dispatch => {
  return await axios.get(API_URL + "api/api-token-auth-check/").then(
    res => {
      dispatch({ type: LOGIN_ACTION, user: { user_id: res.data.user_id, first_name: res.data.first_name } });
    },
    errors => {
      setAuthToken(false);
      localStorage.removeItem("authToken");
      dispatch({ type: LOGOUT_ACTION });
    })
  // }
}

export const logout = () => {
  return dispatch => {
    return axios.get(API_URL + "api/user/logout").then(
      res => {
        setAuthToken(false);
        localStorage.removeItem("authToken");
        dispatch({ type: LOGOUT_ACTION });
      })
  }
}