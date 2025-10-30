# Firestore 데이터 모델 (toiletmap)

## collections

### toilets
- name: string
- address: string
- roadAddress: string
- district: string
- isPublic: boolean
- openHours: map|string
- amenities: array<string>
- genderType: string (unisex|male|female)
- location: GeoPoint
- geohash: string
- ratingAvg: number
- ratingCount: number
- source: string
- updatedAt: Timestamp

#### subcollection: reviews
- userId: string
- rating: number (1~5)
- comment: string
- images: array<string> (Storage URL)
- createdAt: Timestamp
- updatedAt: Timestamp
- reported: boolean

### users
- displayName: string
- photoURL: string
- providerIds: array<string>
- createdAt: Timestamp
- lastLoginAt: Timestamp

### favorites (flat)
- id: string = `${userId}_${toiletId}` (doc id)
- userId: string
- toiletId: string
- createdAt: Timestamp

### reports
- targetType: string (toilet|review)
- targetRef: DocumentReference
- reason: string
- detail: string
- userId: string
- status: string (open|resolved)
- createdAt: Timestamp
- resolvedAt: Timestamp
