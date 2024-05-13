import { UserManager, UserManagerSettings } from 'oidc-client-ts';
import { sleep } from './helpers';
import axios from 'axios';

declare const FB: any;

const GOOGLE_CONFIG: UserManagerSettings = {
  authority: 'https://accounts.google.com',
  client_id:
    '533830427279-cspigijdu0g50c7imca5pvdbrcn2buaq.apps.googleusercontent.com',
  client_secret: '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',
  redirect_uri: `${window.location.protocol}//${window.location.host}/callback`,
  scope: 'openid email profile',
  loadUserInfo: true,
};

export const authLogin = async (email: string, password: string) => {

  try {
    delete axios.defaults.headers.common["Authorization"];
    const response = await axios.post('/user/auth', {
      username: email,
      password: password
    });
    localStorage.setItem(
      'authentication',
      JSON.stringify({ profile: { email: 'engTest@eng.it' } })
    );

    return response.data; 
  } catch (error : any) {
    console.error('Login failed:', error);
    throw new Error(error.response.data.message || 'Unknown error occurred');
  }
};

export const getAuthStatus = () => {
  return new Promise(async (res, rej) => {
    await sleep(500);
    try {
      let authentication = localStorage.getItem('authentication');
      if (authentication) {
        authentication = JSON.parse(authentication);
        return res(authentication);
      }
      return res(undefined);
    } catch (error) {
      return res(undefined);
    }
  });
};
