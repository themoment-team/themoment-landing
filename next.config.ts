import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Pinned to this directory. Turbopack walks up looking for a lockfile and
     finds one in the user's home folder, outside the repo, then warns that
     it is ignoring it — on every start. */
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },

  images: {
    /* The four project stills are 3840x2160 masters straight out of the
       design file. next/image re-encodes them on demand, so the repo keeps
       the master and a visitor is served an AVIF a fraction of its size at
       whatever width their screen actually asks for. */
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
