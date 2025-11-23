# Prisma 마이그레이션 가이드

## Prisma 전환 완료 ✅

인메모리 저장소에서 Prisma + PostgreSQL로 전환했습니다.

## 변경 사항

### 1. 데이터베이스 모델
- **User**: 사용자 정보 (username, name, password, role)
- **Product**: 제품 정보 (uniqueCode, productCode, productName, imageUrl)

### 2. 인증 시스템
- bcrypt로 비밀번호 해싱
- Prisma로 사용자 조회/생성

### 3. 제품 관리
- Prisma로 제품 정보 영구 저장

## 로컬 개발 설정

### 1. PostgreSQL 설치 또는 Docker 사용

**옵션 1: Docker 사용 (추천)**
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

**옵션 2: 로컬 PostgreSQL 설치**
- https://www.postgresql.org/download/ 에서 설치

### 2. 환경 변수 설정

`backend/.env` 파일에 추가:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/visual_inspection?schema=public"
```

### 3. 마이그레이션 실행

```bash
cd backend
npm run prisma:migrate
```

마이그레이션 이름을 입력하세요 (예: `init`)

### 4. 기본 사용자 생성

```bash
npm run prisma:seed
```

기본 계정이 생성됩니다:
- 사용자명: `inspector1`
- 비밀번호: `password123`

## Railway 배포 설정

### 1. Railway에 PostgreSQL 추가

1. Railway 프로젝트에서 "New" → "Database" → "Add PostgreSQL"
2. 자동으로 `DATABASE_URL` 환경 변수 생성됨

### 2. 환경 변수 확인

Railway Variables 탭에서 `DATABASE_URL`이 있는지 확인

### 3. 배포 전 마이그레이션

Railway 배포 시 자동으로 마이그레이션이 실행되도록 설정:

**Railway Settings → Deploy → Build Command:**
```bash
npm install && npm run prisma:generate && npm run build
```

**Railway Settings → Deploy → Start Command:**
```bash
npx prisma migrate deploy && npm start
```

또는 배포 후 수동으로 마이그레이션:
```bash
npx prisma migrate deploy
```

### 4. 기본 사용자 생성 (배포 후)

Railway 터미널에서:
```bash
npm run prisma:seed
```

## Prisma 명령어

```bash
# Prisma Client 생성
npm run prisma:generate

# 마이그레이션 생성 및 적용 (개발)
npm run prisma:migrate

# 마이그레이션 적용 (프로덕션)
npx prisma migrate deploy

# Prisma Studio 실행 (DB GUI)
npm run prisma:studio

# 기본 사용자 생성
npm run prisma:seed
```

## 문제 해결

### 마이그레이션 실패 시
```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 리셋 (주의: 데이터 삭제됨)
npx prisma migrate reset
```

### DATABASE_URL 오류
- `.env` 파일에 `DATABASE_URL`이 올바르게 설정되었는지 확인
- Railway에서 `DATABASE_URL` 환경 변수가 있는지 확인

## 다음 단계

1. 로컬에서 PostgreSQL 설정
2. 마이그레이션 실행
3. 기본 사용자 생성
4. Railway에 PostgreSQL 추가
5. 배포 및 마이그레이션

