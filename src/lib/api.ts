import axios from "axios";

type Callback<T> = (error: string | null, result: T | null) => void;

export const api = <T = any>(
  url: string,
  auth_token: string | null = null,
  options: {} | null = null,
  callback: Callback<T>
): void => {
  const baseURL = process.env['BACKEND_URL'];
  const params = auth_token ? { auth_token, ...options } : { ...options };

  axios
    .post<T>(`${baseURL}${url}`, params, { withCredentials: true })
    .then((result) => {
      callback(null, result.data);
    })
    .catch((error) => {
      callback(error.message, null);
    });
};
