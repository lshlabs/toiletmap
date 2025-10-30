import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

function isAdmin(context: functions.https.CallableContext | functions.EventContext): boolean {
  const token: any = (context as any).auth?.token;
  return Boolean(token && token.roles && Array.isArray(token.roles) && token.roles.includes('admin'));
}

export const onReviewWrite = functions.firestore
  .document('toilets/{toiletId}/reviews/{reviewId}')
  .onWrite(async (change, context) => {
    const toiletId = context.params.toiletId as string;
    const toiletRef = db.collection('toilets').doc(toiletId);

    const reviewsSnap = await toiletRef.collection('reviews').get();
    const ratingCount = reviewsSnap.size;
    let ratingSum = 0;
    for (const doc of reviewsSnap.docs) {
      const rating = Number(doc.get('rating') ?? 0);
      ratingSum += isFinite(rating) ? rating : 0;
    }
    const ratingAvg = ratingCount === 0 ? 0 : Number((ratingSum / ratingCount).toFixed(2));

    await toiletRef.update({ ratingCount, ratingAvg });
  });

export const onReportCreate = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    // 운영 시 슬랙/웹훅 연동 지점 (환경설정 사용)
    functions.logger.info('New report created', data);
  });

export const submitReview = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const userId = context.auth.uid;
  const toiletId: string = data?.toiletId;
  const rating: number = data?.rating;
  const comment: string = data?.comment ?? '';
  const images: string[] = Array.isArray(data?.images) ? data.images : [];

  if (!toiletId || typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new functions.https.HttpsError('invalid-argument', 'toiletId와 1~5 사이의 rating이 필요합니다.');
  }

  const reviewRef = db.collection('toilets').doc(toiletId).collection('reviews').doc();
  const now = admin.firestore.FieldValue.serverTimestamp();
  await reviewRef.set({
    userId,
    rating,
    comment,
    images,
    createdAt: now,
    updatedAt: now,
    reported: false,
  });

  return { reviewId: reviewRef.id };
});

export const toggleFavorite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }
  const userId = context.auth.uid;
  const toiletId: string = data?.toiletId;
  if (!toiletId) {
    throw new functions.https.HttpsError('invalid-argument', 'toiletId가 필요합니다.');
  }

  const favId = `${userId}_${toiletId}`;
  const favRef = db.collection('favorites').doc(favId);
  const snap = await favRef.get();
  if (snap.exists) {
    await favRef.delete();
    return { favorited: false };
  }
  await favRef.set({ userId, toiletId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { favorited: true };
});

export const updateToiletAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth || !isAdmin(context)) {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }
  const toiletId: string = data?.toiletId;
  const update: Record<string, unknown> = data?.update ?? {};
  if (!toiletId || typeof update !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'toiletId와 update 객체가 필요합니다.');
  }
  await db.collection('toilets').doc(toiletId).set(update, { merge: true });
  return { ok: true };
});


