## 제품 스캔 기록 요구정의

### 목표
- 제품 스캔(바코드/QR)과 상·하·좌·우 4장 사진을 업로드하여 SharePoint 문서 라이브러리에 저장
- 업로드 이력 및 메타데이터를 조회할 수 있는 웹 UI 제공

### 엔드투엔드 흐름
1. 사용자: 브라우저에서 제품을 스캔하거나 수동으로 제품 ID 입력
2. 프론트엔드: 상·하·좌·우 이미지 업로드 및 제품 메타데이터 입력
3. 백엔드: 업로드 파일을 받아 SharePoint Graph API로 전송, 메타데이터 컬럼 업데이트
4. SharePoint: 제품별 폴더에 이미지 저장, 문서 라이브러리 컬럼에 메타 정보 기록
5. 프론트엔드: 업로드 완료 후 SharePoint URL/미리보기 제공 및 이력 목록 노출

### 데이터 모델
| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `inspectionId` | string (UUID) | 업로드 레코드 고유 식별자 |
| `productCode` | string | 스캔하거나 수동 입력한 제품 번호/바코드 |
| `modelName` | string | 제품명 |
| `inspectedBy` | string | 검사자 이름 또는 ID |
| `capturedAt` | ISO datetime | 업로드 시간 (백엔드에서 기록) |
| `images.front` | string (URL) | SharePoint 내 정면 이미지 경로 |
| `images.back` | string | 후면 이미지 경로 |
| `images.left` | string | 좌측 이미지 경로 |
| `images.right` | string | 우측 이미지 경로 |
| `notes` | string | 선택 메모 |

### 스캔 및 업로드 UX 시나리오
- 사용자는 브라우저에서 `ScanPanel`을 열고 카메라 스캔 또는 외부 스캐너 입력으로 `productCode`를 채운다.
- 바코드 감지가 가능한 환경(BarcodeDetector 지원)에서는 실시간으로 프레임을 분석하여 감지된 첫 코드 값을 자동 입력하고, 감지 결과를 사용자에게 토스트 메시지로 보여준다.
- 제품 기본 정보(모델명, 검사자, 메모)를 입력한 뒤 상·하·좌·우 업로드 카드에서 이미지를 선택한다. 각 카드는 업로드 완료 전까지 에러 상태(빨간 테두리)를 표시하며, 모든 방향을 채워야 제출 버튼이 활성화된다.
- 업로드 도중에는 진행 상태를 버튼 텍스트로 노출하며, 완료 후에는 SharePoint 폴더 링크를 복사할 수 있는 피드백을 모달/토스트로 제공한다.

### SharePoint 문서 라이브러리 설계
- 문서 라이브러리: `ProductInspections`
- 제품 폴더 구조: `/ProductInspections/{productCode}/{inspectionId}/`
- 메타데이터 컬럼
  - `InspectionId` (Text)
  - `ProductCode` (Text, indexed)
  - `ModelName` (Text)
  - `InspectedBy` (Person or Text)
  - `CapturedAt` (DateTime)
  - `FrontUrl`, `BackUrl`, `LeftUrl`, `RightUrl` (Hyperlink)
  - `Notes` (Multiline Text)
- 파일명 규칙: `{direction}.{extension}` (예: `front.jpg`). 확장자는 업로드된 원본을 유지한다.
- 라이브러리 초기화 스크립트(`backend/src/scripts/ensureSharePointSetup.ts`)에서 컬럼이 없을 경우 자동 생성하며, 서버 구동 시에도 한번 더 검증한다.

### API 계약
`POST /api/inspections`
```json
{
  "productCode": "ABC12345",
  "modelName": "Industrial Pump",
  "inspectedBy": "lee",
  "notes": "표면 양호"
}
```
멀티파트 필드: `front`, `back`, `left`, `right` (JPEG/PNG)

응답:
```json
{
  "inspectionId": "uuid",
  "sharepointFolder": "https://{tenant}.sharepoint.com/.../productCode/uuid/",
  "images": {
    "front": "<url>",
    "back": "<url>",
    "left": "<url>",
    "right": "<url>"
  }
}
```

`GET /api/inspections?productCode=ABC123`
- SharePoint 검색 API를 사용하여 해당 제품의 최근 N개 업로드 메타데이터를 반환

### 비기능 요구
- 이미지당 최대 10MB, 전체 40MB 제한
- 업로드 실패 시 재시도(최대 3회) 및 롤백
- Azure AD 앱 권한 최소화 (Sites.ReadWrite.All)
- 감사 로그: 백엔드에서 성공/실패 이벤트 기록

