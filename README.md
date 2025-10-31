# Toiletmap(가제) - 화장실 찾기 서비스

한국 수도권의 모든 화장실 정보를 제공하는 맵 기반 모바일 앱

## 프로젝트 개요

- **목적**: 수도권 지역 화장실 정보 제공 및 위치 기반 서비스
- **플랫폼**: Flutter 모바일 앱
- **백엔드**: Firebase (Cloud Firestore, Storage, Functions, Authentication)
- **지역**: 한국 수도권 (서울, 경기 등)

## 프로젝트 구조

```
toiletmap/
├── mobile/              # Flutter 앱 (별도 저장소 또는 디렉토리)
├── infra/
│   └── firebase/       # Firebase 백엔드 인프라
│       ├── functions/   # Cloud Functions (TypeScript)
│       ├── firestore.rules
│       ├── firestore.indexes.json
│       └── storage.rules
├── docs/                # 문서
│   ├── DATA_MODEL.md
│   └── FLUTTER_INTEGRATION.md
├── firebase.json        # Firebase 프로젝트 설정
└── .firebaserc         # Firebase 프로젝트 alias 설정
```

## 주요 기능

### 백엔드 (Firebase)
- ✅ 화장실 정보 관리 (Firestore)
- ✅ 리뷰 및 평점 시스템
- ✅ 이미지 업로드 (Storage)
- ✅ 사용자 인증 (Email/Password, Google, Anonymous)
- ✅ 즐겨찾기 기능
- ✅ 신고 시스템

### 앱 기능 (Flutter)
- 시작 화면: 앱 소개 및 주요 기능 안내
- 지도 보기: 현재 위치 주변 화장실 표시, 필터링 및 검색
- 화장실 상세 정보: 주소, 운영 시간, 편의시설 등
- 리뷰 및 평점: 사용자 리뷰 작성 및 조회
- 설정: 사용자 선호도, 알림 설정 등

## 환경 설정

### Firebase 프로젝트
- **dev**: `toiletmap-hu2chaso-dev` (개발 환경)
- **prod**: `toiletmap-hu2chaso-prod` (운영 환경)
- **리전**: asia-northeast3 (Seoul)

### Firebase 서비스
- **Firestore**: 데이터베이스 (서울 리전)
- **Storage**: 이미지 저장 (서울 리전)
- **Functions**: 서버리스 로직 (Node.js 20)
- **Authentication**: 사용자 인증

## 빠른 시작

### 필수 조건
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase 계정 및 프로젝트 설정

### Firebase CLI 설정
```bash
# 로그인
firebase login

# 프로젝트 선택
firebase use dev    # 개발 환경
firebase use prod   # 운영 환경
```

### 로컬 개발
```bash
# 에뮬레이터 실행
firebase emulators:start

# Functions 빌드
cd infra/firebase/functions
npm install
npm run build
```

### 배포
```bash
# 전체 배포
firebase deploy

# 선택적 배포
firebase deploy --only firestore:rules,firestore:indexes,functions
firebase deploy --only storage:rules
```

## 문서

- [데이터 모델](./docs/DATA_MODEL.md): Firestore 컬렉션 및 필드 정의
- [Flutter 연동 가이드](./docs/FLUTTER_INTEGRATION.md): Flutter 앱에서 Firebase 사용 방법
- [Firebase 인프라 README](./infra/firebase/README.md): Firebase 인프라 상세 가이드

## 인증 제공자

현재 활성화된 인증 제공자:
- ✅ Email/Password
- ✅ Google Sign-In
- ✅ Anonymous (익명)

## Cloud Functions

배포된 Functions:
1. `onReviewWrite`: 리뷰 작성/수정/삭제 시 평점 집계 자동 업데이트
2. `onReportCreate`: 신고 생성 시 로그 기록
3. `submitReview`: 리뷰 작성 API (콜러블)
4. `toggleFavorite`: 즐겨찾기 토글 API (콜러블)
5. `updateToiletAdmin`: 관리자용 화장실 정보 수정 API (콜러블)

## 개발 상태

- ✅ Firebase 백엔드 기본 설정 완료
- ✅ 보안 규칙 배포 완료
- ✅ Cloud Functions 배포 완료
- ✅ 인증 제공자 설정 완료
- ⏳ Flutter 앱 개발

