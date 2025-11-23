# Prisma 빠른 시작 가이드

## ✅ Prisma 전환 완료

인메모리 저장소에서 Prisma + PostgreSQL로 전환했습니다.

## 로컬 개발 설정

### 1. PostgreSQL 준비

**옵션 A: Docker 사용 (추천)**
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

**옵션 B: 로컬 PostgreSQL 설치**
- https://www.postgresql.org/download/ 에서 설치

### 2. 환경 변수 설정

`backend/.env` 파일 생성 (`.env.example` 참고):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/visual_inspection?schema=public"
```

### 3. 데이터베이스 생성

PostgreSQL에 접속하여 데이터베이스 생성:
```sql
CREATE DATABASE visual_inspection;
```

또는 psql에서:
```bash
psql -U postgres
CREATE DATABASE visual_inspection;
```

### 4. 마이그레이션 실행

```bash
cd backend
npx prisma migrate dev --name init
```

### 5. 기본 사용자 생성

```bash
npm run prisma:seed
```

기본 계정:
- 사용자명: `inspector1`
- 비밀번호: `password123`

### 6. 서버 실행

```bash
npm run dev
```

## Railway 배포 설정

### 1. Railway에 PostgreSQL 추가

1. Railway 프로젝트 → "New" → "Database" → "Add PostgreSQL"
2. 자동으로 `DATABASE_URL` 환경 변수 생성됨

### 2. 배포 설정

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npx prisma migrate deploy && npm start
```

### 3. 배포 후 마이그레이션

Railway 터미널에서:
```bash
npx prisma migrate deploy
npm run prisma:seed
```

## Prisma 명령어

```bash
# Prisma Client 생성
npx prisma generate

# 마이그레이션 생성 및 적용 (개발)
npx prisma migrate dev

# 마이그레이션 적용 (프로덕션)
npx prisma migrate deploy

# Prisma Studio 실행 (DB GUI)
npx prisma studio

# 기본 사용자 생성
npm run prisma:seed
```

## 변경 사항

### ✅ 완료된 작업
- Prisma 설치 및 설정
- User, Product 모델 생성
- 인증 라우터 Prisma 전환
- 제품 라우터 Prisma 전환
- bcrypt 비밀번호 해싱
- 기본 사용자 시드 스크립트

### 📝 다음 단계
1. 로컬 PostgreSQL 설정
2. 마이그레이션 실행
3. Railway에 PostgreSQL 추가
4. 배포 및 마이그레이션

## 문제 해결

### DATABASE_URL 오류
- `.env` 파일에 `DATABASE_URL` 확인
- PostgreSQL 서버가 실행 중인지 확인

### 마이그레이션 실패
```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 리셋 (주의: 데이터 삭제)
npx prisma migrate reset
```

