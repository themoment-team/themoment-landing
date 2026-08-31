import Image from "next/image";
import Reveal from "@/shared/ui/Reveal";
import RevealGroup from "@/shared/ui/RevealGroup";
import { BEAT, GROUP, beat } from "@/shared/lib/timing";

/* Four stills, stacked edge to edge with no gap between them, exactly as the
   comp has it. Each carries its own wordmark burnt into the artwork, so at
   rest nothing is set over them.

   The name and the line under it come up inside the frame on hover. They are
   also the alt text, which is where a reader who cannot see the image finds
   them either way — so the overlay is decoration and marked as such.

   Two by two rather than the comp's full-width stack: four frames at the
   width of the column ran to nearly four screens, and the set reads as a
   set when it can be seen as one. */
const WORK = [
  {
    src: "/work/hello-gsm.png",
    name: "HelloGSM",
    note: "광주소프트웨어마이스터고 입학지원시스템",
  },
  {
    src: "/work/every-gsm.png",
    name: "EveryGSM",
    note: "광주소프트웨어마이스터고등학교의 모든 프로젝트를 한곳에",
  },
  {
    src: "/work/ready-gsm.png",
    name: "ReadyGSM",
    note: "광주소프트웨어마이스터고 학과체험 및 입학설명회 신청 서비스",
  },
  {
    src: "/work/data-gsm.png",
    name: "DataGSM",
    note: "광주소프트웨어마이스터고등학교 OpenAPI 및 OAuth 플랫폼",
  },
];

export default function WorkSection() {
  return (
    <section id="work" className="relative flex min-h-dvh w-full flex-col bg-white">
      <RevealGroup className="mx-auto flex w-full grow flex-col justify-center items-center px-gutter py-roomy">
        <Reveal as="h2" className="text-display font-bold text-graphite">
          Work
        </Reveal>
        <Reveal as="p" delay={BEAT} className="mt-stack text-center text-body font-medium text-graphite">
          <span className="text-accent">더모먼트</span>는 주로 학교에 필요한 서비스를 개발합니다
          <br className="hidden sm:inline" />{" "}
          입학부터 학생 정보 관리까지 학교 전산 전반을 혁신하고 있습니다
        </Reveal>

        {/* Two by two, and butted straight against each other the way the
            comp butts its stack — no gap, so the four read as one block
            rather than as four cards. One column on a phone, where half the
            width would leave a 16:9 frame too small to make anything out. */}
        <ul className="mt-block grid w-full grid-cols-1 sm:grid-cols-2">
          {WORK.map((item, i) => (
            <Reveal
              as="li"
              key={item.src}
              delay={beat(i, GROUP)}
              className="group relative w-full"
            >
              {/* 16:9, the ratio of both the 1280x720 frames in the comp and
                  the 3840x2160 masters they were cut from. */}
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={`${item.name} — ${item.note}`}
                  fill
                  /* The column is the screen less its two gutters, which at
                     the comp's 1440 is 1280 of 1440 — near enough 89vw at
                     any width. Without this Next assumes 100vw and fetches
                     one size larger than the slot for every frame. */
                  sizes="89vw"
                  className="object-cover"
                />

                {/* Held inside the frame and against its bottom edge. The
                    scrim is part of the same layer as the text so the two
                    arrive together — a separately faded scrim reads as the
                    picture dimming and the words following it.

                    pointer-events-none so the overlay cannot be what the
                    pointer is over: without it, appearing under the cursor
                    would end the hover it was triggered by and the caption
                    would flicker. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-6 pt-24 pb-6 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 sm:px-8 sm:pt-28 sm:pb-8"
                >
                  <p className="text-headline font-bold text-white">{item.name}</p>
                  <p className="text-body font-medium text-white/80">{item.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </RevealGroup>
    </section>
  );
}
