import axios from 'axios';

// API URL 설정: 환경 변수가 없으면 로컬 개발 서버 사용
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // 환경 변수가 있으면 사용 (끝에 /api가 없으면 추가)
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  // 로컬 개발 환경
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:4000/api';
  }
  // 배포 환경에서는 환경 변수 필수
  console.error('❌ VITE_API_URL이 설정되지 않았습니다!');
  console.error('Vercel Settings → Environment Variables에서 VITE_API_URL을 설정하세요.');
  console.error('예: https://your-backend.railway.app');
  console.error('현재 요청이 Vercel 도메인으로 가고 있어 405 에러가 발생합니다.');
  // 상대 경로를 사용하면 Vercel 도메인으로 가므로 에러 발생
  // 환경 변수가 없으면 명시적으로 에러 표시
  throw new Error('VITE_API_URL 환경 변수가 설정되지 않았습니다. Vercel Settings에서 설정하세요.');
};

let apiBaseUrl: string;
try {
  apiBaseUrl = getApiUrl();
  console.log('✅ API Base URL:', apiBaseUrl);
} catch (error) {
  console.error('❌ API URL 설정 실패:', error);
  // 배포 환경에서 환경 변수가 없으면 명확한 에러 표시
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocal) {
    // 배포 환경: 임시로 상대 경로 사용 (테스트 모드)
    apiBaseUrl = '/api';
    console.warn('⚠️ 테스트 모드: Vercel 환경 변수가 설정되지 않았습니다.');
    console.warn('백엔드 기능은 작동하지 않지만, UI 테스트는 가능합니다.');
    console.warn('Vercel Settings → Environment Variables → VITE_API_URL 설정 필요');
  } else {
    // 로컬 개발 환경
    apiBaseUrl = 'http://localhost:4000/api';
    console.warn('⚠️ 기본값 사용:', apiBaseUrl);
  }
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

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

