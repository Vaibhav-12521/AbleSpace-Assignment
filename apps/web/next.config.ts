import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // `next dev` otherwise writes AGENTS.md / CLAUDE.md into the app directory on
  // every boot, which would show up as noise in this repo.
  agentRules: false,
};

export default nextConfig;
