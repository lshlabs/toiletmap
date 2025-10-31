# Firebase Infra (toiletmap)

Firebase 백엔드 인프라 설정 및 배포 가이드

## 구성

- **Firestore 규칙**: `infra/firebase/firestore.rules`
- **Firestore 인덱스**: `infra/firebase/firestore.indexes.json`
- **Storage 규칙**: `infra/firebase/storage.rules`
- **Functions 소스**: `infra/firebase/functions/`
- **프로젝트 설정**: 루트 `firebase.json`, `.firebaserc`

## 프로젝트 환경

- **dev**: `toiletmap-hu2chaso-dev` (개발 환경)
- **prod**: `toiletmap-hu2chaso-prod` (운영 환경)
- **리전**: asia-northeast3 (Seoul)

## 에뮬레이터

로컬 개발을 위한 에뮬레이터 포트:

- **Auth**: 127.0.0.1:9099
- **Firestore**: 127.0.0.1:8080
- **Storage**: 127.0.0.1:9199
- **Functions**: 127.0.0.1:5001
- **UI**: 127.0.0.1:4000

### 실행 방법

```bash
firebase emulators:start
```

### Flutter 앱에서 에뮬레이터 연결

```dart
// Firestore
FirebaseFirestore.instance.useFirestoreEmulator('127.0.0.1', 8080);

// Auth
await FirebaseAuth.instance.useAuthEmulator('127.0.0.1', 9099);

// Storage
await FirebaseStorage.instance.useStorageEmulator('127.0.0.1', 9199);

// Functions
FirebaseFunctions.instance.useFunctionsEmulator('127.0.0.1', 5001);
```

## 배포

### 프로젝트 선택

```bash
firebase use dev   # 개발 환경
firebase use prod   # 운영 환경
```

### 전체 배포

```bash
firebase deploy
```

### 선택적 배포

```bash
# Firestore 규칙 및 인덱스
firebase deploy --only firestore:rules,firestore:indexes

# Storage 규칙
firebase deploy --only storage:rules

# Functions
firebase deploy --only functions

# 모두 동시 배포
firebase deploy --only firestore:rules,firestore:indexes,storage:rules,functions
```

### Functions 빌드 및 배포

```bash
cd infra/firebase/functions
npm install
npm run build
cd ../../..
firebase deploy --only functions
```

## Cloud Functions

### 구현된 Functions

1. **onReviewWrite** (트리거)
   - 리뷰 작성/수정/삭제 시 화장실 평점 집계 자동 업데이트

2. **onReportCreate** (트리거)
   - 신고 생성 시 로그 기록 (추후 웹훅 연동 가능)

3. **submitReview** (콜러블)
   - 리뷰 작성 API
   - 파라미터: `toiletId`, `rating`, `comment`, `images[]`

4. **toggleFavorite** (콜러블)
   - 즐겨찾기 토글 API
   - 파라미터: `toiletId`

5. **updateToiletAdmin** (콜러블)
   - 관리자용 화장실 정보 수정 API
   - 파라미터: `toiletId`, `update{}`
   - 권한: 관리자 커스텀 클레임 필요

### Functions 개발

```bash
cd infra/firebase/functions
npm install
npm run build    # TypeScript 컴파일
npm run serve    # 로컬 에뮬레이터에서 실행
```

## 보안 규칙

### Firestore 규칙 요약

- **화장실**: 읽기 공개, 쓰기 관리자만
- **리뷰**: 읽기 공개, 생성 인증 사용자(평점 1~5), 수정/삭제 본인/관리자
- **사용자**: 본인만 읽기/쓰기
- **즐겨찾기**: 본인만 읽기/쓰기
- **신고**: 생성 인증 사용자, 읽기/수정 관리자만

### Storage 규칙 요약

- **리뷰 이미지**: `reviews/{toiletId}/{userId}/{fileName}`
  - 읽기: 공개
  - 쓰기: 인증 사용자, 본인만
  - 삭제: 인증 사용자, 본인/관리자

## 인덱스

필수 복합 인덱스:
1. `toilets`: `district` + `ratingAvg` desc
2. `toilets`: `geohash` + `ratingAvg`
3. `reviews`: `toiletId` + `createdAt` desc (컬렉션 그룹)

## 인증 제공자

활성화된 인증 제공자:
- ✅ Email/Password
- ✅ Google Sign-In
- ✅ Anonymous (익명)

## 주의사항

### 관리자 권한

화장실 마스터 데이터 수정을 위해서는 관리자 커스텀 클레임이 필요합니다:

```javascript
// 관리자 클레임 부여 (Admin SDK 사용)
await admin.auth().setCustomUserClaims(uid, { roles: ['admin'] });
```

### Storage 규칙 배포

Storage 규칙은 CLI 배포가 실패할 수 있으므로, Firebase Console에서 직접 게시하는 것이 더 안정적입니다:
1. Firebase Console → Storage → Rules 탭
2. 규칙 코드 붙여넣기
3. "게시" 클릭

## 추가 리소스

- [프로젝트 메인 README](../../README.md)
- [데이터 모델 문서](../../docs/DATA_MODEL.md)
- [Flutter 연동 가이드](../../docs/FLUTTER_INTEGRATION.md)
