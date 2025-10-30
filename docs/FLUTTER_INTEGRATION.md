# Flutter 연동 가이드 (toiletmap)

## 패키지
- firebase_core
- firebase_auth
- cloud_firestore
- firebase_storage
- google_sign_in
- sign_in_with_apple

## 초기화 예시
```dart
await Firebase.initializeApp();
FirebaseFirestore.instance.settings = const Settings(persistenceEnabled: true);
```

## 인증 예시
```dart
final auth = FirebaseAuth.instance;
// 익명 로그인
await auth.signInAnonymously();
// 이메일/비번
await auth.signInWithEmailAndPassword(email: email, password: pw);
```

## Firestore 읽기
```dart
final qs = await FirebaseFirestore.instance
  .collection('toilets')
  .orderBy('ratingAvg', descending: true)
  .limit(20)
  .get();
```

## Storage 업로드
```dart
final ref = FirebaseStorage.instance.ref('reviews/$toiletId/$uid/${const Uuid().v4()}.jpg');
await ref.putFile(file);
final url = await ref.getDownloadURL();
```

## 반경 검색(개략)
- 각 문서에 location(GeoPoint), geohash 저장
- 현재 위치 기준으로 geohash prefix 범위 쿼리 → 후보 필터링
