# THE MOMENT — Landing

더모먼트 회사 소개 원페이지 랜딩. Figma 디자인을 React로 옮긴 프로젝트입니다.

## 스택

- **Vite 8** + **React 19** (JSX)
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **oxlint**
- 폰트: Pretendard (jsDelivr CDN)

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
  App.jsx              섹션 조립
  index.css            Tailwind 진입점 + 마퀴/리빌 애니메이션 정의
  hooks/useInView.js   스크롤 진입 감지 (IntersectionObserver, 1회성)
  assets/              워드마크 · Union 로고 SVG
  components/
    Reveal.jsx         진입 시 나타나는 래퍼
    Wordmark.jsx       THE MOMENT 워드마크 (삼각 세공면으로 분할된 인라인 SVG)
    Brush.jsx          파란 M 붓터치 (획을 따라 그려지는 마스크)
    Hero.jsx           #(top)    내비 + THE MOMENT 워드마크
    Intro.jsx          #about    회사 소개 · 철학
    Values.jsx         #service  마퀴 티커 + 핵심 가치 3
    Projects.jsx       #work     프로젝트 카드
    Contact.jsx        #contact  문의 폼
    Footer.jsx                   푸터 (잉크 / 브랜드 블루 2분할)
```

## 디자인 토큰

| 용도 | 값 |
| --- | --- |
| 본문 / 제목 | `#292b2f` |
| 포인트 (블루) | `#4a80f8` |
| 보조 텍스트 | `#555962` |
| 연회색 (배경 텍스트) | `#e9e9e9` |
| 카드 배경 | `#d9d9d9` |
| 푸터 배경 | `#fbfbfb` |

## 여백 스케일

타입과 같은 이유로 역할별 토큰입니다. 섹션은 폭 제한 없이 화면을 채우고,
좌우는 좁게 / 상하는 길게 잡습니다.

| 클래스 | 값 | 쓰는 곳 |
| --- | --- | --- |
| `px-gutter` | `48px` | 모든 섹션의 좌우 여백 |
| `py-section` | `clamp(96px, 10vw, 180px)` | 모든 섹션의 상하 여백 |
| `mb/mt/gap-block` | `clamp(48px, 6vw, 112px)` | 제목↔본문, 큰 덩어리 사이 |
| `gap-stack` | `clamp(20px, 2.2vw, 40px)` | 한 덩어리 안의 항목 사이 |

Hero는 이 스케일 밖입니다.

## 타입 스케일

역할별 토큰으로 [`index.css`](src/index.css)의 `@theme`에 정의돼 있습니다. 굵기와
색은 같은 역할이라도 섹션마다 달라서 토큰에 넣지 않고 요소에 둡니다.

| 클래스 | 크기 | 쓰는 곳 |
| --- | --- | --- |
| `text-display` | `clamp(28px, 4.4vw, 64px)` | 섹션 제목, 더모먼트, 마퀴 |
| `text-title` | `clamp(26px, 2.6vw, 36px)` | 카드 제목, 푸터 로고, 밸류 번호 |
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
| `reveal-up` (기본) | 아래에서 위로 + 페이드 |
| `reveal-left` | 왼쪽에서 슬라이드 |
| `reveal-scale` | 살짝 확대되며 페이드 |

Hero는 진입 시 내비 → 붓터치 `M`(세공) → 워드마크 세공면 정렬 순으로 이어집니다.
타이밍 상수는 [`Hero.jsx`](src/components/Hero.jsx) 상단에 모아 두었습니다.

### 유리 파편 (`Faceted.jsx`)

브랜드 컨셉은 **유리를 깨뜨리는 것 = 기존 상식을 깨는 것**입니다. 히어로
워드마크에만 있던 그 처리를 어디에나 쓸 수 있게 뺐습니다.

```jsx
<Faceted as="h2" className="text-display font-bold">
  Our <span className="text-[#4a80f8]">Project</span>
</Faceted>
```

- SVG가 아니라 **CSS `clip-path` 퍼센트**입니다. `clip-path`도 `translate`도
  요소 자기 박스 기준이라 크기와 무관하게 한 벌의 숫자로 동작합니다.
- 내용을 **파편 수만큼 복제**합니다. `density`로 조절하세요.

| density | 조각 수 | 쓰는 곳 |
| --- | --- | --- |
| `fine` (기본) | 20 | 섹션 제목, 큰 문구 |
| `coarse` | 12 | 본문 단락, 중간 크기 |
| `wide` | 8 | 한 줄짜리 라벨·캡션 |

