// import Cookies from 'universal-cookie';
// const cookies = new Cookies();
// const domain = window.domain;

// //#region �Τ�token
// const TOKEN_NAME = 'userToken';

// export const setAuthToken = (token) => {
//   //cookies.set(TOKEN_NAME, token, { HttpOnly: true, path: "/", domain: domain });
//   cookies.set(TOKEN_NAME, token, { HttpOnly: true, path: '/' });
// };
// export const getAuthToken = () => {
//   var token = cookies.get(TOKEN_NAME);
//   if (token != null) {
//     return token;
//   } else {
//     return null;
//   }
// };

// export const removeAuthToken = () => {
//   //cookies.remove(TOKEN_NAME, { path: "/", domain: domain });
//   cookies.remove(TOKEN_NAME, { path: '/' });
// };

// export const checkAuthToken = () => {
//   var token = cookies.get(TOKEN_NAME);
//   if (token != undefined && token != null) {
//     return true;
//   } else {
//     return false;
//   }
// };
// //#endregion
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';

const cookies = new Cookies();
const TOKEN_NAME = 'userToken';

// 设置 token
export const setAuthToken = (token) => {
  if (!token) {
    console.error('Attempting to set null or undefined token');
    return;
  }
  cookies.set(TOKEN_NAME, token, { path: '/' });
  console.log('Token set:', token);
};

// 获取 token
export const getAuthToken = () => {
  const token = cookies.get(TOKEN_NAME);
  console.log('Retrieved token:', token);
  return token || null;
};

// 移除 token
export const removeAuthToken = () => {
  cookies.remove(TOKEN_NAME, { path: '/' });
  console.log('Token removed');
};

// 检查 token 的有效性
export const checkAuthToken = () => {
  const token = getAuthToken();
  if (!token) {
    console.error('No token found.');
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    console.log('Decoded token:', decoded);
    const isExpired = decoded.exp < Date.now() / 1000;
    if (isExpired) {
      console.error('Token expired.');
      removeAuthToken();
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    removeAuthToken();
    return false;
  }
};
