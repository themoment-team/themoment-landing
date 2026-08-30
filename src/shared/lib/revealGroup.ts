"use client";

import { createContext, useContext } from "react";

/* One cue for a whole block of content. Without it every revealed element
   watches for itself, so a section animates in pieces as each one happens
   to cross the trigger line. Inside a group they all take the same moment
   and separate on their own delays instead.

   null means no group is above, and the element falls back to watching for
   itself. Kept out of the component file so that file exports only a
   component, which is what React Fast Refresh wants. */
export const RevealGroupContext = createContext<boolean | null>(null);

export const useRevealGroup = () => useContext(RevealGroupContext);
