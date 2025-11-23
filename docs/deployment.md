# 배포 가이드

가장 간단한 배포 방법을 단계별로 안내합니다.

## 추천 배포 방법

### 옵션 1: Vercel (프론트엔드) + Railway (백엔드) ⭐ 가장 간단

**장점:**
- 무료 티어 제공
- GitHub 연동으로 자동 배포
- 설정이 매우 간단

#### 프론트엔드 배포 (Vercel)

1. **GitHub에 코드 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Vercel 가입 및 배포**
   - https://vercel.com 접속
   - GitHub로 로그인
   - "Add New Project" 클릭
   - 저장소 선택
   - **중요**: "Configure Project" 클릭
   - **Root Directory**: `frontend` 선택 (또는 `frontend` 폴더로 변경)
   - **Framework Preset**: Vite 선택
   - **Build Command**: `npm run build` (자동 감지됨)
   - **Output Directory**: `dist` (자동 감지됨)
   - **Install Command**: `npm install` (자동 감지됨)
   - **Environment Variables** 추가:
     ```
     VITE_API_URL=https://your-backend-url.railway.app/api
     ```
   - "Deploy" 클릭
   
   **참고**: `frontend/vercel.json` 파일이 있으면 자동으로 설정이 적용됩니다.

#### 백엔드 배포 (Railway)

1. **Railway 가입**
   - https://railway.app 접속
   - GitHub로 로그인

2. **새 프로젝트 생성**
   - "New Project" → "Deploy from GitHub repo"
   - 저장소 선택
   - **Root Directory**: `backend` 선택

3. **환경 변수 설정**
   Railway 대시보드에서 "Variables" 탭:
   ```
   PORT=4000
   CLIENT_ORIGIN=https://your-frontend.vercel.app
   AZURE_TENANT_ID=your-tenant-id
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   SHAREPOINT_SITE_ID=your-site-id
   SHAREPOINT_DRIVE_ID=your-drive-id
   SHAREPOINT_LIBRARY_NAME=ProductInspections
   ```

4. **빌드 설정**
   - "Settings" → "Build Command": `npm install && npm run build`
   - "Start Command": `npm start`

5. **도메인 확인**
   - 배포 완료 후 Railway가 자동으로 도메인 제공
   - 예: `https://your-app.railway.app`
   - 이 URL을 프론트엔드의 `VITE_API_URL`에 설정

---

### 옵션 2: Render (풀스택) ⭐ 한 곳에서 모두

**장점:**
- 프론트엔드와 백엔드를 한 플랫폼에서 관리
- 무료 티어 제공

#### Render 배포

1. **Render 가입**
   - https://render.com 접속
   - GitHub로 로그인

2. **백엔드 배포**
   - "New" → "Web Service"
   - GitHub 저장소 연결
   - **Name**: `visual-inspection-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables** 추가 (옵션 1과 동일)

3. **프론트엔드 배포**
   - "New" → "Static Site"
   - GitHub 저장소 연결
   - **Name**: `visual-inspection-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://your-backend.onrender.com/api
     ```

---

### 옵션 3: Netlify (프론트엔드) + Render (백엔드)

Netlify는 프론트엔드 배포에 특화되어 있어 Vercel과 유사하게 사용 가능합니다.

---

## 배포 전 체크리스트

### 1. 환경 변수 확인
- [ ] Azure AD 앱 등록 완료
- [ ] SharePoint 사이트 ID 확인
- [ ] 모든 환경 변수 값 준비

### 2. 코드 준비
- [ ] `.env` 파일은 `.gitignore`에 포함 (민감 정보)
- [ ] `README.md` 업데이트
- [ ] 불필요한 파일 제거

### 3. CORS 설정 확인
백엔드의 `CLIENT_ORIGIN`이 프론트엔드 배포 URL과 일치하는지 확인

### 4. SharePoint 초기화
배포 후 백엔드에서 다음 명령 실행:
```bash
npm run setup:sharepoint
```

---

## 배포 후 확인사항

1. **프론트엔드 접속 테스트**
   - 배포된 URL로 접속
   - 콘솔에서 API 오류 확인

2. **백엔드 Health Check**
   - `https://your-backend-url/healthz` 접속
   - 200 응답 확인

3. **SharePoint 연동 테스트**
   - 실제 업로드 테스트
   - SharePoint 문서 라이브러리 확인

---

## 무료 티어 제한사항

### Vercel
- 대역폭: 100GB/월
- 빌드 시간: 6000분/월
- 충분히 사용 가능

### Railway
- 월 $5 크레딧 (무료 티어)
- 사용량에 따라 제한
- 개발/테스트 용도로 충분

### Render
- 무료 티어는 15분 비활성 시 슬리프 모드
- 첫 요청 시 깨어나는 시간 소요
- 프로덕션에는 유료 플랜 권장

---

## 문제 해결

### CORS 오류
- 백엔드 `CLIENT_ORIGIN`이 정확한 프론트엔드 URL인지 확인
- 프로토콜(`http` vs `https`) 일치 확인

### 환경 변수 오류
- 배포 플랫폼의 환경 변수 설정 확인
- 변수명 대소문자 확인

### 빌드 실패
- 로컬에서 `npm run build` 성공 확인
- 배포 플랫폼의 Node.js 버전 확인 (18 이상 필요)

---

## 빠른 시작 (Vercel + Railway)

1. GitHub에 코드 푸시
2. Vercel에서 프론트엔드 배포 (5분)
3. Railway에서 백엔드 배포 (10분)
4. 환경 변수 설정
5. 완료!

**총 소요 시간: 약 15-20분**

