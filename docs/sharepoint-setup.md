## SharePoint / Azure AD 연동 가이드

### 1. Azure AD 앱 등록
1. Azure Portal → Entra ID → App registrations → New registration
2. Redirect URL은 필요 없음. 등록 후 `Application (client) ID`, `Directory (tenant) ID` 복사
3. Certificates & secrets → New client secret 발급 (백엔드 `.env`의 `AZURE_CLIENT_SECRET`)
4. API permissions → Microsoft Graph → Application 권한에서 `Sites.ReadWrite.All` 추가 후 관리자 동의

### 2. SharePoint 대상 사이트/드라이브 ID 조회
1. SharePoint 사이트 URL 예: `https://{tenant}.sharepoint.com/sites/Operations`
2. `GET https://graph.microsoft.com/v1.0/sites/{hostname}:/sites/Operations` → `id` 값을 `.env`의 `SHAREPOINT_SITE_ID`에 입력
3. 문서 라이브러리의 드라이브 ID: `GET https://graph.microsoft.com/v1.0/sites/{siteId}/drives`
4. 대상 문서 라이브러리(Display Name: `ProductInspections`)의 `id`를 `SHAREPOINT_DRIVE_ID`에 입력

### 3. 로컬 환경 변수
```
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
AZURE_TENANT_ID=<Directory (tenant) ID>
AZURE_CLIENT_ID=<Application (client) ID>
AZURE_CLIENT_SECRET=<Client secret value>
SHAREPOINT_SITE_ID=<Site GUID>
SHAREPOINT_DRIVE_ID=<Drive GUID>
SHAREPOINT_LIBRARY_NAME=ProductInspections
```

### 4. 라이브러리/컬럼 초기화
```
cd backend
npm install
npm run setup:sharepoint
```

스크립트는 문서 라이브러리를 생성(없을 경우)하고, 요구되는 컬럼(InspectionId, ProductCode, FrontUrl 등)을 모두 보장한다. 서버 시작 시 `SharePointClient.ensureLibraryColumns()`가 한 번 더 검증하므로 수동 개입 없이 컬럼을 유지한다.


