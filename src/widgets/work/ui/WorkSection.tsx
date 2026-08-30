import Image from "next/image";
import Reveal from "@/shared/ui/Reveal";
import RevealGroup from "@/shared/ui/RevealGroup";
import { BEAT, GROUP, beat } from "@/shared/lib/timing";

/* Four stills, stacked edge to edge with no gap between them, exactly as the
   comp has it. Each already carries its own wordmark burnt into the artwork,
   so nothing is set over them — the alt text is where the name and the
   description live, which is the only place a reader who cannot see the
   image would find them either way. */
const WORK = [
  {
    src: "/work/hello-gsm.png",
    alt: "HelloGSM — 광주소프트웨어마이스터고 입학지원시스템",
  },
  {
    src: "/work/ready-gsm.png",
    alt: "ReadyGSM — 광주소프트웨어마이스터고 학과체험 및 입학설명회 신청 서비스",
  },
  {
    src: "/work/every-gsm.png",
    alt: "EveryGSM — 광주소프트웨어마이스터고등학교의 모든 프로젝트를 한곳에",
  },
  {
    src: "/work/data-gsm.png",
    alt: "DataGSM — 광주소프트웨어마이스터고등학교 OpenAPI 및 OAuth 플랫폼",
  },
];

export default function WorkSection() {
  return (
    <section id="work" className="relative flex min-h-dvh w-full flex-col bg-veil scroll-mt-16">
      <RevealGroup className="mx-auto flex w-full max-w-column grow flex-col justify-center items-center px-gutter py-section">
        <Reveal as="h2" className="text-display font-bold text-white">
          Work
        </Reveal>
        <Reveal as="p" delay={BEAT} className="mt-stack text-center text-body font-medium text-white">
          <span className="text-accent">더모먼트</span>는 주로 학교에 필요한 서비스를 개발합니다
          <br className="hidden sm:inline" />{" "}
          입학부터 학생 정보 관리까지 학교 전산 전반을 혁신하고 있습니다
        </Reveal>

        <ul className="mt-block flex w-full flex-col">
          {WORK.map((item, i) => (
            <Reveal as="li" key={item.src} delay={beat(i, GROUP)} className="w-full">
              {/* 16:9, which is the ratio of both the 1280x720 frames in the
                  comp and the 3840x2160 masters they were cut from. */}
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  /* The column is capped at 1280 and the images are the full
                     width of it, so this is the whole story: the viewport
                     below that cap, 1280 above it. Without it Next assumes
                     100vw and serves a 2560-wide file to a 1280 slot. */
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover"
                  /* The first still sits just below the fold on a laptop and
                     is the largest thing on the page; the other three are
                     far enough down to wait. */
                  priority={i === 0}
                />
              </div>
            </Reveal>
          ))}
        </ul>
      </RevealGroup>
    </section>
  );
}
