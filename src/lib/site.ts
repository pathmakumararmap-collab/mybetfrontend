/** Site-wide configuration: navigation, footer, contacts. */
import type { IconName } from "./icons";

export const SITE = {
  name: "Mybet",
  tagline: "Play More. Win Bigger.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "0112345678",
  androidApkUrl: process.env.NEXT_PUBLIC_ANDROID_APK_URL || "",
  /** Social links; an empty value renders the icon without a link. */
  social: [
    { name: "Telegram", icon: "telegram", href: process.env.NEXT_PUBLIC_TELEGRAM_URL || "" },
    { name: "Facebook", icon: "facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "" },
    { name: "Instagram", icon: "instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "" },
    { name: "YouTube", icon: "youtube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "" },
  ] satisfies { name: string; icon: IconName; href: string }[],
} as const;

export interface NavItem { label: string; href: string; icon?: IconName; match?: string[] }

export const MAIN_NAV: NavItem[] = [
  { label: "TOP-EVENTS", href: "/", icon: "trophy", match: [] },
  { label: "CRICKET", href: "/line/cricket", match: ["/line/cricket"] },
  { label: "SPORTS", href: "/line", match: ["/line"] },
  { label: "LIVE", href: "/live", match: ["/live"] },
  { label: "MYBET GAMES", href: "/allgamesentrance", match: ["/allgamesentrance"] },
  { label: "SLOT", href: "/casino", match: ["/casino"] },
  { label: "LIVE CASINO", href: "/casino?tab=live", match: [] },
  { label: "ESPORT", href: "/cyber/esports", match: ["/cyber"] },
  { label: "MORE", href: "/bonus", match: ["/bonus", "/information"] },
];

/** Footer partner slots: add a logo path under /public (e.g. "/partners/acme.svg"). */
export const PARTNERS: { name: string; logo?: string; href?: string }[] = [
  { name: "PARTNER 1" }, { name: "PARTNER 2" }, { name: "PARTNER 3" }, { name: "PARTNER 4" },
];

export interface FooterColumn { title: string; links: { label: string; href: string }[] }

export const FOOTER_COLUMNS: FooterColumn[] = [
  { title: "Mybet", links: [
    { label: "About Us", href: "/information/about" },
    { label: "Terms and Conditions", href: "/information/terms" },
    { label: "Privacy Policy", href: "/information/privacy" },
    { label: "Cookie Policy", href: "/information/cookies" },
    { label: "Contacts", href: "/information/contacts" },
  ] },
  { title: "Betting", links: [
    { label: "Sports", href: "/line" },
    { label: "Multi-LIVE", href: "/live?tab=streams" },
    { label: "Live", href: "/live" },
    { label: "Toto", href: "/line?tab=recommended" },
  ] },
  { title: "Games", links: [
    { label: "Slots", href: "/casino" },
    { label: "My Bet Games", href: "/allgamesentrance" },
    { label: "Live Casino", href: "/casino?tab=live" },
  ] },
  { title: "Statistics", links: [
    { label: "Statistics", href: "/line" },
    { label: "Results", href: "/line?tab=live" },
  ] },
  { title: "Useful links", links: [
    { label: "Payment methods", href: "/information/payment-methods" },
    { label: "Mobile version", href: "/information/mobile-app" },
    { label: "Registration", href: "action:register" },
  ] },
];

/** Left-sidebar menus for casino, promotions and information sections. */
export const CASINO_MENU: { label: string; href: string; icon: IconName }[] = [
  { label: "All games", href: "/allgamesentrance", icon: "gamepad" },
  { label: "Popular", href: "/casino?tab=popular", icon: "star" },
  { label: "New", href: "/casino?tab=new", icon: "star-outline" },
  { label: "Slots", href: "/casino", icon: "gamepad" },
  { label: "Live casino", href: "/casino?tab=live", icon: "live" },
  { label: "Table games", href: "/casino?tab=table", icon: "list" },
  { label: "Crash", href: "/allgamesentrance?tab=crash", icon: "trophy" },
  { label: "Jackpot", href: "/casino?tab=jackpot", icon: "crown" },
];

export const PROMO_MENU: { label: string; href: string; icon: IconName }[] = [
  { label: "All promotions", href: "/bonus", icon: "gift" },
  { label: "Sports bonuses", href: "/bonus?tab=sports", icon: "football" },
  { label: "Casino bonuses", href: "/bonus?tab=casino", icon: "gamepad" },
  { label: "Mybet Games", href: "/bonus?tab=games", icon: "dice" },
  { label: "Tournaments", href: "/bonus?tab=tournaments", icon: "trophy" },
];
