import axios from 'axios';

// API URL 설정: 환경 변수가 없으면 로컬 개발 서버 사용
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  // 로컬 개발 환경
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:4000/api';
  }
  // 배포 환경에서는 환경 변수 필수
  console.error('VITE_API_URL이 설정되지 않았습니다!');
  console.error('Vercel Settings → Environment Variables에서 VITE_API_URL을 설정하세요.');
  console.error('예: https://your-backend.railway.app/api');
  // 임시로 상대 경로 사용 (같은 도메인에 백엔드가 있는 경우)
  return '/api';
};

export const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000
});

console.log('API Base URL:', getApiUrl());

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 로깅
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 에러:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

