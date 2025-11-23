# Vercel 404 오류 해결 가이드

## 문제 원인

Vercel에서 404 오류가 발생하는 주요 원인:
1. Root Directory 설정 오류
2. 빌드 출력 디렉토리 설정 오류
3. SPA 라우팅 설정 누락

## 해결 방법

### 방법 1: Vercel 설정 파일 사용 (권장) ✅

프로젝트에 `frontend/vercel.json` 파일이 추가되었습니다. 
이 파일이 있으면 Vercel이 자동으로 설정을 인식합니다.

**다음 단계:**
1. GitHub에 푸시된 코드 확인
2. Vercel 대시보드에서 "Redeploy" 클릭
3. 또는 자동으로 재배포됨 (GitHub 푸시 시)

### 방법 2: Vercel 대시보드에서 수동 설정

1. **Vercel 프로젝트 설정으로 이동**
   - 프로젝트 선택 → Settings → General

2. **Root Directory 설정**
   - "Root Directory" 섹션에서 "Edit" 클릭
   - `frontend` 입력
   - "Save" 클릭

3. **Build & Development Settings 확인**
   - Framework Preset: `Vite` 선택
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **재배포**
   - Deployments 탭으로 이동
   - 최신 배포 옆 "..." 메뉴 → "Redeploy"

### 방법 3: 프로젝트 삭제 후 재생성

1. Vercel 대시보드에서 프로젝트 삭제
2. "Add New Project" 클릭
3. 저장소 선택
4. **중요**: "Configure Project" 클릭
5. Root Directory: `frontend` 선택
6. 나머지 설정은 자동 감지됨
7. Environment Variables 추가:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
8. "Deploy" 클릭

## 확인 사항

배포 후 다음을 확인하세요:

1. **빌드 로그 확인**
   - Deployments → 최신 배포 → Build Logs
   - 에러가 있는지 확인

2. **빌드 성공 여부**
   - "Build Completed" 메시지 확인
   - 빌드 시간 확인

3. **환경 변수 확인**
   - Settings → Environment Variables
   - `VITE_API_URL`이 설정되어 있는지 확인

## 예상 결과

정상적으로 배포되면:
- ✅ 빌드 성공
- ✅ 배포 URL 접속 시 앱이 정상 작동
- ✅ 404 오류 없음

## 추가 문제 해결

### 빌드 실패 시

1. **로컬에서 빌드 테스트**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   - 로컬에서 성공하면 Vercel에서도 성공해야 함

2. **Node.js 버전 확인**
   - Vercel Settings → General → Node.js Version
   - 18 이상 권장

3. **의존성 문제**
   - `package-lock.json`이 있는지 확인
   - GitHub에 커밋되어 있는지 확인

### 여전히 404가 발생하면

1. **브라우저 캐시 삭제**
   - Ctrl + Shift + R (강력 새로고침)

2. **배포 URL 확인**
   - Vercel이 제공한 URL이 맞는지 확인
   - 커스텀 도메인 사용 시 DNS 설정 확인

3. **Vercel 로그 확인**
   - Functions 탭에서 런타임 에러 확인

## 연락처

문제가 계속되면:
- Vercel 문서: https://vercel.com/docs
- Vercel 커뮤니티: https://github.com/vercel/vercel/discussions

