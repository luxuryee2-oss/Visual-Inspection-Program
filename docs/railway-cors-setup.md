# Railway CORS 설정 가이드

## 문제
CORS 오류: `The 'Access-Control-Allow-Origin' header has a value 'https://railway.com' that is not equal to the supplied origin.`

## 해결 방법

### Railway 환경 변수 설정

1. **Railway 대시보드 접속**
   - https://railway.app 접속
   - 백엔드 프로젝트 선택

2. **Variables 탭 클릭**

3. **CLIENT_ORIGIN 수정**
   - `CLIENT_ORIGIN` 찾기
   - 값 수정:
     ```
     https://visual-inspection-program.vercel.app
     ```
   - ⚠️ **주의**: `https://railway.com`이 아닌 **Vercel 프론트엔드 URL**로 설정

4. **로컬 개발도 지원하려면** (선택사항):
   ```
   http://localhost:5173,https://visual-inspection-program.vercel.app
   ```
   - 쉼표로 여러 origin 구분 가능

5. **서비스 재시작**
   - Deployments 탭
   - 최신 배포 옆 "..." → "Redeploy"

## Vercel 환경 변수도 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 프로젝트 선택

2. **Environment Variables 확인**
   - Settings → Environment Variables
   - `VITE_API_URL` 확인
   - 값이 `https://your-backend.railway.app`이면 **실제 Railway URL**로 변경

3. **실제 Railway URL 확인**
   - Railway → 백엔드 프로젝트
   - Settings → Networking
   - Public Domain URL 복사

4. **Vercel 환경 변수 수정**
   - `VITE_API_URL` = 실제 Railway URL (예: `https://xxx.up.railway.app`)
   - ⚠️ 끝에 `/api` 붙이지 마세요!

5. **재배포**
   - Deployments → 최신 배포 → "..." → "Redeploy"

## 확인

### Railway 확인
Railway Variables 탭에서:
- `CLIENT_ORIGIN` = `https://visual-inspection-program.vercel.app`

### Vercel 확인
브라우저 콘솔(F12)에서:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```
→ 실제 Railway URL 출력되어야 함

## 빠른 체크리스트

- [ ] Railway `CLIENT_ORIGIN` = `https://visual-inspection-program.vercel.app`
- [ ] Vercel `VITE_API_URL` = 실제 Railway URL
- [ ] Railway 서비스 재시작 완료
- [ ] Vercel 재배포 완료
- [ ] 브라우저 캐시 삭제 (Ctrl+Shift+Delete)

