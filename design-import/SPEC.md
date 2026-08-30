# THE MOMENT — Figma 디자인 사양

출처: `https://www.figma.com/design/eD06wzM85i90TkSPA47VPx/THE-MOMENT?node-id=90-6`
(fileKey `eD06wzM85i90TkSPA47VPx`, 루트 노드 `90:6` — 1440 × 6724)

Figma 파일에 정의된 **Variable(토큰)은 없음** (`get_variable_defs` → `{}`).
아래 값은 전부 노드에 직접 박힌 raw 값이라, 토큰 체계는 코드 쪽에서 새로 세워야 함.

---

## 1. 기반

| 항목 | 값 |
| --- | --- |
| 캔버스 폭 | 1440 |
| 콘텐츠 폭 | 1280 (좌우 거터 80) |
| 폼 / 텍스트 블록 폭 | 600 |
| 서체 | Pretendard (Regular / Medium / SemiBold / Bold) |
| 페이지 바탕 | 검정 + Hero 성운 이미지 |
| 섹션 바탕 | `rgba(0,0,0,0.6)` — 바탕을 덮는 베일이지 불투명 면이 아님 |

### 색

| 역할 | 값 | 쓰이는 곳 |
| --- | --- | --- |
| 강조 | `#4A80F8` | "더모먼트", "좋은 서비스", 활성 번호 |
| 강조 (죽은 상태) | `#1E3363` | 비활성 `02.` `03.` 번호 |
| 흐린 글자 | `#666666` | 비활성 탭/값, 인풋 placeholder |
| 본문 | `#FFFFFF` | |
| 테두리 | `#FFFFFF` 1px | 멤버 칩, 인풋 |

### 타이포

| 역할 | 크기 / 굵기 / 행간 |
| --- | --- |
| 섹션 제목 (About·Member·Work·Contact) | 48 Bold / 1.4 |
| 가치 이름 (Professional 등) | 48 SemiBold / 1.1 |
| 가치 선언문 | 32 Bold / 1.4 |
| 가치 번호 (`01.`) | 24 Medium / 1.4, 칸 너비 38 |
| 파트 탭 (Frontend 등) | 24 Regular / 2.0 |
| 본문 | 16 Medium / 1.4 |
| 내비·라벨·칩·인풋 | 14 Medium / 1.2~1.4 |

### 간격

section padding 80 또는 160 · 제목→본문 40 · 제목블록→콘텐츠 80 · 가치 행 사이 40 · 번호↔이름 48 · 칩 그리드 20 · 폼 필드 20 · 라벨↔인풋 8

---

## 2. 섹션

### Hero — `90:7`, 1440 × 810
- 바탕: 검정 + `hero/starfield.png` (`object-cover`). 입자로 그려진 M 마크가 이미지에 포함돼 있음.
- 좌상단 내비 (x 28, y 24): About / Member / Work / Contact — 14 Medium 흰색, 각 칸 76, 간격 24.
- 상단 중앙 (y 24): `hero/logo-mark.svg` — 흰 라운드 뱃지 + `the_moment` 워드마크, 85.7 × 49.7. drop-shadow 필터 포함.
- 하단 중앙 (y 735): "Scroll Down" 14 Medium + `hero/scroll-chevron.svg` (10.7 × 6.1, stroke 흰색), 세로 간격 5.

### About — `107:328`, 1440 × 311
`py 80`, 가운데 정렬. 제목 "About" → 40 → 본문 2줄.
> <span accent>더모먼트</span>는 광주소프트웨어마이스터고의 전공동아리입니다.
> 항상 새로운 비즈니스 모델에 대해 고민하고, 기술을 통해 사용자의 경험을 향상시키려 노력합니다.

### Values — `109:35`, 1440 × 810
`pt 80 / px 80`, 아래쪽은 패딩 없이 프레임 바닥에 붙음.
- 상단 한 줄, 좌우 끝 정렬 (32 Bold):
  - 좌: 저희는 <span accent>좋은 서비스</span>를 위해
  - 우: 각자의 분야에서 최고가 되기 위해 끊임없이 학습하고 역량을 키웁니다.
- 하단 3행 — 활성 1개 / 비활성 2개인 상태를 가진 목록:

| | 번호 | 이름 |
| --- | --- | --- |
| 01. | `#4A80F8` | Professional — 흰색 |
| 02. | `#1E3363` | Communication — `#666` |
| 03. | `#1E3363` | Passion — `#666` |

