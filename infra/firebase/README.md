# Firebase Infra (toiletmap)

구성
- Firestore 규칙: infra/firebase/firestore.rules
- Firestore 인덱스: infra/firebase/firestore.indexes.json
- Storage 규칙: infra/firebase/storage.rules
- Functions 소스: infra/firebase/functions
- 에뮬레이터/프로젝트 설정: 루트 firebase.json, .firebaserc

에뮬레이터
- 포트: Auth 9099, Firestore 8080, Storage 9199, Functions 5001, UI 4000
- Flutter에서 로컬 연결 시 해당 호스트/포트를 사용

배포
- 실제 배포는 콘솔/CLI에서 프로젝트 alias(dev, prod) 설정 후 진행
- 예: firebase deploy --only firestore:rules,storage:rules,functions

주의
- 마스터 데이터 수정은 관리자 커스텀 클레임(roles: ['admin']) 필요
