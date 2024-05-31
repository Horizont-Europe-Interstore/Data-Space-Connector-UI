import axios from 'axios';
import { setAuthentication } from '@app/store/reducers/auth';
import store from '@app/store/store';

const unsetGlobalHeader = () => {
  if (localStorage.getItem("token") == null) {
    axiosWithInterceptorInstance.defaults.headers.common["Authorization"] = null;
  }
}

const axiosWithInterceptorInstance = axios.create({
  baseURL: (window as any)["env"]["apiUrl"],
});

axiosWithInterceptorInstance.interceptors.response.use((response) => response, (error) => {
  if (error.response.status === 401) {
    console.error('Unauthorized: You need to login!');
    store.dispatch(setAuthentication(undefined));
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('authentication');
    unsetGlobalHeader();
    window.location.href = '/login';
  }
});

export default axiosWithInterceptorInstance;