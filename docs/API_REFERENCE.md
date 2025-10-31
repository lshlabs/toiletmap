# Cloud Functions API 참조

## 개요

이 프로젝트는 **콜러블(Callable) Functions**를 사용하여 API를 제공합니다. 모든 API는 **HTTP POST** 메서드를 사용하며, Firebase 인증 토큰이 필요합니다.

## 인증

모든 API 호출에는 Firebase 인증 토큰이 필요합니다.

### Flutter에서 호출

```dart
import 'package:cloud_functions/cloud_functions.dart';

// 인증 토큰은 자동으로 포함됩니다
final result = await FirebaseFunctions.instance
    .httpsCallable('submitReview')
    .call({
      'toiletId': 'toilet123',
      'rating': 5,
      'comment': '좋아요!',
      'images': []
    });
```

### HTTP 직접 호출

```bash
curl -X POST \
  https://us-central1-toiletmap-hu2chaso-dev.cloudfunctions.net/submitReview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{
    "data": {
      "toiletId": "toilet123",
      "rating": 5,
      "comment": "좋아요!",
      "images": []
    }
  }'
```

---

## API 목록

### 1. submitReview

리뷰를 작성합니다.

**Function**: `submitReview`  
**메서드**: POST  
**인증**: 필수

#### 요청 파라미터

```json
{
  "toiletId": "string (필수)",
  "rating": "number (필수, 1~5)",
  "comment": "string (선택, 기본값: '')",
  "images": "array<string> (선택, 기본값: [])"
}
```

#### 응답

```json
{
  "reviewId": "string"
}
```

#### 에러 코드

- `unauthenticated`: 로그인이 필요합니다
- `invalid-argument`: toiletId와 1~5 사이의 rating이 필요합니다

#### 예시 (Flutter)

```dart
final result = await FirebaseFunctions.instance
    .httpsCallable('submitReview')
    .call({
      'toiletId': 'toilet123',
      'rating': 5,
      'comment': '깨끗하고 편리해요!',
      'images': ['https://storage.../image1.jpg']
    });

final reviewId = result.data['reviewId'];
```

---

### 2. toggleFavorite

즐겨찾기를 추가하거나 제거합니다.

**Function**: `toggleFavorite`  
**메서드**: POST  
**인증**: 필수

#### 요청 파라미터

```json
{
  "toiletId": "string (필수)"
}
```

#### 응답

```json
{
  "favorited": "boolean (true: 추가됨, false: 제거됨)"
}
```

#### 에러 코드

- `unauthenticated`: 로그인이 필요합니다
- `invalid-argument`: toiletId가 필요합니다

#### 예시 (Flutter)

```dart
final result = await FirebaseFunctions.instance
    .httpsCallable('toggleFavorite')
    .call({
      'toiletId': 'toilet123'
    });

final isFavorited = result.data['favorited'];
if (isFavorited) {
  print('즐겨찾기 추가됨');
} else {
  print('즐겨찾기 제거됨');
}
```

---

### 3. updateToiletAdmin

관리자용 화장실 정보 수정 API (관리자 권한 필요)

**Function**: `updateToiletAdmin`  
**메서드**: POST  
**인증**: 필수 (관리자 권한)

#### 요청 파라미터

```json
{
  "toiletId": "string (필수)",
  "update": "object (필수, merge: true)"
}
```

#### 응답

```json
{
  "ok": true
}
```

#### 에러 코드

- `unauthenticated`: 로그인이 필요합니다
- `permission-denied`: 관리자 권한이 필요합니다
- `invalid-argument`: toiletId와 update 객체가 필요합니다

#### 예시 (Flutter)

```dart
final result = await FirebaseFunctions.instance
    .httpsCallable('updateToiletAdmin')
    .call({
      'toiletId': 'toilet123',
      'update': {
        'name': '새 화장실 이름',
        'openHours': '24시간',
        'amenities': ['babyBed', 'wheelchair']
      }
    });
```

---

## 트리거 Functions (API 아님)

다음 Functions는 자동으로 실행되며 직접 호출할 수 없습니다:

### onReviewWrite

리뷰가 작성/수정/삭제될 때 자동으로 화장실 평점을 집계합니다.

- **트리거**: Firestore `toilets/{toiletId}/reviews/{reviewId}` 문서 변경 시
- **동작**: `ratingAvg`, `ratingCount` 자동 업데이트

### onReportCreate

신고가 생성될 때 로그를 기록합니다.

- **트리거**: Firestore `reports/{reportId}` 문서 생성 시
- **동작**: 로그 기록 (추후 웹훅 연동 가능)

---

## 엔드포인트 URL

### 개발 환경 (dev)

```
https://us-central1-toiletmap-hu2chaso-dev.cloudfunctions.net/{functionName}
```

### 운영 환경 (prod)

```
https://us-central1-toiletmap-hu2chaso-prod.cloudfunctions.net/{functionName}
```

---

## 에러 처리 (Flutter)

```dart
try {
  final result = await FirebaseFunctions.instance
      .httpsCallable('submitReview')
      .call({...});
} on FirebaseFunctionsException catch (e) {
  switch (e.code) {
    case 'unauthenticated':
      print('로그인이 필요합니다');
      break;
    case 'invalid-argument':
      print('잘못된 파라미터: ${e.message}');
      break;
    case 'permission-denied':
      print('권한이 없습니다');
      break;
    default:
      print('에러 발생: ${e.message}');
  }
}
```

---

## 참고사항

1. 모든 콜러블 Functions는 **HTTPS**만 지원합니다
2. 인증 토큰은 Firebase Auth를 통해 자동으로 관리됩니다
3. Functions는 **us-central1** 리전에 배포됩니다
4. 호출 시 타임아웃 기본값: 60초
5. 관리자 권한은 커스텀 클레임 `roles: ['admin']`이 필요합니다

