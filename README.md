# THE MOMENT — Landing

더모먼트 소개 원페이지 랜딩. Figma 디자인을 Next.js로 옮긴 프로젝트입니다.

## 스택

- **Next.js 16** App Router + **React 19** (TypeScript)
- **Tailwind CSS v4** (`@tailwindcss/postcss`) — 설정 파일 없이 `globals.css`의 `@theme`에서 토큰 정의
- **oxlint**, **tsc**
- 폰트: Pretendard Variable, 유니코드 범위별 동적 서브셋 (jsDelivr CDN)
- 배포: Vercel

## 실행

```bash
npm install
npm run dev
```

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 (`http://localhost:3000`) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run members:inspect` | 노션 멤버 DB의 프로퍼티 이름·타입 덤프 |

환경변수는 [`.env.example`](.env.example)에 무엇이 왜 필요한지 적혀 있습니다. 셋 다 없어도
빌드와 실행은 됩니다 — 멤버는 하드코딩된 로스터로, 문의 폼은 "연결되지 않았습니다"로
동작합니다.

## 구조

Feature-Sliced Design. 아래로 갈수록 더 공용입니다 — 위층은 아래층만 가져다 씁니다.

```
src/
  app/                 라우트와 문서
    layout.tsx         메타데이터 · 구조화 데이터 · 폰트
    page.tsx           ISR 1시간
    globals.css        Tailwind 진입점 + @theme 토큰 + 전역 애니메이션
    robots.ts          robots.txt
    sitemap.ts         sitemap.xml
  views/landing/       페이지 조립 (섹션 순서)
  widgets/             한 화면을 차지하는 덩어리
    intro/             오프닝 — 검은 화면 · 덮개 · 워드마크 도킹
    hero/              첫 화면 (내비 + 스크롤 큐)
    about/  values/    소개 · 핵심 가치 3
    team/              멤버 — 파트별 가로 스크롤 rail
    work/              프로젝트 4
    contact/           문의 폼 (Web3Forms)
    footer/
  entities/teamMember/ 멤버 도메인
    model/types.ts     TeamMember
    model/roster.ts    하드코딩 33명 (노션 폴백)
    model/parts.ts     파트별 그룹핑
    api/               노션 읽기 + ISR
    ui/MemberTile.tsx  타일 하나
  shared/              어디서나 쓰는 것
    config/site.ts     이름 · 설명 · 절대 URL
    lib/               타이밍 상수 · IntersectionObserver · 파티클 필드
    ui/                Reveal · RevealGroup · ParticleField
scripts/               커밋되는 산출물의 생성기 (실행법은 각 파일 주석에)
  og-card.html         public/og.png
  touch-icon.html      public/apple-touch-icon.png
  search-icon.html     public/icon-*.png
  make-favicon-ico.mjs public/favicon.ico
```

## 데이터

**멤버.** [`roster.ts`](src/entities/teamMember/model/roster.ts)의 33명이 지금 화면에 나오는
목록입니다. 노션 리더는 완성돼 있고 `NOTION_SECRET_API_KEY` · `NOTION_MEMBER_DATABASE_ID`가
채워지면 그쪽을 읽습니다 — 키가 없거나, 노션이 실패하거나, 0명을 돌려주면 로스터로
돌아옵니다. 서버 컴포넌트에서 읽고 1시간 ISR이라 시크릿은 브라우저로 가지 않습니다.

**문의 폼.** Web3Forms로 보냅니다. 액세스 키는 서버에서 읽어 폼에 prop으로 내려주고 전송은
**브라우저에서** 일어납니다 — Web3Forms가 서버사이드 호출을 무료 플랜에서 차단하기
때문입니다 (Vercel 함수에서 부르면 403). 그래서 키는 페이지 소스에 노출되며, 그것이 이
API의 설계입니다. 자세한 사정은 [`sendContact.ts`](src/widgets/contact/api/sendContact.ts)
주석에 있습니다.

## 디자인 토큰

값과 그 값을 고른 이유는 전부 [`globals.css`](src/app/globals.css)의 `@theme` 블록에
주석으로 붙어 있습니다. 요약하면 —

| 용도 | 토큰 |
| --- | --- |
| 페이지 바닥 | `--color-ink` `#050506` |
| 섹션 덮개 | `--color-veil` `rgba(0,0,0,.6)` |
| 흰 배경 위 본문 | `--color-graphite` `#292b2f` |
| 포인트 | `--color-accent` `#4a80f8` |
| 보조 텍스트 | `--color-muted` `#666666` / 흰 배경에선 `--color-faint` |
| 실선 | `--color-line` `rgba(255,255,255,.22)` |

여백은 `--spacing-gutter` · `-section` · `-roomy` · `-block` · `-stack`, 타입은
`--text-display` · `-headline` · `-statement` · `-tab` · `-numeral` · `-body` · `-label`.
전부 `clamp()`이라 1440에서는 Figma 값 그대로, 좁아지면 같이 줄어듭니다.

## 애니메이션

- **오프닝** — 파티클 필드가 첫 프레임을 그릴 때까지 검은 화면, 그다음 덮개 60%와 워드마크,
  점이 다 모이면 내비와 스크롤 큐. `widgets/intro/ui/Opening.tsx`가 셋의 타이밍을 쥡니다.
- **스크롤 리빌** — `.reveal` + `RevealGroup`. 섹션 하나가 한 번에 깨어나고 안에서만
  스태거됩니다. `prefers-reduced-motion`에서는 아예 없습니다.
- **스냅 스크롤은 쓰지 않습니다.** CSS 스냅과 스크립트 글라이드를 둘 다 시도했다가
  뺐습니다 — 이유는 `globals.css` 상단 주석에 남겨뒀습니다.

## 남은 작업

- 노션 멤버 DB에 33명이 다 들어가 있지 않습니다. 키를 넣기 전에 명단부터 채워야
  로스터보다 나은 목록이 됩니다
- Design 2명 · DevOps 2명은 rail이 짧습니다. 데스크톱에서 두 파트를 한 행에 나란히 놓는
  안이 있으나, 붙여보고 판단하기로 했습니다
- `Our Value`가 내비에 없습니다. 내비 폭이 항목 4개 기준이라 넣으려면 히어로 쪽 결정이
  필요합니다