### Member — `90:15`, 1440 × 635
`pt 160`, 블록 간격 80.
- "Member" + 부제: <span accent>더모먼트</span>에서 순간을 혁신하고 있는 광주소프트웨어마이스터고 각 분야, 각 기수의 최고 인재들은 누굴까요
- 파트 탭 (24 Regular, 간격 48, 가운데): **Frontend** (흰색 + 밑줄, 활성) / Server / Design / DevOps (`#666`).
- 칩 그리드: 폭 240 · 1px 흰 테두리 · padding 12 · 14 Medium, 5열 wrap, 간격 20.
  현재 붙어 있는 이름 14개 — 이선우 김형록 유시온 이승제 전예빈 / 김재균 방가온 이상혁 전준연 정효주 / 김서연 정연돈 강동혁 최민준
  (탭이 Frontend로 켜져 있으니 이 목록은 Frontend 명단으로 읽힘. 나머지 세 파트 명단은 디자인에 없음 — 데이터 필요.)

### Work — `100:105`, 1440 × 3271
`pt 160`. "Work" + 부제 2줄:
> <span accent>더모먼트</span>는 주로 학교에 필요한 서비스를 개발합니다
> 입학부터 학생 정보 관리까지 학교 전산 전반을 혁신하고 있습니다

이어서 1280 × 720 카드 4장을 **간격 0으로** 세로로 붙여 쌓음. 각 카드는 이미지 한 장 (`object-cover`):

| 순서 | 노드 | 파일 | 내용 |
| --- | --- | --- | --- |
| 1 | `109:32` | `work/01-hello-gsm.png` | HELLO, GSM — 파란 대형 워드마크 + 태블릿 목업 |
| 2 | `109:30` | `work/02-ready-gsm.png` | READY, GSM — 파란 워드마크 + 브라우저 목업 |
| 3 | `109:31` | `work/03-every-gsm.png` | Every GSM — 붉은 워드마크 + 노트북 목업 |
| 4 | `109:33` | `work/04-data-gsm.png` | DataGSM — 검은 워드마크 + 데스크톱 목업 |

원본은 3840 × 2160 PNG (합계 약 13MB). 프로젝트가 이미 `.webp`를 쓰고 있으니 **투입 전 webp 변환 + 리사이즈 필요.**

### Contact — `110:44`, 1440 × 887
`py 160`, 블록 간격 80.
- "Contact" + 2줄: 협업, 합류, 의뢰 등 무엇이던지 고민하지 마세요 / <span accent>더모먼트</span>와 함께 순간을 혁신하세요
- 폼 (폭 600, 필드 간격 20). 각 필드 = 라벨 14 흰색 → 8 → 박스(1px 흰 테두리, padding 12, placeholder `#666` 14):

| 라벨 | placeholder | 형태 |
| --- | --- | --- |
| 성함을 입력해주세요 | 홍길동 | 한 줄 |
| 연락드릴 이메일을 입력해주세요 | hongildong@gmail.com | 한 줄 |
| 컨택 내용을 입력해주세요 | Server part로 팀 합류를 원합니다 | 높이 120 |

**제출 버튼이 디자인에 없음.** 전송 수단·전송처는 정해야 함.

---

## 3. 현재 코드와의 차이

- 지금 사이트는 **흰 바탕 + 잉크**, 디자인은 **검정 + 성운 + 파랑 강조**. `src/index.css`의 hero band / dot-field 반전 장치는 전제가 사라짐.
- 섹션 구성은 그대로 대응됨: Hero / Intro→About / Values / (신규) Member / Projects→Work / Contact.
- **Member 섹션은 코드에 없음** — 새로 만들어야 함.
- **Footer는 디자인에 없음** — 유지할지 버릴지 결정 필요.
- 디자인은 1440 고정 폭 한 벌뿐 — **모바일 시안 없음.** 반응형 규칙은 코드 쪽 판단.
- `--text-*`, `--spacing-*` 토큰은 지금의 흰 바탕 스케일에 맞춰진 값이라 재산정 대상.

## 4. 받아둔 에셋