- **복제 비용을 알고 쓰세요.** 현재 페이지 기준 파편 876개, DOM 노드의 57%가
  파편이고 **화면 텍스트의 약 84%가 중복된 사본**입니다. 검색엔진과 복사·붙여넣기가
  이 중복을 봅니다(사본은 `aria-hidden` + `select-none`이라 스크린리더와 드래그
  선택에서는 제외됩니다). 긴 본문일수록 `density`를 낮추는 게 효과가 큽니다.
- SVG의 `<use>` 같은 참조가 HTML에는 없어서 복제는 이 기법의 구조적 한계입니다.
  `Wordmark`가 저렴한 이유가 SVG라서입니다.
- **인터랙티브 요소에는 쓰지 마세요.** 입력창·버튼·링크를 감싸면 컨트롤이
  조각 수만큼 복제됩니다. 라벨처럼 컨트롤을 감싸는 태그는 괜찮습니다 — 바깥
  태그는 하나로 유지되고 안쪽 텍스트만 복제됩니다.
- 첫 번째 사본은 `opacity-0`으로 두어 레이아웃과 접근성 트리를 담당하고,
  파편들은 `aria-hidden`입니다.
- 파편은 자기 박스 바깥으로 크게 벗어나므로 `section`/`footer`에
  `overflow-x: clip`이 걸려 있습니다. 없으면 등장할 때마다 가로 스크롤바가
  생깁니다.

기하는 [`src/lib/facets.js`](src/lib/facets.js)에서 `Wordmark`와 공유합니다.
격자는 단위 정사각형에서 만들고 각자 자기 좌표계로 확대합니다.

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

### 붓터치 (`Brush.jsx`)

`THE MOMENT`의 `M` 자리에 들어가는 파란 마크는 붓으로 그린 그림입니다.
사각형으로 훑어 내리는 대신, 획의 중심선을 따라간 굵은 패스 3개
(왼쪽 다리+꼬리 → 가운데 V → 오른쪽 다리)로 아트웍을 마스킹하고
`stroke-dashoffset`을 0으로 보내 **실제로 칠하듯이** 나타냅니다.

- 좌표는 아트웍 자체의 `217.825 × 209.331` viewBox 기준입니다.
- `pathLength="1"`로 길이를 정규화해 `getTotalLength()` 없이 `strokeDasharray="1"`,
  `stroke-dashoffset: 1 → 0`으로 제어합니다.
- 마스크 그룹에 약한 `feGaussianBlur`를 걸어 획 끝이 번지듯 들어옵니다.
- 획 폭은 붓이 가장 넓게 퍼지는 지점을 덮되 옆 획을 침범하지 않도록 개별 지정.
  현재 설정으로 아트웍의 99.7%를 덮습니다 — 폭을 줄이면 붓의 일부가 영구히
  잘리므로 중심선을 바꿀 때 함께 확인하세요.

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

### 재실행

애니메이션은 일회성이 아닙니다. `useInView`가 관찰을 끊지 않고 계속 감시하며,
섹션이 화면에서 완전히 벗어나면 숨김 상태로 되돌려 다음 방문에 다시 재생합니다.

- 되돌리는 시점은 **완전히 화면 밖일 때**입니다. 트리거 선이 화면 아래쪽에서
  조금 올라와 있어서, 교차가 끊기자마자 되돌리면 그 선 근처에서 스크롤할 때
  깜빡입니다.
- 되돌리기는 **즉시**여야 합니다. 지속시간·지연이 남아 있으면 애니메이션이
  거꾸로 재생되는 게 보입니다. CSS는 `:not(.is-in)`에서 `transition-duration: 0s`,
  인라인 지연·지속시간은 컴포넌트가 `inView`일 때만 넣습니다.

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

- `Projects` · `Awards` · `Contact` 섹션의 플레이스홀더(`TITLE` / `EXPLAIN` / `SUBEXPLAIN`) 실제 콘텐츠 입력
- 내비의 `SERVICE` 항목은 전용 섹션이 없어 임시로 `Values`(`#service`)를 가리킴
- `Contact` 폼 전송 백엔드 미연결 (현재는 클라이언트 검증 + 완료 표시까지)
- 푸터 SOCIAL 링크 2개가 모두 `Instagram` 플레이스홀더 — 실제 채널/URL 필요
#   t h e m o m e n t - l a n d i n g  
 #   t h e m o m e n t - l a n d i n g  
 