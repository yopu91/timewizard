import axios from 'axios';
import store from 'store';
import { apiRoot } from 'config';
import history from 'services/History';

const instance = axios.create({
  baseURL: apiRoot,
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || (status >= 400 && status < 500);
  }
});

let authToken, pushToken;
let user, pendingUserRequest;

instance.setAuthToken = (token) => {
  authToken = token; 
  user = undefined;
  if (token) {
    store.set('authToken', token);
    instance.getUser();
  }
  else {
    store.remove('authToken');
    
  }
};

instance.setPushToken = (token) => {
  if (token) pushToken = token;
  if (pushToken && user) {
    instance.post('users/' + user.id + '/fcm', pushToken);
  }
};

instance.getUser = async (refresh) => {
  if (user && !refresh) return user;
  if (pendingUserRequest)
    return pendingUserRequest;
  else {
    
    pendingUserRequest = instance.get('users/me').then((res) => {
      if (res.status !== 200) throw new Error('Failed to get user');
      user = res.data;
      return user;
    });

    try {
      let result = await pendingUserRequest;
      instance.setPushToken();
      return result;
    }
    finally {
      pendingUserRequest = undefined;
    }

  }
};

instance.isAuthenticated = () => {
  return Boolean(authToken);
};

// Add a request interceptor
instance.interceptors.request.use((config) => {
  if (authToken) {
    config.headers['Authorization'] = 'Bearer ' + authToken;
  }
  return config;
});

// Add response interceptor
instance.interceptors.response.use(
  (response) => {

    // Handle not activated
    if (response.status === 412 && history.location.pathname !== '/activate') {
      history.push('/notactivated');
    }

    // Handle unauthorized
    if (response.status === 401) {
      instance.setAuthToken(null);
      history.push('/');
    }

   return response; 
  },
  async () => {}
);

instance.setAuthToken(store.get('authToken'));

export default instance;