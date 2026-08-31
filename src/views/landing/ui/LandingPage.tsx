import ParticleField from "@/shared/ui/ParticleField";
import { INTRO } from "@/shared/lib/timing";
import IntroOverlay from "@/widgets/intro/ui/IntroOverlay";
import HeroSection from "@/widgets/hero/ui/HeroSection";
import AboutSection from "@/widgets/about/ui/AboutSection";
import ValuesSection from "@/widgets/values/ui/ValuesSection";
import TeamSection from "@/widgets/team/ui/TeamSection";
import WorkSection from "@/widgets/work/ui/WorkSection";
import ContactSection from "@/widgets/contact/ui/ContactSection";
import Footer from "@/widgets/footer/ui/Footer";

/* The page, in the order the design file lays it out. Everything here is a
   server component except the two that need state — the values list and the
   contact form — so what reaches the browser is finished HTML with the team
   already in it.

   Every section holds at least a full screen and centres what it contains,
   so the page reads as one screen at a time rather than as blocks of wildly
   different height — About was 318px against Work's 3200. It is a minimum,
   not a height: Work is four stills stacked and is meant to run long, and
   the team grid grows with the roster.

   The footer is the one part not in the Figma file — it comes from a
   separate reference the team supplied.

   The intro belongs to this page rather than the layout — the opening is
   for arriving at the landing, and any other route the site grows would
   otherwise replay it. It sits outside <main> because it is a cover over
   the page, not part of the document's content, and it carries the site's
   top logo once it has docked. */
export default function LandingPage() {
  return (
    <>
      {/* The backdrop, and the cover over it, mounted together because their
          timing is one thing: the field holds its dust until the intro has
          lifted, then gathers into the mark. Started earlier it would do all
          of that behind an opaque veil, and the hero would be revealed onto
          an animation already halfway through its icon cycle. */}
      <ParticleField openDelay={INTRO.ends} />
      <IntroOverlay />
      <main className="flex w-full flex-col items-stretch">
        <HeroSection />
        <AboutSection />
        <ValuesSection />
        <TeamSection />
        <WorkSection />
        <ContactSection />
      </main>
      {/* Outside <main>: it is the page furniture, not the page. */}
      <Footer />
    </>
  );
}
