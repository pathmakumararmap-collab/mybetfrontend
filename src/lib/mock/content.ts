import type { InfoPage, Promotion, Tournament } from "@/lib/schemas";

export const PROMOTIONS: Promotion[] = [
  {
    slug: "first-deposit-bonus", title: "First deposit bonus", kicker: "100% bonus", category: "sports",
    summary: "100% up to LKR 50,000 on your first deposit.", cta: "Get bonus", action: "register",
    facts: [{ label: "Bonus", value: "100%" }, { label: "Max", value: "LKR 50k" }, { label: "Wager", value: "x5" }],
    sections: [
      { heading: "How to get it", paragraphs: [
        "Register an account and confirm your phone number.",
        "Make your first deposit through an authorised Mybet cash agent. The bonus is credited automatically within 24 hours.",
      ] },
      { heading: "Wagering", paragraphs: [
        "Wager the bonus 5 times on accumulator bets with at least three selections at odds of 1.40 or higher each.",
        "Wagering must be completed within 30 days of the bonus being credited.",
      ] },
      { heading: "Restrictions", paragraphs: ["One bonus per person, household, phone number and device. Mybet may withdraw the bonus if these rules are broken."] },
    ],
  },
  {
    slug: "accumulator-of-the-day", title: "Accumulator of the day", kicker: "Odds boost", category: "sports",
    summary: "Extra 10% odds boost on our daily accumulator.", cta: "Bet now", action: "/line",
    facts: [{ label: "Boost", value: "+10%" }, { label: "Selections", value: "4+" }],
    sections: [{ heading: "How it works", paragraphs: ["Every day our traders pick an accumulator. Add all selections to your bet slip to receive the boosted odds."] }],
  },
  {
    slug: "weekly-cashback", title: "Cashback", kicker: "Up to 10%", category: "casino",
    summary: "Up to 10% weekly cashback on casino games.", cta: "Get bonus", action: "register",
    facts: [{ label: "Cashback", value: "10%" }, { label: "Paid", value: "Monday" }],
    sections: [{ heading: "How it works", paragraphs: ["Cashback is calculated on your net casino losses from Monday to Sunday and credited every Monday."] }],
  },
  {
    slug: "weekly-slots-race", title: "Weekly Slots Race", kicker: "Tournament", category: "tournaments",
    summary: "Prize pool LKR 1,000,000 every week.", cta: "Take part", action: "/bonus/casino/tournaments/weekly-slots-race",
    facts: [{ label: "Prize pool", value: "LKR 1M" }],
    sections: [{ heading: "How to take part", paragraphs: ["Play any slot from the tournament list. Every LKR 100 wagered earns one point."] }],
  },
  {
    slug: "mybet-games-jackpot", title: "Mybet Games jackpot", kicker: "Jackpot", category: "games",
    summary: "Hit the jackpot in any Mybet game.", cta: "Play now", action: "/allgamesentrance",
    facts: [{ label: "Jackpot", value: "LKR 2.4M" }],
    sections: [{ heading: "How it works", paragraphs: ["A share of every Mybet Games bet goes into the jackpot. It can drop on any round."] }],
  },
  {
    slug: "birthday-bonus", title: "Birthday bonus", kicker: "Free bet", category: "sports",
    summary: "A free bet from us on your birthday.", cta: "More info", action: "/bonus/rules/birthday-bonus",
    facts: [{ label: "Free bet", value: "LKR 1,000" }],
    sections: [{ heading: "Who can get it", paragraphs: ["Players with a verified account and at least one deposit in the last 30 days receive a free bet on their birthday."] }],
  },
];

export const TOURNAMENTS: Tournament[] = [
  {
    id: "weekly-slots-race", title: "Weekly Slots Race", summary: "Prize pool LKR 1,000,000",
    prizePool: "LKR 1M", participants: 2418, endsAt: "2026-11-16T23:59:00+05:30",
    leaderboard: [
      { place: 1, player: "user***41", points: 18240, prize: "LKR 300,000" },
      { place: 2, player: "user***07", points: 16905, prize: "LKR 200,000" },
      { place: 3, player: "user***88", points: 15112, prize: "LKR 100,000" },
      { place: 4, player: "user***19", points: 12004, prize: "LKR 50,000" },
      { place: 5, player: "user***63", points: 11870, prize: "LKR 50,000" },
      { place: 6, player: "user***25", points: 10431, prize: "LKR 25,000" },
    ],
    sections: [
      { heading: "How to take part", paragraphs: ["Press Take part, then play any slot from the tournament list."] },
      { heading: "Scoring", paragraphs: ["Every LKR 100 wagered earns one point. Bonus money does not count.", "If two players have the same score, the one who reached it first ranks higher."] },
      { heading: "Prizes", paragraphs: ["Prizes are credited within 24 hours after the tournament ends and have no wagering requirement."] },
    ],
  },
];

