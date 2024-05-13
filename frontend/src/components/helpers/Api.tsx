// logout.ts
import { Dispatch } from 'redux';
import { setAuthentication } from "@app/store/reducers/auth";

const logout = (dispatch: Dispatch<any>) => {
        console.error('Unauthorized: You need to login!');
        dispatch(setAuthentication(undefined));
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('authentication');
        window.location.href = '/login';
   
};

export default logout;
