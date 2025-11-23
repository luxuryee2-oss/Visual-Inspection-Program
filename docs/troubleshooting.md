# 문제 해결 가이드

## 회원가입/로그인 "서버에 연결할 수 없습니다" 오류

### 원인
배포된 프론트엔드(Vercel)에서 백엔드 서버에 연결할 수 없을 때 발생합니다.

### 해결 방법

#### 1. Vercel 환경 변수 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 프로젝트 선택

2. **Environment Variables 추가**
   - Settings → Environment Variables
   - "Add New" 클릭
   - 다음 입력:
     ```
     Name: VITE_API_URL
     Value: https://your-backend.railway.app/api
     ```
   - Environment: Production, Preview, Development 모두 선택
   - "Save" 클릭

3. **재배포**
   - Deployments 탭
   - 최신 배포 옆 "..." → "Redeploy"

#### 2. Railway 백엔드 확인

Railway에서 백엔드가 배포되어 있는지 확인:

1. **Railway 대시보드 접속**
   - https://railway.app 접속
   - 프로젝트 선택

2. **서비스 상태 확인**
   - "Deployments" 탭에서 최신 배포 상태 확인
   - "Settings" → "Networking"에서 Public URL 확인

3. **Health Check**
   - `https://your-backend.railway.app/healthz` 접속
   - `{"status":"ok"}` 응답이 나와야 함

#### 3. 로컬에서 테스트

배포 전 로컬에서 먼저 테스트:

```bash
# 터미널 1: 백엔드 실행
cd backend
npm run dev

# 터미널 2: 프론트엔드 실행
cd frontend
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 확인 방법

브라우저 개발자 도구(F12) → Console에서:
- `API Base URL: ...` 메시지 확인
- 에러 메시지 확인

### 빠른 체크리스트

- [ ] Railway 백엔드가 배포되어 있음
- [ ] Railway 백엔드 URL이 정상 작동함 (`/healthz` 테스트)
- [ ] Vercel에 `VITE_API_URL` 환경 변수가 설정됨
- [ ] Vercel 재배포 완료
- [ ] 브라우저 콘솔에서 API URL 확인

