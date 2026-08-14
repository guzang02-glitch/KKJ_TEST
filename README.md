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
- `js/firebase-config.js` : Firebase 프로젝트 설정값 (직접 채워넣어야 함)
- `.github/workflows/deploy-pages.yml` : `main` 브랜치 푸시 시 GitHub Pages 자동 배포

## Firebase 설정 방법

이 프로젝트는 Firebase 프로젝트 생성 및 설정을 직접 해야 합니다.

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트를 생성합니다.
2. 프로젝트 개요 > 웹 앱 추가(`</>`) 를 눌러 웹 앱을 등록합니다.
3. 등록 후 나오는 `firebaseConfig` 값을 복사해 `js/firebase-config.js`의 값에 그대로 붙여넣습니다.
4. 콘솔 좌측 메뉴에서 **Firestore Database**를 생성합니다(프로덕션 모드 또는 테스트 모드 중 선택).
5. Firestore 규칙(Rules) 탭에서 아래 규칙으로 교체합니다. 누구나 랭킹을 조회할 수 있고, 저장 시에는 형식이 올바른 경우에만 생성을 허용하며 수정·삭제는 막습니다.

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
