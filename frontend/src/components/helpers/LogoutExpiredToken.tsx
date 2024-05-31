// logout.ts
import { setAuthentication } from "@app/store/reducers/auth";
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import axiosWithInterceptorInstance from "./AxiosConfig";

const unsetGlobalHeader = () => {
    if (localStorage.getItem("token") == null) {
      delete axiosWithInterceptorInstance.defaults.headers.common["Authorization"];
    }
  }

const LogoutExpiredToken = (errorValue: any) => {
    console.log(errorValue)
    const error = errorValue as AxiosError
    const dispatch = useDispatch();
    if (error.response && error.response.status === 401) {

        console.error('Unauthorized: You need to login!');
        dispatch(setAuthentication(undefined));
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('authentication');
        window.location.href = '/login';
        unsetGlobalHeader()
        
    }
};

export default LogoutExpiredToken;
