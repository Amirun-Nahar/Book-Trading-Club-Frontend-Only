import axios from 'axios';
import notify from '@/lib/notify';


const axiosSecure = axios.create({
  baseURL: 'https://book-trading-club-backend-wine.vercel.app/',
  timeout: 30000, // Increased timeout to 30 seconds
  headers: { 'X-Custom-Header': 'foobar' },
});

// Global error notifications
axiosSecure.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show notifications for timeout errors or network errors
    // These are handled by individual components with better UX
    const isTimeoutError = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isNetworkError = error.code === 'ERR_NETWORK' || error.code === 'ERR_INTERNET_DISCONNECTED';
    
    if (isTimeoutError || isNetworkError) {
      // Let individual components handle these errors with better UX
      return Promise.reject(error);
    }
    
    // Only show notifications for actual API errors (4xx, 5xx)
    const status = error?.response?.status;
    if (status && status >= 400 && status < 600) {
      const message = error?.response?.data?.message || error?.message || 'Request failed';
      notify.error(message);
    }
    
    return Promise.reject(error);
  }
);

const UseAxiosSecure = () => {
  return axiosSecure;
};

export default UseAxiosSecure;
