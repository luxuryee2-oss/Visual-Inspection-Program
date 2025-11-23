# Vercel 환경 변수 설정 - 단계별 가이드

## 🎯 목표
Vercel에 `VITE_API_URL` 환경 변수를 설정하여 백엔드 서버와 연결

## 📋 사전 준비
- Railway 백엔드가 배포되어 있어야 함
- Railway Public URL을 알고 있어야 함

---

## 1단계: Railway 백엔드 URL 확인

### 방법 1: Railway 대시보드에서 확인
1. https://railway.app 접속
2. 로그인 후 프로젝트 선택
3. 왼쪽 메뉴에서 **Settings** 클릭
4. **Networking** 탭 클릭
5. **Public Domain** 섹션에서 URL 확인
   - 예: `https://your-app-name.up.railway.app`
   - 또는 Custom Domain이 있다면 그것 사용

### 방법 2: Railway 서비스에서 확인
1. Railway 프로젝트에서 백엔드 서비스 선택
2. 상단의 **"..."** 메뉴 → **Settings**
3. **Networking** 탭에서 Public URL 확인

### 방법 3: 배포 로그에서 확인
1. Railway 프로젝트 → **Deployments** 탭
2. 최신 배포의 로그에서 URL 확인

---

## 2단계: Vercel 환경 변수 설정

### Step 1: Vercel 대시보드 접속
1. https://vercel.com 접속
2. 로그인 (GitHub 계정 사용)

### Step 2: 프로젝트 선택
1. 대시보드에서 **Visual Inspection Program** 프로젝트 클릭
   - 또는 프로젝트 이름이 다르다면 해당 프로젝트 선택

### Step 3: Settings로 이동
1. 상단 메뉴에서 **Settings** 클릭
2. 왼쪽 사이드바에서 **Environment Variables** 클릭

### Step 4: 환경 변수 추가
1. **"Add New"** 또는 **"Add"** 버튼 클릭
2. 다음 정보 입력:
   ```
   Key (Name): VITE_API_URL
   Value: https://your-backend.railway.app
   ```
   ⚠️ **중요**: 
   - Value에는 Railway에서 복사한 URL을 붙여넣기
   - 끝에 `/api`를 붙이지 마세요! (자동으로 추가됩니다)
   - `http://`가 아닌 `https://`로 시작해야 합니다

3. **Environment** 선택:
   - ✅ **Production** (체크)
   - ✅ **Preview** (체크)
   - ✅ **Development** (체크)
   - 모든 환경에 적용하려면 모두 체크

4. **Save** 또는 **Add** 버튼 클릭

### Step 5: 확인
환경 변수 목록에 `VITE_API_URL`이 추가되었는지 확인

---

## 3단계: 재배포

### 방법 1: 자동 재배포 (권장)
1. **Deployments** 탭으로 이동
2. 최신 배포 옆 **"..."** (점 3개) 메뉴 클릭
3. **"Redeploy"** 선택
4. 확인 대화상자에서 **"Redeploy"** 클릭
5. 배포 완료 대기 (보통 1-2분)

### 방법 2: 새 커밋으로 트리거
1. 코드에 작은 변경사항 추가 (예: 주석 추가)
2. Git 커밋 및 푸시
3. Vercel이 자동으로 재배포

---

## 4단계: 확인 및 테스트

### 브라우저 콘솔 확인
1. 배포된 사이트 접속
2. **F12** 키로 개발자 도구 열기
3. **Console** 탭 확인
4. 다음 메시지가 보여야 함:
   ```
   ✅ API Base URL: https://your-backend.railway.app/api
   ```

### 회원가입 테스트
1. 회원가입 페이지로 이동
2. 정보 입력 후 회원가입 시도
3. 405 에러가 사라지고 정상 작동해야 함

---

## ❌ 문제 해결

### 여전히 405 에러가 발생하면?

1. **환경 변수 확인**
   - Vercel Settings → Environment Variables
   - `VITE_API_URL`이 정확히 설정되어 있는지 확인
   - Value에 `/api`가 붙어있지 않은지 확인

2. **재배포 확인**
   - Deployments 탭에서 최신 배포가 완료되었는지 확인
   - 배포 로그에 에러가 없는지 확인

3. **브라우저 캐시 삭제**
   - Ctrl + Shift + Delete
   - 캐시된 이미지 및 파일 삭제
   - 또는 시크릿 모드로 테스트

4. **Railway 백엔드 확인**
   - Railway에서 백엔드가 실행 중인지 확인
   - `https://your-backend.railway.app/healthz` 접속 테스트
   - `{"status":"ok"}` 응답이 나와야 함

5. **CORS 설정 확인**
   - Railway 백엔드의 `CLIENT_ORIGIN` 환경 변수에 Vercel URL이 포함되어 있는지 확인

---

## 📝 체크리스트

- [ ] Railway 백엔드 URL 확인 완료
- [ ] Vercel에 `VITE_API_URL` 환경 변수 추가 완료
- [ ] Value에 `/api` 없이 URL만 입력 완료
- [ ] Production, Preview, Development 모두 선택 완료
- [ ] Vercel 재배포 완료
- [ ] 브라우저 콘솔에서 API URL 확인 완료
- [ ] 회원가입 테스트 성공

---

## 💡 팁

- 환경 변수는 배포 시점에 빌드에 포함됩니다
- 환경 변수를 변경한 후에는 반드시 재배포해야 합니다
- Preview 환경에서 먼저 테스트하는 것을 권장합니다

