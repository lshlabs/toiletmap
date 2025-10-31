"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToiletAdmin = exports.toggleFavorite = exports.submitReview = exports.onReportCreate = exports.onReviewWrite = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
admin.initializeApp();
const db = admin.firestore();
function isAdmin(context) {
    const token = context.auth?.token;
    return Boolean(token && token.roles && Array.isArray(token.roles) && token.roles.includes('admin'));
}
exports.onReviewWrite = functions.firestore
    .document('toilets/{toiletId}/reviews/{reviewId}')
    .onWrite(async (change, context) => {
    const toiletId = context.params.toiletId;
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
exports.onReportCreate = functions.firestore
    .document('reports/{reportId}')
    .onCreate(async (snap) => {
    const data = snap.data();
    // 운영 시 슬랙/웹훅 연동 지점 (환경설정 사용)
    functions.logger.info('New report created', data);
});
exports.submitReview = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }
    const userId = context.auth.uid;
    const toiletId = data?.toiletId;
    const rating = data?.rating;
    const comment = data?.comment ?? '';
    const images = Array.isArray(data?.images) ? data.images : [];
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
exports.toggleFavorite = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }
    const userId = context.auth.uid;
    const toiletId = data?.toiletId;
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
exports.updateToiletAdmin = functions.https.onCall(async (data, context) => {
    if (!context.auth || !isAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
    }
    const toiletId = data?.toiletId;
    const update = data?.update ?? {};
    if (!toiletId || typeof update !== 'object') {
        throw new functions.https.HttpsError('invalid-argument', 'toiletId와 update 객체가 필요합니다.');
    }
    await db.collection('toilets').doc(toiletId).set(update, { merge: true });
    return { ok: true };
});
