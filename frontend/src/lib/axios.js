import axios from 'axios';

const apiPort = import.meta.env.VITE_BACKEND_API_PORT;
export const axiosInstance = axios.create({
    baseURL: apiPort,
    withCredentials: true,
});