```
design-import/
  hero/  starfield.png (1919×1028) · logo-mark.svg · scroll-chevron.svg · hero-export.png (참고용 렌더)
  work/  01-hello-gsm.png · 02-ready-gsm.png · 03-every-gsm.png · 04-data-gsm.png (각 3840×2160)
  screens/ full-page.png · work-section.png (참고용 시안 캡처)
```

---

## 5. 구현하면서 달라진 것 (2026-08-30)

시안은 정지 이미지 한 장이라 말할 수 없었던 것들. 코드가 기준이다.

| 항목 | 시안 | 구현 |
| --- | --- | --- |
| 배경 | Hero에 성운 PNG 1장 | **파티클 캔버스**(`shared/lib/particleField.ts`)를 문서 전체 뒤에 `fixed`로 깔고, Hero만 원본 그대로 / 나머지 섹션은 `rgba(0,0,0,0.6)` 베일. 시안의 섹션 배경 60%가 원래 이걸 위한 값이었음 |
| Member 그룹핑 | 파트 탭 (Frontend/Server/Design/DevOps) | **기수별 그룹**. Design 2명·DevOps 2명이라 파트로 나누면 두 칸이 빔. 파트는 카드에 표기 |
| Member 데이터 | 하드코딩 14명 | 노션 DB → 서버 컴포넌트 + ISR 1시간 |
| Values 3행 | 01만 흰색, 02·03 회색 고정 | 포인터/포커스를 따라가는 **상태**. 기본값은 시안대로 01. 활성 행에만 설명 한 줄이 열림 |
| Contact | 제출 버튼 없음 | 버튼 추가(브랜드 블루, hover 시 반전) + 서버 액션 전송 |
| 반응형 | 1440 한 벌 | `--spacing-*` / `--text-*` 를 clamp 범위로. 1440에서는 시안 값 그대로 |
| Footer | 없음 | 없음 (Claude Design에서 별도 제작 예정) |

에셋은 `design-import/`가 아니라 `public/` 에 있다 — `public/work/*.png` (4장, 3840×2160 원본, next/image가 AVIF/WebP로 재인코딩), `public/hero/logo-mark.svg`.
성운 PNG는 파티클 캔버스로 대체되어 삭제했다.

### 인트로 오버레이 (핸드오프 반영)

`src/widgets/intro/` — 전달받은 `IntroOverlay.tsx` / `.module.css` 기준. 프로젝트에 맞춰 고친 곳:

- **베일 색** `#E2E7F3` 계열 라이트/다크 토큰 → **`#000000` 단색**. 베일 뒤에 있는 건 히어로 = 파티클 캔버스이고 그건 불투명 `#000000`을 칠한다. 페이지 토큰(`--color-ink` `#050506`)을 쓰면 페이드 마지막 프레임에 5단계짜리 이음매가 화면을 가로지른다. 라이트 테마 분기와 `radial-gradient` 리프트는 제거(별밭 위에서 얼룩으로 읽힘).
- **`--font-pretendard`** 를 `.intro` 안에서 정의. next/font를 안 쓰고 CDN으로 Pretendard Variable을 받으므로 이 변수가 비어 있었고, 정의되지 않은 `var()`는 `font-family` 선언 전체를 무효화해 워드마크가 serif로 떨어진다. (전달된 `pretendard-600-latin.woff2`는 그래서 불필요 — 넣지 않았다.)
- **히어로 로고 제거.** 도킹된 인트로 로고가 히어로가 그리던 상단 중앙 마크와 같은 자리다. 인트로 쪽이 남고(고정 배치, 스크롤 160px에 페이드), 히어로 헤더에 `pt-[100px] lg:pt-8`로 자리를 비워줬다.
- **파티클 필드와 타이밍 결합.** 필드가 430ms에 마크를 모아버려서 베일이 걷힐 땐 이미 아이콘 순환 중이었다. `INTRO`(shared/lib/timing.ts)를 두고 `ParticleField openDelay={INTRO.ends}`로 넘겨, 덮개가 걷히는 순간 알갱이가 모이기 시작한다. 이에 맞춰 필드 마운트를 layout → LandingPage로 옮겼다.

검증(핸드오프 §6): 도킹 후 중심 y=64 / 좌우 중앙 ✓, 베일 opacity 0 ✓, `pointer-events:none`이고 화면 중앙 hit-test가 히어로를 집음 ✓, SSR HTML에 `.run` 포함 ✓, 375px에서 로고 23~81px·네비 100px로 충돌 없음 ✓.
