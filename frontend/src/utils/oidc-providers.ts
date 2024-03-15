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

//export const GoogleProvider = new UserManager(GOOGLE_CONFIG);

 /* const facebookLogin = () => {
  return new Promise((res, rej) => {
    let authResponse: any;
    FB.login(
      (r: any) => {
        if (r.authResponse) {
          authResponse = r.authResponse;
          FB.api(
            '/me?fields=id,name,email,picture.width(640).height(640)',
            (profileResponse: any) => {
              authResponse.profile = profileResponse;
              authResponse.profile.picture = profileResponse.picture.data.url;
              res(authResponse);
            }
          );
        } else {
          console.log('User cancelled login or did not fully authorize.');
          rej(undefined);
        }
      },
      { scope: 'public_profile,email' }
    );
  });
}; */

 /* const getFacebookLoginStatus = () => {
  return new Promise((res, rej) => {
    let authResponse: any = {};
    FB.getLoginStatus((r: any) => {
      if (r.authResponse) {
        authResponse = r.authResponse;
        FB.api(
          '/me?fields=id,name,email,picture.width(640).height(640)',
          (profileResponse: any) => {
            authResponse.profile = profileResponse;
            authResponse.profile.picture = profileResponse.picture.data.url;
            res(authResponse);
          }
        );
      } else {
        res(undefined);
      }
    });
  });
}; */

export const authLogin = async (email: string, password: string) => {

  try {
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


  /* return new Promise(async (res, rej) => {
    await sleep(500);
    if (email === 'admin@example.com' && password === 'admin') {
      localStorage.setItem(
        'authentication',
        JSON.stringify({ profile: { email: 'admin@example.com' } })
      );
      return res({ profile: { email: 'admin@example.com' } });
    }
    return rej({ message: 'Credentials are wrong!' });
  }); */
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
