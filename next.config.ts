import type { NextConfig } from "next";

// Security headers (incl. framing rules for /embed) are set in src/proxy.ts so
// they can be applied conditionally per request path.
const nextConfig: NextConfig = {};

export default nextConfig;
