# Prisma 설정 가이드

## Prisma를 사용하는 이유

### 현재 문제점
- 인메모리 사용자 저장소 사용
- 서버 재시작 시 사용자 정보 사라짐
- 제품 정보도 영구 저장 필요

### Prisma 도입 시 장점
- ✅ 데이터베이스에 영구 저장
- ✅ 서버 재시작해도 데이터 유지
- ✅ 사용자 및 제품 정보 안정적 관리
- ✅ Railway에서 PostgreSQL 무료 제공

## 구현 계획

### 1. 데이터베이스 선택
- **PostgreSQL** (추천): Railway에서 무료 제공
- **SQLite**: 로컬 개발용 (파일 기반)

### 2. Prisma 스키마 설계
```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  name      String
  password  String   // bcrypt 해시
  role      String   @default("inspector") // inspector | admin
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  uniqueCode  String   @unique
  productCode String
  productName String
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3. Railway에서 PostgreSQL 추가
1. Railway 프로젝트에서 "New" → "Database" → "Add PostgreSQL"
2. 자동으로 `DATABASE_URL` 환경 변수 생성됨

### 4. 구현 단계
1. Prisma 설치 및 초기화
2. 스키마 작성
3. 마이그레이션 실행
4. 인증 라우터를 Prisma로 전환
5. 제품 라우터를 Prisma로 전환

## 비용

- **Railway PostgreSQL**: 무료 티어 제공
- **Prisma**: 완전 무료 (오픈소스)

## 구현할까요?

Prisma를 도입하면:
- 사용자 정보 영구 저장
- 제품 정보도 DB에 저장
- 더 안정적인 시스템

구현을 진행할까요?

