# 🚨 405 에러 빠른 해결 가이드

## 문제
회원가입/로그인 시 405 (Method Not Allowed) 에러 발생

## 원인
Vercel 환경 변수 `VITE_API_URL`이 설정되지 않아 요청이 Vercel 도메인으로 가고 있음

## 해결 방법 (3단계)

### 1단계: Railway 백엔드 URL 확인
1. https://railway.app 접속
2. 프로젝트 선택
3. **Settings** → **Networking**
4. **Public Domain** 복사 (예: `https://xxx.railway.app`)

### 2단계: Vercel 환경 변수 설정
1. https://vercel.com 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. **Add New** 클릭
5. 입력:
   ```
   Name: VITE_API_URL
   Value: https://xxx.railway.app  (1단계에서 복사한 URL)
   ```
   ⚠️ **끝에 `/api` 붙이지 마세요!**
6. **Environment**: Production, Preview, Development 모두 체크
7. **Save** 클릭

### 3단계: 재배포
1. **Deployments** 탭
2. 최신 배포 옆 **"..."** → **Redeploy**
3. 완료 대기 (1-2분)

## 확인
브라우저 콘솔(F12)에서:
```
✅ API Base URL: https://xxx.railway.app/api
```

## 여전히 안 되면?
1. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
2. 하드 리프레시 (Ctrl+F5)
3. Vercel 재배포 다시 확인

