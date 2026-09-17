/* The four services, in the order the comp stacks them.

   Lifted out of the section because two things need them now. The section
   draws them; the document's structured data lists them, so that a crawler
   is told in as many words that the team on this page is the team behind
   HelloGSM — which is the one association worth making. Those service names
   are searched; "더모먼트" on its own is a name shared with cafés, wedding
   studios and a clinic, and competing for it head-on is not a fight this
   page can win. Being the answer to "HelloGSM 만든 팀" is. */
export type WorkItem = {
  src: string;
  name: string;
  note: string;
  href?: string;
};

export const WORK: WorkItem[] = [
  {
    src: "/work/hello-gsm.png",
    name: "HelloGSM",
    note: "광주소프트웨어마이스터고 입학지원시스템",
    href: "https://www.hellogsm.kr",
  },
  {
    src: "/work/every-gsm.png",
    name: "EveryGSM",
    note: "광주소프트웨어마이스터고등학교의 모든 프로젝트를 한곳에",
    href: "https://www.every.datagsm.kr",
  },
  {
    src: "/work/ready-gsm.png",
    name: "ReadyGSM",
    note: "광주소프트웨어마이스터고 학과체험 신청 서비스",
    href: "https://readygsm-client-chskm2ptd-the-moment.vercel.app",
  },
  {
    src: "/work/data-gsm.png",
    name: "DataGSM",
    /* No href, and that is the section's existing decision, not an
       oversight: the card reads "교내 서비스입니다" instead. Structured data
       follows it — an entry with no url is still a named thing the team
       made, which is what the list is for. */
    note: "광주소프트웨어마이스터고등학교 OpenAPI 및 OAuth 플랫폼",
  },
];
