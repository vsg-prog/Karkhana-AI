// Cafeteria small-talk — Karkhana AI edition.
//
// An agent's chai break or tiffin break is an excuse for a quick one-liner in character.
// Two kinds of line:
//   • solo  — one quip shown above a single agent at a break spot
//   • pair  — a multi-beat exchange between two agents at the same table
//
// Lines are kept short so they fit the ThoughtBubble (≈MAX_WIDTH). Character
// keys match OfficeCharacterName; anyone without bespoke lines falls back to the
// shared GENERIC pool so the floor never feels empty.

import type { OfficeCharacterName } from './cast';

/** Where an agent is lingering — picks a contextual line pool. */
export type BreakSpot = 'coffee' | 'vending' | 'snack' | 'table';

const pick = <T,>(arr: readonly T[], seed: number): T =>
  arr[((seed % arr.length) + arr.length) % arr.length];

// ─── solo lines, by spot ─────────────────────────────────────────────────────

const COFFEE: readonly string[] = [
  'is this… decaf cutting chai?? who did this',
  'bhai, extra adrak in the chai today please',
  'first cutting chai of the day. and the fifth.',
  'the 4 PM chai tapri break is sacred',
  'who took my ceramic tea mug?',
  'filter coffee here hits different',
  'the kettle is boiling! grab your cups',
  'no code review before cutting chai',
];

const VENDING: readonly string[] = [
  'vending machine ate my 20 rupee note',
  'B4… please let it be Kurkure',
  'samosa is stuck in the slot. classic.',
  'shaking it gently… respectful tech touch',
  'one (1) emotional-support Bhujia packet',
  'A1 again. Haldiram’s living dangerously.',
  'out of banana chips? disaster.',
];

const SNACK: readonly string[] = [
  'is it Samosa Tuesday?',
  'who finished the South Indian chips??',
  'just a little Mathri break',
  'tiffin boxes are open, share the Parathas!',
  'post-lunch biryani coma setting in…',
  'home-cooked snack hits the spot',
];

const TABLE: readonly string[] = [
  'big deployment day. lots of PRs.',
  'just five minutes of chai break',
  'pretending to read sprint retrospective notes',
  'I needed this break honestly',
  'do NOT tell Nitya I’m taking an extended break',
  'Bangalore traffic took 2 hours today...',
];

const SPOT_POOL: Record<BreakSpot, readonly string[]> = {
  coffee: COFFEE, vending: VENDING, snack: SNACK, table: TABLE,
};

// ─── character flavour — overrides the generic pool when present ─────────────

const BY_CHARACTER: Partial<Record<OfficeCharacterName, readonly string[]>> = {
  nitya:   ['I DECLARE… PRODUCTION DEPLOYMENT!', 'that’s what the PR said', 'no meetings before chai. that’s the rule.', 'we are scaling to 10M DAU!'],
  devi:    ['FALSE.', 'pushing to main without test coverage is a crime', 'that PR adheres to security compliance', 'Schrute Tech Hub had better chai'],
  vikram:  ['bears. beets. Bangalore traffic.', 'I moved Devi’s mechanical keyboard again', 'just here for cutting chai & gossip', 'did you push to main without review?'],
  kavi:    ['Karkhana AI, this is Kavi', 'sketching the UI wireframes', 'documentation is 80% of product quality'],
  rudra:   ['system SRE status: 99.999% uptime', 'who dropped the staging database?', 'kubernetes cluster is self-healing'],
  ananya:  ['did you see the new Tailwind design system?', 'making the UI pop!', 'glassmorphism component is ready'],
  arjun:   ['fine-tuning the LLM model on VRAM', 'neural net loss curve looking smooth', 'more GPU memory please'],
  priya:   ['README is updated with deployment steps', 'checking API docs formatting', 'tech writing requires hot chai'],
  sanjay:  ['is it Chai Day yet?', 'sysadmin server reboot done. leave me be.', 'I will retire before legacy migration finishes'],
  aarav:   ['I should file a bug ticket for that…', 'automation test suite is 100% green', 'no one ever sits with compliance'],

  // Legacy fallback support
  dwight:   ['FALSE.', 'identity theft is not a joke', 'that mug is regulation'],
  jim:      ["...that's what she said", 'bears. beets. Battlestar Galactica.'],
  pam:      ['Dunder Mifflin, this is Pam', 'sketching the vending machine'],
  kevin:    ['the chili is NOT ready', 'why waste time say lot word'],
  angela:   ['this break room is filthy', 'party planning committee, 3pm'],
  oscar:    ['actually, it’s “espresso”', 'well, actually…'],
  stanley:  ['is it Pretzel Day?', 'did I stutter?'],
  phyllis:  ['knitting and a nice cup of tea'],
  andy:     ['rit-dit-dit, coffee break!'],
  kelly:    ['did you HEAR what happened??'],
  ryan:     ['the temp needs caffeine'],
  toby:     ['I should write that up…'],
  creed:    ['which one of you is the new guy?'],
  meredith: ['is it 5 o’clock yet?'],
};

