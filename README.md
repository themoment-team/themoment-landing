# THE MOMENT — Landing

더모먼트 회사 소개 원페이지 랜딩. Figma 디자인을 React로 옮긴 프로젝트입니다.

## 스택

- **Vite 8** + **React 19** (JSX)
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **oxlint**
- 폰트: Pretendard Variable, 유니코드 범위별 동적 서브셋 (jsDelivr CDN)

## 실행

```bash
npm install
npm run dev
```

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | oxlint |

## 구조

```
src/
  App.jsx              섹션 조립 (main 랜드마크 + 푸터)
  index.css            Tailwind 진입점 + 리빌 / 세공면 애니메이션 정의
  hooks/useInView.js   스크롤 진입 감지 (IntersectionObserver, 1회성)
  lib/
    timing.js          히어로 · 섹션 타이밍 상수
    wordmark.js        워드마크 글리프 패스와 세공면 기하
    facets.js          세공면 격자 생성 (wordmark.js가 사용)
    revealGroup.js     한 섹션을 한 번에 깨우는 컨텍스트
  assets/              워드마크 · Union 로고 · 프로젝트 배너 3
  components/
    Reveal.jsx         진입 시 나타나는 래퍼
    RevealGroup.jsx    섹션 하나를 한 신호로 묶는 래퍼
    Wordmark.jsx       THE MOMENT 워드마크 (삼각 세공면으로 분할된 인라인 SVG)
    DotField.jsx       히어로 밴드의 점 격자 캔버스 (난류 + 포인터 자국)
    Hero.jsx           #(top)    내비 + 점 밴드 + THE MOMENT 워드마크(h1)
    Intro.jsx          #about    팀 소개 · 철학
    Values.jsx         #service  Our Value — 핵심 가치 3
    Projects.jsx       #work     Our Project — 프로젝트 카드 4
    Contact.jsx        #contact  문의 폼
    Footer.jsx                   푸터 (잉크 / 브랜드 블루 2분할)
scripts/
  og-card.html         공유 카드(public/og.png) 원본 — 재생성 방법은 파일 주석에
```

## 디자인 토큰

| 용도 | 값 |
| --- | --- |
| 본문 / 제목 | `#292b2f` |
| 포인트 (블루) | `#4A80F8` |
| 보조 텍스트 | `#555962` |
| 연회색 (배경 텍스트) | `#e9e9e9` |
| 카드 배경 | `#d9d9d9` |
| 푸터 (좌 / 우) | `#292b2f` / `#4A80F8` |

## 여백 스케일

타입과 같은 이유로 역할별 토큰입니다. 섹션은 폭 제한 없이 화면을 채우고,
좌우는 좁게 / 상하는 길게 잡습니다.

| 클래스 | 값 | 쓰는 곳 |
| --- | --- | --- |
| `px-gutter` | `clamp(20px, 5vw, 48px)` | 모든 섹션의 좌우 여백 — 폰에서 20, 960px부터 48 |
| `py-section` | `clamp(96px, 10vw, 180px)` | 모든 섹션의 상하 여백 |
| `mb/mt/gap-block` | `clamp(48px, 6vw, 112px)` | 제목↔본문, 큰 덩어리 사이 |
| `gap-stack` | `clamp(20px, 2.2vw, 40px)` | 한 덩어리 안의 항목 사이 |

Hero는 이 스케일 밖입니다.

## 타입 스케일

역할별 토큰으로 [`index.css`](src/index.css)의 `@theme`에 정의돼 있습니다. 굵기와
색은 같은 역할이라도 섹션마다 달라서 토큰에 넣지 않고 요소에 둡니다.

| 클래스 | 크기 | 쓰는 곳 |
| --- | --- | --- |
| `text-display` | `clamp(28px, 4.4vw, 64px)` | 섹션 제목, 더모먼트 |
| `text-title` | `clamp(26px, 2.6vw, 36px)` | 프로젝트 이름(h3), 푸터 로고, 밸류 번호 |
| `text-lead` | `clamp(20px, 2.2vw, 32px)` | 도입 문장, 밸류 본문 |
| `text-subtitle` | `clamp(18px, 1.8vw, 24px)` | 푸터 태그라인 |
| `text-label` | `20px` | 라벨, 링크, 카드 캡션 |
| `text-body` | `16px / 24px` | 본문, 입력 필드, 버튼 |
| `text-caption` | `14px` | 부가 설명, 저작권, 그룹 헤딩 |

