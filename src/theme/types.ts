// ─────────────────────────────────────────────────────────────────────────────
// src/theme/types.ts
// All Theme-related TypeScript types.
// Imported by theme.ts to type the token objects, and can be imported by
// any component that needs to type a `theme` prop or a `useTheme()` return.
// ─────────────────────────────────────────────────────────────────────────────

export type ColorTokens = {
  // ── Surfaces ──────────────────────────────────────────────────────────────
  bgPage:        string;   // page/screen background
  bgCard:        string;   // card / sheet background
  bgCardBorder:  string;   // card border
  bgInput:       string;   // input field background
  bgInputBorder: string;   // input field border
  divider:       string;   // horizontal rule / separator

  // ── Brand ─────────────────────────────────────────────────────────────────
  primary:       string;   // main CTA, active states
  primaryDark:   string;   // links, pressed state
  primaryLight:  string;   // focus ring, tinted backgrounds

  // ── Semantic ──────────────────────────────────────────────────────────────
  success:       string;
  successBg:     string;
  danger:        string;
  dangerBg:      string;
  warning:       string;
  warningBg:     string;

  // ── Text ──────────────────────────────────────────────────────────────────
  textPrimary:   string;   // headings, body
  textSecondary: string;   // labels, captions
  textMuted:     string;   // placeholders, disabled
  textOnPrimary: string;   // text sitting on a primary-colored background

  // ── Misc ──────────────────────────────────────────────────────────────────
  shadow:        string;
};

export type SpacingTokens = {
  xs:  number;   // 4
  sm:  number;   // 8
  md:  number;   // 16
  lg:  number;   // 24
  xl:  number;   // 32
  xxl: number;   // 48
};

export type RadiusTokens = {
  sm:   number;  // 8
  md:   number;  // 12
  lg:   number;  // 16
  xl:   number;  // 20
  full: number;  // 9999
};

export type FontSizeTokens = {
  xs:   number;  // 11
  sm:   number;  // 13
  md:   number;  // 15
  lg:   number;  // 17
  xl:   number;  // 20
  xxl:  number;  // 28
  xxxl: number;  // 34
};

// Typed as string literals so StyleSheet accepts them without casting
export type FontWeightTokens = {
  regular:  '400';
  medium:   '500';
  semibold: '600';
  bold:     '700';
};

// ── Top-level Theme type — assembles all token groups ─────────────────────────
export type Theme = {
  colors:      ColorTokens;
  spacing:     SpacingTokens;
  radius:      RadiusTokens;
  fontSize:    FontSizeTokens;
  fontWeight:  FontWeightTokens;
  inputHeight: number;
};