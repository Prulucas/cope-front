import axios from 'axios';

const api = axios.create({
    baseURL: 'https://cope-tools.onrender.com',
});

export default api;