const legalNote = "This is template text for the Mybet website. Have it reviewed and replaced by your legal counsel before launch.";

export const INFO_PAGES: InfoPage[] = [
  { slug: "about", title: "About us", icon: "users", sections: [
    { heading: "Who we are", paragraphs: ["Mybet is a sports betting and casino brand for players in Sri Lanka and the region, with live betting on cricket, football and more than 30 other sports."] },
    { heading: "How we work", paragraphs: ["Deposits and withdrawals are handled by authorised Mybet cash agents, so you can pay in cash or through local payment apps."] },
    { heading: "Responsible gaming", paragraphs: ["Betting is for adults aged 18 and over. Read our responsible gaming page for limits and self-exclusion."] },
  ] },
  { slug: "terms", title: "Terms and Conditions", icon: "list", sections: [
    { heading: "Important", paragraphs: [legalNote] },
    { heading: "Accounts", paragraphs: ["You must be 18 or older and may hold only one account. Account details must be accurate and kept up to date."] },
    { heading: "Bets", paragraphs: ["A bet is accepted when it appears in My Bet with a bet number. Mybet may void bets placed on obviously wrong odds."] },
  ] },
  { slug: "privacy", title: "Privacy Policy", icon: "lock", sections: [
    { heading: "Important", paragraphs: [legalNote] },
    { heading: "What we collect", paragraphs: ["Your phone number, account and transaction history, and technical data needed to run and secure the service."] },
    { heading: "Your rights", paragraphs: ["You can ask for a copy of your data or for it to be corrected or deleted by contacting support."] },
  ] },
  { slug: "cookies", title: "Cookie Policy", icon: "info", sections: [
    { heading: "Cookies we use", paragraphs: ["Essential cookies keep you logged in and protect your account. We do not use advertising cookies without your consent."] },
  ] },
  { slug: "contacts", title: "Contacts", icon: "headset", sections: [
    { heading: "Customer support", paragraphs: ["Support is available 24/7 by live chat on the website and by phone."] },
  ] },
  { slug: "payment-methods", title: "Payment methods", icon: "dollar", sections: [
    { heading: "Deposits", paragraphs: ["Deposits are made through authorised Mybet cash agents. Give the agent your Mybet account ID and the amount; the balance appears in your account within minutes."] },
    { heading: "Withdrawals", paragraphs: ["You can withdraw after wagering your deposits at least once (1:1). Request a withdrawal and collect it from your agent."] },
    { heading: "Safety", paragraphs: ["Only use agents listed by Mybet support. Mybet staff will never ask for your password."] },
  ] },
  { slug: "how-to-bet", title: "How to bet", icon: "info", sections: [
    { heading: "Place a bet", paragraphs: ["Click the odds of an outcome to add it to the bet slip, enter your stake and press Place bet.", "Add several selections from different matches to build an accumulator: the odds are multiplied."] },
  ] },
  { slug: "betting-rules", title: "Betting rules", icon: "list", sections: [
    { heading: "Important", paragraphs: [legalNote] },
    { heading: "Settlement", paragraphs: ["Bets are settled on the official result. Cricket markets follow the official scorecard; football markets cover 90 minutes plus stoppage time."] },
  ] },
  { slug: "responsible-gaming", title: "Responsible gaming", icon: "users", sections: [
    { heading: "Play safely", paragraphs: ["Only bet what you can afford to lose and set yourself a budget before you play.", "Take breaks and never chase losses."] },
    { heading: "Need a break?", paragraphs: ["Contact support at any time to set deposit limits or to close your account for a period of your choice."] },
  ] },
  { slug: "mobile-app", title: "Mobile application", icon: "android", sections: [
    { heading: "Android app", paragraphs: ["Bet on the go with the Mybet Android app: live odds, instant bet slip and push notifications for your matches."] },
  ] },
];
