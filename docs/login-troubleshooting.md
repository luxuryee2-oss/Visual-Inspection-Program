# 로그인 문제 해결 가이드

## 기본 계정 정보

- **사용자명**: `inspector1`
- **비밀번호**: `password123`

## 로그인이 안 되는 경우

### 1단계: 브라우저 콘솔 확인

1. **F12** 키를 눌러 개발자 도구 열기
2. **Console** 탭 확인
   - 에러 메시지 확인
   - `API Base URL: ...` 메시지 확인
3. **Network** 탭 확인
   - `/api/auth/login` 요청 찾기
   - 요청 상태 코드 확인 (200, 400, 401, 405, 500 등)
   - Response 탭에서 서버 응답 확인

### 2단계: 문제 진단

#### 문제 1: 405 Method Not Allowed
**원인**: Vercel 환경 변수가 설정되지 않음
**해결**: 
1. Vercel Settings → Environment Variables
2. `VITE_API_URL` 추가 (Railway 백엔드 URL)
3. 재배포

#### 문제 2: 네트워크 에러 (ERR_CONNECTION_REFUSED, ERR_FAILED)
**원인**: 백엔드 서버가 배포되지 않았거나 실행되지 않음
**해결**:
1. Railway에서 백엔드 배포 확인
2. `https://your-backend.railway.app/healthz` 접속 테스트
3. `{"status":"ok"}` 응답이 나와야 함

#### 문제 3: 401 Unauthorized
**원인**: 사용자명 또는 비밀번호가 잘못됨
**해결**:
- 사용자명: `inspector1` (정확히 입력)
- 비밀번호: `password123` (정확히 입력)
- 대소문자 구분 확인

#### 문제 4: 400 Bad Request
**원인**: 요청 데이터 형식 문제
**해결**: 브라우저 콘솔에서 에러 메시지 확인

### 3단계: 빠른 확인

#### Railway 백엔드 확인
```bash
# 브라우저에서 직접 접속
https://your-backend.railway.app/healthz
```
→ `{"status":"ok"}` 응답이 나와야 함

#### Vercel 환경 변수 확인
브라우저 콘솔에서:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```
→ Railway URL이 출력되어야 함

### 4단계: 로컬에서 테스트

배포 환경에서 문제가 계속되면 로컬에서 먼저 테스트:

```bash
# 터미널 1: 백엔드 실행
cd backend
npm run dev

# 터미널 2: 프론트엔드 실행
cd frontend
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 로그인 테스트

## 체크리스트

- [ ] 브라우저 콘솔에서 에러 메시지 확인 완료
- [ ] Network 탭에서 `/api/auth/login` 요청 상태 확인 완료
- [ ] Railway 백엔드가 배포되어 있음
- [ ] Railway 백엔드 URL이 정상 작동함 (`/healthz` 테스트)
- [ ] Vercel에 `VITE_API_URL` 환경 변수가 설정됨
- [ ] Vercel 재배포 완료
- [ ] 사용자명과 비밀번호를 정확히 입력함

## 여전히 안 되면?

브라우저 콘솔의 다음 정보를 알려주세요:
1. Console 탭의 에러 메시지
2. Network 탭의 `/api/auth/login` 요청:
   - Status Code
   - Response 내용
   - Request Payload