Hero는 이 스케일 밖입니다 — 워드마크는 글자가 아니라 아트웍이고, 내비는 자체
`clamp`를 씁니다.

## 애니메이션

`Reveal`을 감싸면 화면에 들어올 때 한 번 나타납니다. `variant`로 방향을 고르고
`delay`(ms)로 순서를 만듭니다.

```jsx
<Reveal as="h2" delay={120} className="...">제목</Reveal>
<Reveal variant="reveal-left">…</Reveal>
```

| variant | 움직임 |
| --- | --- |
| `reveal-fade` (기본) | 페이드만, 이동 없음 |
| `reveal-up` | 아래에서 위로 + 페이드 |
| `reveal-left` | 왼쪽에서 슬라이드 |
| `reveal-scale` | 살짝 확대되며 페이드 |

히어로 아래는 전부 기본값(`reveal-fade`)입니다. 이동을 쓰는 곳은 히어로 내비
하나뿐이고, 거기서만 `variant="reveal-up"`을 이름으로 지정합니다.

Hero는 진입 시 내비 · 워드마크 세공면 정렬 · 밴드 반전이 한 신호에서 갈라져
나가고, 점 필드가 밴드가 어두워진 뒤 한 박자 늦게 올라옵니다.
타이밍 상수는 [`Hero.jsx`](src/components/Hero.jsx) 상단에 모아 두었습니다.

### 워드마크 세공면 (`Wordmark.jsx`)

워드마크 띠를 삼각형 72개로 자르고, **각 삼각형이 자기 클립을 통해 워드마크
전체를 따로 보여줍니다.** 면마다 위치·회전·배율이 조금씩 어긋나 있어서 글자가
세공면 경계에서 깨져 보이고, 어긋남이 풀리면서 하나로 맞물립니다. 보석 면마다
다르게 비친 상이 정렬되는 모습입니다.

- 격자 꼭짓점은 결정론적으로 흔들되(`rnd`) **바깥 테두리는 흔들지 않습니다.**
  테두리가 어긋나면 타일링에 틈이 생겨 글자에 구멍이 납니다.
- 인접한 클립은 변을 공유하는데 안티앨리어싱된 두 변이 맞닿으면 머리카락 같은
  이음새가 보입니다. 꼭짓점을 무게중심 반대로 `0.9` 단위 밀어 겹치게 했습니다.
  정렬이 끝나면 겹친 내용이 동일하므로 보이지 않습니다.
- 면마다 워드마크 8자를 다 그리면 프레임당 576개 path가 됩니다. 각 면이 이동
  구간에서 실제로 닿을 수 있는 글자만 `<use>`로 참조해 **146개**로 줄였습니다.
  어떤 글자가 필요한지는 `sourceSpan()`이 시작 시점 변형(이동·회전·skew·배율)의
  **역행렬로 클립을 되돌려** 계산합니다. 움직임 진폭(`PUSH_*`/`LIFT`/`TURN`/
  `SKEW`/`SCALE_*`)을 바꾸면 자동으로 따라오지만, 진행 0~100% 구간에서 누락
  픽셀이 0인지는 다시 확인하세요.
- `transform-origin`은 면마다 자기 무게중심으로 지정합니다. 기본값이면 viewBox
  중심을 기준으로 돌아 전혀 다른 움직임이 됩니다.

정렬이 끝난 상태는 원본 워드마크와 픽셀 단위로 일치해야 합니다(2× 해상도에서
누락 0px). 기하를 손볼 때 이 대조를 다시 하세요.

### 점 필드 (`DotField.jsx`)

히어로의 어두운 밴드를 채우는 캔버스입니다. 격자는 고정이고 프레임마다 바뀌는
것은 점 하나하나의 반지름·불투명도·색입니다.

- **난류**: 도메인 워프된 능선 노이즈. 교차 사인파는 격자로 읽히는 간섭을 만들어
  패턴처럼 보입니다. 목표값은 초당 30회만 계산하고 이징은 매 프레임 돌립니다 —
  샘플링이 프레임 비용의 대부분이고, 눈에 보이는 것은 이징된 값입니다.
