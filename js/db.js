// Firestore 기반 점수 저장/조회 모듈.
// 점수 저장은 saveScore, 랭킹 조회는 getTop 두 함수로 분리한다.

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const SCORES_COLLECTION = "scores";

async function saveScore(ms, nickname) {
  await db.collection(SCORES_COLLECTION).add({
    nickname,
    ms,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function getTop(n) {
  const snapshot = await db
    .collection(SCORES_COLLECTION)
    .orderBy("ms", "asc")
    .limit(n)
    .get();

  return snapshot.docs.map((doc) => doc.data());
}
