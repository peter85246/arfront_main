import Cookies from "universal-cookie";
const cookies = new Cookies();
const domain = window.domain;

//#region �Τ�token
const TOKEN_NAME = "userToken";

export const setAuthToken = (token) => {
  //cookies.set(TOKEN_NAME, token, { HttpOnly: true, path: "/", domain: domain });
  cookies.set(TOKEN_NAME, token, { HttpOnly: true, path: "/" });
};
export const getAuthToken = () => {
  var token = cookies.get(TOKEN_NAME);
  if (token != null) {
    return token;
  } else {
    return null;
  }
};

export const removeAuthToken = () => {
  //cookies.remove(TOKEN_NAME, { path: "/", domain: domain });
  cookies.remove(TOKEN_NAME, { path: "/" });
};

export const checkAuthToken = () => {
  var token = cookies.get(TOKEN_NAME);
  if (token != undefined && token != null) {
    return true;
  } else {
    return false;
  }
};
//#endregion