- **스트로크**: 포인터가 지나간 경로에 스탬프를 찍고, 멈춰 있으면 `HOLD_STEP`
  마다 같은 자리에 계속 찍습니다. 커서 밑에 원반을 따로 얹으면 원반과 획 사이에
  양쪽보다 어두운 고리가 생깁니다 — 한 붓, 한 프로파일이어야 이음매가 없습니다.
- 포인터 좌표는 client 기준으로 들고 매 프레임 캔버스 좌표로 바꿉니다. 손이
  멈춰 있어도 페이지가 스크롤되면 캔버스가 커서 밑에서 미끄러집니다.
- `bare` 모드(격자 없이 자국만)는 지금 아무 데서도 쓰지 않습니다. 커서에
  반응하는 것은 히어로 하나뿐입니다.

주의할 점:

- `Reveal` 요소에 Tailwind `transition-*` 유틸리티를 같이 쓰면 리빌 트랜지션을
  덮어씁니다. hover 효과 등은 자식 요소에 두세요.
- 크기를 넘겨받는 컴포넌트에서 `w-full`과 `w-[15.1%]`를 **같은 요소**에 두지
  마세요. Tailwind는 클래스 문자열 순서가 아니라 생성된 CSS 순서로 승자를
  정하는데 `.w-full`이 뒤에 나와서 이깁니다. 래퍼가 크기를, 안쪽 요소가
  `w-full`을 갖도록 나누세요.
- `useInView`의 `threshold`는 0이 기본입니다. 뷰포트보다 큰 요소는 비율
  threshold에 영원히 도달하지 못해 리빌이 아예 발화하지 않습니다. 시점 조절은
  `rootMargin`으로 하세요.

`prefers-reduced-motion: reduce`에서는 리빌의 숨김 상태 자체가 적용되지 않고
마퀴와 부드러운 스크롤도 멈춥니다.

### 한 번만

리빌은 일회성입니다. `useInView`는 첫 교차에서 `disconnect()`하고 더 보지
않습니다. 되돌아 올라올 때 다시 재생하면 사이트가 처음부터 시작하는 것처럼
읽혀서, 페이지 전체를 등장이 아니라 열림으로 다룹니다.

## 스냅 스크롤 (보류)

한 번 넣었다 뺐습니다. 섹션 내용이 플레이스홀더인 상태에서는 붙는 느낌을
판단할 수 없어서, 페이지가 어느 정도 완성된 뒤에 다시 보기로 했습니다.

다시 넣을 때 필요한 것:

- `:root`에 `scroll-snap-type: y proximity`, 각 `section`/`footer`에
  `scroll-snap-align: start`
- `mandatory`는 뷰포트를 강제로 끌어당겨 뻣뻣하게 느껴집니다. `proximity` 권장
- **섹션에 `scroll-margin-top`을 주면 안 됩니다.** 스냅 위치까지 같이 밀려서
  이전 섹션이 그만큼 걸쳐 보입니다

## 남은 작업

- `og:image` / `twitter:image`가 상대 경로입니다. 슬랙·디스코드는 해석하지만
  페이스북·X는 절대 URL을 요구하므로, 배포 도메인이 정해지면 전체 URL로
  바꿔야 합니다 ([`index.html`](index.html))
- 문의 폼이 보낼 곳이 아직 없습니다. `.env`에 `VITE_CONTACT_ENDPOINT`를 넣으면
  살아납니다 — 없으면 폼은 "연결 준비 중"이라고 말하고 버튼을 잠급니다
  ([`.env.example`](.env.example))
- 내비는 섹션 4개 중 3개만 가리킵니다. `Our Value`(`#service`)가 빠져 있는데,
  내비 폭이 항목 3개 기준으로 잡혀 있어 넣으려면 히어로 쪽 결정이 필요합니다
- `ReadyGSM` 설명이 레포마다 다릅니다. 카드는 client 레포의 문구(학과체험 및
  입학설명회 신청)를 쓰고 있고, server 레포는 교외참여활동 관리라고 합니다
- `<noscript>` 폴백이 섹션 카피를 사본으로 들고 있습니다. 섹션 문구를 바꾸면
  같이 고쳐야 합니다 ([`index.html`](index.html))