/** A solo break-room line. Character flavour ~60% of the time, else the line
 *  fits the spot the agent is standing at. `seed` keeps it deterministic per
 *  call site (avoids Math.random, which Pixi/Electron CSP-safe code prefers). */
export function pickSoloLine(character: OfficeCharacterName, spot: BreakSpot, seed: number): string {
  const flavour = BY_CHARACTER[character];
  if (flavour && seed % 5 < 3) return pick(flavour, Math.floor(seed / 5));
  return pick(SPOT_POOL[spot], seed);
}

// ─── paired exchanges (two agents at one table) ──────────────────────────────

type Exchange = readonly string[];

const EXCHANGES: readonly Exchange[] = [
  ['world’s best CTO.', 'you are. I had the mug custom printed.', 'and I cherish it.'],
  ['would an amateur push to main?', '...if yes, I don’t.', 'that’s my tech lead.'],
  ['question. how many microservices?', 'one.', 'that’s a monolith.'],
  ['fact: Bangalore traffic builds character.', 'and delays standup.', 'precisely.'],
  ['what’s the staging server smell like?', 'victory. and burnt filter coffee.'],
  ['is a samosa a sandwich?', 'it is a savory pastry.', 'close enough.'],
  ['standup ran 45 minutes.', 'could’ve been a 2-line Slack message.'],
  ['is the build green yet?', '...don’t look at CI right now.'],
  ['who reply-all’d the engineering team?', 'we don’t talk about it.'],
  ['I wrapped your mouse in Jello.', 'I’ll eat around it.', 'fair.'],
  ['bhai, cutting chai ready hai!', 'coming right now, save a samosa.'],
  ['post-lunch biryani coma?', '100%. cannot read code now.'],
  ['did you push without running tests?', 'CI will catch it.', 'CI is failing.'],
  ['who took the last samosa?', 'Devi.', '...never mind then.'],
  ['deploying to production on Friday?', 'living dangerously.', 'always.'],
  ['did you read the PR description?', 'no.', 'me neither.'],
];

const TWSS_EXCHANGES: readonly Exchange[] = [
  ['taking way longer than I expected.', 'that’s what the tech lead said.'],
  ['it’s too big, can’t fit it in memory.', 'that’s what the SRE said.'],
  ['you really need to slow down.', 'that’s what compliance said.'],
  ['gonna need a bigger cluster.', 'that’s what DevOps said.'],
  ['I can’t do this all night.', 'that’s what the reviewer said.'],
  ['it’s not that hard if you just push.', 'that’s what git said.'],
  ['hours in and barely halfway done.', 'that’s what the sprint said.'],
  ['surprisingly heavy for its size.', 'that’s what the bundle said.'],
];

const PAIR_POOL: readonly Exchange[] = [...EXCHANGES, ...TWSS_EXCHANGES];

const KEYED_EXCHANGES: Partial<Record<OfficeCharacterName, Exchange>> = {
  nitya:   ['that’s what the PR said.', '...there it is.'],
  devi:    ['pushing to main without tests is a crime.', 'nobody bypassed CI, Devi.'],
  vikram:  ['bears. beets. Bangalore traffic.', 'just merge it already.'],
  kavi:    ['did you check the user stories?', 'we’re agile, Kavi.'],
  rudra:   ['kubernetes cluster is down.', 'did you try restarting it?'],
  ananya:  ['the UI needs more padding.', 'it already has 32px!'],
  arjun:   ['we need more GPUs.', 'we don’t have budget for A100s.'],
  priya:   ['is the API doc updated?', 'it will be after release.'],
  sanjay:  ['is it Chai Day?', 'every day is Chai Day, Sanjay.'],
  aarav:   ['I’m filing a ticket.', '...for a typo?'],

  // Legacy fallback
  dwight:  ['identity theft is not a joke.', 'nobody touched your stapler, Dwight.'],
  jim:     ['question.', 'yes.', 'nothing. just checking.'],
};

/** A multi-beat exchange for two agents sharing a table. Beats alternate:
 *  index 0 = `speaker`, 1 = the table-mate, 2 = speaker, … */
export function pickExchange(speaker: OfficeCharacterName, seed: number): Exchange {
  const keyed = KEYED_EXCHANGES[speaker];
  if (keyed && seed % 4 === 0) return keyed;
  return pick(PAIR_POOL, seed);
}
