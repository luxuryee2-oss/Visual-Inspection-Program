# 회원가입 실패 디버깅 가이드

## 문제 진단 단계

### 1. 브라우저 개발자 도구 확인

1. **F12** 키를 눌러 개발자 도구 열기
2. **Console** 탭 확인
   - `회원가입 에러 상세:` 메시지 확인
   - 에러 객체의 전체 내용 확인
3. **Network** 탭 확인
   - `/api/auth/register` 요청 찾기
   - 요청 상태 코드 확인 (200, 400, 500 등)
   - Response 탭에서 서버 응답 확인

### 2. 백엔드 로그 확인

백엔드 터미널에서 다음 메시지 확인:
- `회원가입 요청 받음` - 요청이 도착했는지 확인
- `필수 필드 누락` - 입력 데이터 문제
- `이미 존재하는 사용자명` - 중복 사용자명
- `사용자 등록 완료` - 성공
- `사용자 등록 실패` - 에러 발생

### 3. 일반적인 원인

#### 원인 1: 백엔드 서버 미실행
**증상**: Network 탭에서 요청이 실패하거나 타임아웃
**해결**: 백엔드 서버 실행 확인
```bash
cd backend
npm run dev
```

#### 원인 2: CORS 오류
**증상**: Console에 CORS 관련 에러
**해결**: `backend/src/config/env.ts`에서 `CLIENT_ORIGIN` 확인

#### 원인 3: 필수 필드 누락
**증상**: 백엔드 로그에 "필수 필드 누락"
**해결**: 이름, 사용자명, 비밀번호 모두 입력 확인

#### 원인 4: 중복 사용자명
**증상**: "이미 존재하는 사용자명입니다." 메시지
**해결**: 다른 사용자명 사용

#### 원인 5: 서버 내부 오류
**증상**: 500 에러 또는 백엔드 로그에 에러 스택
**해결**: 백엔드 로그의 에러 메시지 확인

## 빠른 테스트

### 백엔드 직접 테스트 (Postman 또는 curl)

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","name":"테스트","password":"test123"}'
```

성공 응답:
```json
{
  "id": "2",
  "username": "testuser",
  "name": "테스트",
  "role": "inspector"
}
```

### 프론트엔드에서 확인

브라우저 콘솔에서:
```javascript
// API URL 확인
console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:4000/api');

// 직접 API 호출 테스트
fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'test', name: '테스트', password: 'test123'})
}).then(r => r.json()).then(console.log).catch(console.error);
```

