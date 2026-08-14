# 반응속도 측정기

파란 화면을 클릭해 게임을 시작하고, 화면이 빨간색으로 바뀌는 순간 클릭해서 반응 속도(ms)를 측정하는 웹앱입니다. 기록은 닉네임과 함께 Firebase(Firestore)에 저장되고, 결과 화면에서 랭킹을 확인할 수 있습니다.

## 동작 방식

1. 파란 화면 클릭 → 게임 시작
2. 1~12초 사이 랜덤한 시간 뒤 화면이 빨간색으로 전환
3. 빨간색이 된 후 클릭까지 걸린 시간을 ms 단위로 측정, 초록 결과 화면 표시
4. 결과 화면에서 닉네임을 입력하고 저장하면 Firestore에 기록 저장
5. 빨간색으로 바뀌기 전에 클릭하면 실패 처리 후 클릭 시 처음부터 재시작
6. 결과 화면에 최고 기록과 TOP 5 랭킹 표시

## 파일 구조

- `index.html` : 화면 마크업
- `css/style.css` : 화면별 배경색 및 스타일
- `js/game.js` : 게임 상태 머신(대기/카운트다운/성공/실패) 및 UI 제어
- `js/db.js` : Firestore 연동, `saveScore(ms, nickname)` / `getTop(n)` 두 함수로 저장·조회 분리
- `js/firebase-config.example.js` : Firebase 설정값 예시 (로컬 개발용 템플릿, 커밋됨)
- `js/firebase-config.js` : 실제 Firebase 설정값이 담기는 파일. `.gitignore`에 등록되어 있어 커밋되지 않으며, 배포 시에는 GitHub Actions Secrets로 자동 생성됨
- `.github/workflows/deploy-pages.yml` : `main` 브랜치 푸시 시 Secrets로 `firebase-config.js`를 생성한 뒤 GitHub Pages에 자동 배포

## Firebase 설정 방법

이 프로젝트는 Firebase 프로젝트 생성 및 설정을 직접 해야 합니다. 실제 config 값은 저장소에 커밋하지 않고 **GitHub Actions Secrets**로 관리합니다.

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트를 생성합니다.
2. 프로젝트 개요 > 웹 앱 추가(`</>`) 를 눌러 웹 앱을 등록합니다.
3. 등록 후 나오는 `firebaseConfig` 값을 저장소 **Settings > Secrets and variables > Actions**에 아래 이름으로 각각 등록합니다.

   | Secret 이름 | 값 |
   | --- | --- |
   | `FIREBASE_API_KEY` | apiKey |
   | `FIREBASE_AUTH_DOMAIN` | authDomain |
   | `FIREBASE_PROJECT_ID` | projectId |
   | `FIREBASE_STORAGE_BUCKET` | storageBucket |
   | `FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
   | `FIREBASE_APP_ID` | appId |

   `main` 브랜치에 푸시되면 워크플로우가 이 Secrets 값으로 `js/firebase-config.js`를 자동 생성해 배포합니다.
4. 로컬에서 직접 실행하며 테스트하려면 `js/firebase-config.example.js`를 `js/firebase-config.js`로 복사한 뒤 실제 값을 채워넣으세요. 이 파일은 `.gitignore`에 등록되어 있어 커밋되지 않습니다.
5. 콘솔 좌측 메뉴에서 **Firestore Database**를 생성합니다(프로덕션 모드 또는 테스트 모드 중 선택).
6. Firestore 규칙(Rules) 탭에서 아래 규칙으로 교체합니다. 누구나 랭킹을 조회할 수 있고, 저장 시에는 형식이 올바른 경우에만 생성을 허용하며 수정·삭제는 막습니다.

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /scores/{scoreId} {
         allow read: if true;
         allow create: if request.resource.data.keys().hasOnly(['nickname', 'ms', 'createdAt'])
                       && request.resource.data.nickname is string
                       && request.resource.data.nickname.size() > 0
                       && request.resource.data.nickname.size() <= 12
                       && request.resource.data.ms is number
                       && request.resource.data.ms > 0;
         allow update, delete: if false;
       }
     }
   }
   ```

6. 값을 채운 뒤 로컬에서 `index.html`을 열거나 배포된 GitHub Pages 주소로 접속하면 정상 동작합니다.

> Firebase 웹 앱의 `apiKey` 등 config 값은 비밀 값이 아니며, 실제 접근 제어는 위 Firestore 보안 규칙으로 이루어집니다.

## GitHub Pages 배포 방법

1. 이 저장소의 **Settings > Pages** 에서 Source를 **GitHub Actions**로 설정합니다.
2. `main` 브랜치에 푸시(또는 병합)하면 `.github/workflows/deploy-pages.yml` 워크플로우가 자동으로 정적 파일을 배포합니다.
3. 배포가 끝나면 Settings > Pages에 표시되는 URL로 접속해 확인합니다.
