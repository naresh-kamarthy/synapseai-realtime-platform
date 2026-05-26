/**
 * SynapseAI — Brand Configuration
 * 
 * Central source of truth for all branding tokens, metadata, and SEO configuration.
 * Every visual surface in the application should reference these values.
 */

// ─── Brand Identity ────────────────────────────────────────────────────
export const BRAND = {
  name: 'SynapseAI',
  tagline: 'Real-Time AI Collaboration Platform',
  subtitle: 'Multi-Agent Sandbox',
  description: 'Real-time multi-model AI collaboration platform with parallel streaming, side-by-side comparative diagnostics, and enterprise-grade collaborative workspaces.',
  version: 'v2.4.0',
  author: 'SynapseAI Engineering',
  url: 'https://synapseai.dev',
} as const;

// ─── Page Title System ─────────────────────────────────────────────────
export const PAGE_TITLES: Record<string, string> = {
  '/': `Workspace | ${BRAND.name}`,
  '/login': `Login | ${BRAND.name}`,
  '/register': `Register | ${BRAND.name}`,
  '/admin': `Admin Dashboard | ${BRAND.name}`,
  '/admin/dashboard': `Admin Dashboard | ${BRAND.name}`,
  '/admin/users': `User Management | ${BRAND.name}`,
  '/admin/workspaces': `Workspace Management | ${BRAND.name}`,
  '/admin/analytics': `Analytics | ${BRAND.name}`,
  '/admin/ai-monitoring': `AI Monitoring | ${BRAND.name}`,
  '/admin/audit-logs': `Audit Logs | ${BRAND.name}`,
  '/admin/settings': `Settings | ${BRAND.name}`,
} as const;

export const DEFAULT_TITLE = `${BRAND.name} — ${BRAND.tagline}`;

// ─── Brand Color System ────────────────────────────────────────────────
export const COLORS = {
  // Core brand palette
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',  // Indigo — primary brand color
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',  // Cyan — secondary accent
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  accent: {
    purple: '#a855f7',
    violet: '#8b5cf6',
    fuchsia: '#d946ef',
  },
  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  destructive: '#ef4444',
  info: '#3b82f6',
  // Surface & background (dark-mode-first)
  surface: {
    base: '#020617',
    elevated: '#0f172a',
    overlay: '#1e293b',
    subtle: '#334155',
  },
  // Chart / data visualization palette
  chart: [
    '#818cf8', // Indigo-400
    '#22d3ee', // Cyan-400
    '#a78bfa', // Violet-400
    '#34d399', // Emerald-400
    '#fb923c', // Orange-400
    '#f472b6', // Pink-400
    '#fbbf24', // Amber-400
    '#60a5fa', // Blue-400
  ],
} as const;

// ─── SEO & Meta Tags ───────────────────────────────────────────────────
export const SEO = {
  title: DEFAULT_TITLE,
  description: 'SynapseAI is a real-time multi-model AI collaboration platform. Stream responses from multiple AI models side-by-side, collaborate in shared workspaces, and gain enterprise-grade analytics — all in one unified interface.',
  keywords: [
    'AI collaboration',
    'multi-model AI',
    'real-time AI streaming',
    'AI SaaS platform',
    'collaborative AI workspace',
    'enterprise AI',
    'AI comparison tool',
    'parallel AI inference',
    'team AI workspace',
    'AI analytics dashboard',
  ].join(', '),
  robots: 'index, follow',
  themeColor: '#0f172a',
  // OpenGraph
  og: {
    type: 'website',
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: 'Stream, compare, and collaborate with multiple AI models in real-time. Enterprise-grade multi-model AI workspace for teams.',
    image: '/og-preview.png',
    url: BRAND.url,
    siteName: BRAND.name,
  },
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: 'Real-time multi-model AI streaming, side-by-side comparison, and collaborative workspaces. Built for teams.',
    image: '/og-preview.png',
    site: '@synapseai',
  },
} as const;

// ─── PWA Manifest Configuration ────────────────────────────────────────
export const PWA = {
  name: `${BRAND.name} — ${BRAND.tagline}`,
  shortName: BRAND.name,
  description: BRAND.description,
  themeColor: '#0f172a',
  backgroundColor: '#020617',
  display: 'standalone' as const,
  orientation: 'portrait' as const,
  startUrl: '/',
  scope: '/',
  icons: [
    { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
    { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
    { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
    { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
    { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
} as const;
