# Vercel 환경 변수 설정 가이드

## 문제: 405 Method Not Allowed 에러

배포된 사이트에서 회원가입/로그인 시 405 에러가 발생하는 경우, Vercel 환경 변수가 설정되지 않았습니다.

## 해결 방법

### 1. Railway 백엔드 URL 확인

1. Railway 대시보드 접속: https://railway.app
2. 프로젝트 선택
3. **Settings** → **Networking** 탭
4. **Public Domain** 또는 **Custom Domain** 확인
   - 예: `https://your-backend.railway.app`

### 2. Vercel 환경 변수 설정

1. Vercel 대시보드 접속: https://vercel.com
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭
4. **Add New** 클릭
5. 다음 입력:
   ```
   Name: VITE_API_URL
   Value: https://your-backend.railway.app
   ```
   ⚠️ **주의**: `/api`를 붙이지 마세요! (자동으로 추가됩니다)
6. **Environment** 선택:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
7. **Save** 클릭

### 3. 재배포

1. **Deployments** 탭으로 이동
2. 최신 배포 옆 **"..."** 메뉴 클릭
3. **Redeploy** 선택
4. 배포 완료 대기 (약 1-2분)

### 4. 확인

브라우저 콘솔(F12)에서 확인:
```
✅ API Base URL: https://your-backend.railway.app/api
```

이 메시지가 보이면 정상입니다.

## 환경 변수 형식

### 올바른 형식
```
VITE_API_URL=https://your-backend.railway.app
```

### 잘못된 형식
```
VITE_API_URL=https://your-backend.railway.app/api  ❌ (중복)
VITE_API_URL=http://localhost:4000                 ❌ (로컬은 자동 감지)
```

## 문제 해결 체크리스트

- [ ] Railway 백엔드가 배포되어 있음
- [ ] Railway Public URL 확인 완료
- [ ] Vercel에 `VITE_API_URL` 환경 변수 설정 완료
- [ ] 환경 변수 값이 올바름 (끝에 `/api` 없음)
- [ ] Production, Preview, Development 모두 선택
- [ ] Vercel 재배포 완료
- [ ] 브라우저 콘솔에서 API URL 확인

## 빠른 테스트

브라우저 콘솔에서:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

설정이 올바르면 Railway URL이 출력됩니다.

