import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS!
import { host, projectFolder, schema } from './constants';

const axiosClient = axios.create({
    baseURL : `${schema}://${host}/${projectFolder}/public/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor (Optional: Add token automatically)
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Or wherever you store the token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        return response; // If successful, just return the response
    },
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API error:', error.response.data);

            // Use react-toastify to display a notification
            toast.error(error.response.data.message || 'An error occurred.', {
                autoClose: 5000, // Time in milliseconds until the toast disappears
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network error:', error.request);
            toast.error('Network error. Please check your connection.', {
                position: toast.POSITION.TOP_RIGHT,
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request error:', error.message);
            toast.error('An unexpected error occurred.', {
                position: toast.POSITION.TOP_RIGHT,
            });
        }

        return Promise.reject(error); // Re-throw the error
    }
);

export default axiosClient;