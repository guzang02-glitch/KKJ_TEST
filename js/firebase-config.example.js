// 로컬 개발용 예시 파일입니다.
// 이 파일을 js/firebase-config.js 로 복사한 뒤 실제 Firebase 프로젝트 값으로 채워서 사용하세요.
// (js/firebase-config.js는 .gitignore에 등록되어 있어 커밋되지 않습니다)
//
// 실제 배포(GitHub Pages)에서는 이 파일 대신 GitHub Actions Secrets 값으로
// 배포 시점에 js/firebase-config.js가 자동 생성됩니다. README.md 참고.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
