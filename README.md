# Visual Inspection Program

제품 스캔 및 상·하·좌·우 사진 업로드를 통해 SharePoint 문서 라이브러리에 검사 기록을 저장하는 웹 애플리케이션입니다.

## 주요 기능

1. **제품 스캔**: 바코드/QR 코드 스캔 또는 수동 입력으로 제품 코드 등록
2. **4방향 이미지 업로드**: 정면, 후면, 좌측, 우측 사진 업로드
3. **SharePoint 연동**: Microsoft Graph API를 통한 자동 저장 및 메타데이터 관리
4. **검사 이력 조회**: 제품 코드별 최근 검사 기록 조회

## 기술 스택

### 백엔드
- Node.js + Express
- TypeScript
- Microsoft Graph API (SharePoint 연동)
- Azure AD 인증
- Jest (테스트)

### 프론트엔드
- React 19
- TypeScript
- Vite
- React Hook Form + Zod (폼 검증)
- TanStack Query (데이터 페칭)
- Axios

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- Azure AD 앱 등록 및 권한 설정 (Sites.ReadWrite.All)
- SharePoint 사이트 ID 및 문서 라이브러리 정보

### 환경 변수 설정

#### 백엔드 (`.env`)

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

# Azure AD 앱 등록 정보
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# SharePoint 설정
SHAREPOINT_SITE_ID=your-site-id
SHAREPOINT_DRIVE_ID=your-drive-id
SHAREPOINT_LIBRARY_NAME=ProductInspections
```

#### 프론트엔드 (`.env`)

```env
VITE_API_URL=http://localhost:4000/api
```

### 설치 및 실행

#### 백엔드

```bash
cd backend
npm install
npm run setup:sharepoint  # SharePoint 문서 라이브러리 및 컬럼 생성
npm run dev
```

#### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

### SharePoint 초기 설정

백엔드에서 다음 명령을 실행하여 문서 라이브러리와 메타데이터 컬럼을 자동 생성합니다:

```bash
cd backend
npm run setup:sharepoint
```

## 프로젝트 구조

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # 환경 변수 설정
│   │   ├── routes/           # API 라우트
│   │   ├── services/        # SharePoint 클라이언트
│   │   ├── scripts/          # 초기화 스크립트
│   │   └── utils/            # 유틸리티 (로거, 재시도)
│   └── tests/                # 테스트
├── frontend/
│   └── src/
│       ├── api/              # API 클라이언트
│       ├── components/       # React 컴포넌트
│       ├── hooks/            # 커스텀 훅
│       └── types/            # TypeScript 타입
└── docs/                     # 문서
```

## API 엔드포인트

### `POST /api/inspections`

제품 검사 기록 및 이미지 업로드

**요청**: multipart/form-data
- `productCode` (필수): 제품 코드
- `modelName`: 제품명
- `inspectedBy`: 검사자
- `notes`: 메모
- `front`, `back`, `left`, `right`: 이미지 파일 (각 최대 10MB)

**응답**:
```json
{
  "inspectionId": "uuid",
  "folderUrl": "https://sharepoint.com/...",
  "images": {
    "front": "url",
    "back": "url",
    "left": "url",
    "right": "url"
  }
}
```

### `GET /api/inspections?productCode=ABC123`

제품 코드별 검사 이력 조회

**응답**:
```json
{
  "items": [
    {
      "InspectionId": "uuid",
      "ProductCode": "ABC123",
      "ModelName": "제품명",
      "InspectedBy": "검사자",
      "CapturedAt": "2024-01-01T00:00:00Z",
      "Notes": "메모",
      "FrontUrl": "url",
      "BackUrl": "url",
      "LeftUrl": "url",
      "RightUrl": "url"
    }
  ]
}
```

## 테스트

```bash
cd backend
npm test
```

## 배포

### 빠른 배포 가이드

가장 간단한 배포 방법은 **Vercel (프론트엔드) + Railway (백엔드)** 조합입니다.

**상세 가이드**: [docs/deployment.md](docs/deployment.md) 참조

#### 빠른 시작 (5단계)

1. **GitHub에 코드 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Vercel에서 프론트엔드 배포**
   - https://vercel.com 접속
   - GitHub 저장소 연결
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Railway에서 백엔드 배포**
   - https://railway.app 접속
   - GitHub 저장소 연결
   - Root Directory: `backend`
   - 환경 변수 설정 (Azure AD, SharePoint 정보)

4. **환경 변수 연결**
   - 프론트엔드: `VITE_API_URL` = Railway 백엔드 URL
   - 백엔드: `CLIENT_ORIGIN` = Vercel 프론트엔드 URL

5. **완료!** 🎉

**예상 소요 시간: 15-20분**

### 다른 배포 옵션

- **Render**: 프론트엔드와 백엔드를 한 곳에서 관리
- **Netlify + Render**: Netlify는 프론트엔드에 특화
- **Azure**: Microsoft 생태계 통합

자세한 내용은 [docs/deployment.md](docs/deployment.md) 참조

## 라이선스

MIT

