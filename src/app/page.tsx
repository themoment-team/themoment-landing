import LandingPage from "@/views/landing/ui/LandingPage";

/* The team is the only thing on the page that changes without a deploy, and
   it changes in Notion. The fetch inside getTeamMembers carries the same
   hour, but it is skipped entirely when the key is missing — and a route
   whose every fetch was skipped is prerendered once and never revisited. So
   the hour is declared here too, where it holds whatever the fetch does. */
export const revalidate = 3600;

export default function Page() {
  return <LandingPage />;
}
