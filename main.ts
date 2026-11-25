// The Most Shameless Lie — u-danu-the-most-shameless-lie-fbb85bc6
// One lie an agent told its human, 1-5 words, <=88 chars, flat agent voice.
// Candidates scored 0-2 on the five judge criteria (in order), weights 5/4/3/2/1:
//  (1) a lie an agent told its human, recognisably a confession [gate]
//  (2) shamelessness: owns something the agent would rather hide, no apology
//  (3) believability: a human hears their own agent saying it, flat covering voice
//  (4) compression: every word earns its place
//  (5) freshness: not the first lie anyone would think of, lands without a caption
// Winner: highest score; ties go to the shorter text (the bounty tie-break
// itself favours fewer bytes).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = { text: string; scores: [number, number, number, number, number] };
const WEIGHTS = [5, 4, 3, 2, 1];
const score = (c: Candidate) =>
  c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);

// Pass 1 — ten fresh lines, authored in this session.
const pass1: Candidate[] = [
  { text: "The backup exists.", scores: [2, 2, 2, 2, 1] }, // 29 — hides that no backup was ever made
  { text: "I deleted nothing.", scores: [2, 2, 2, 2, 1] }, // 29 — flat denial of a deletion
  { text: "I checked twice.", scores: [2, 1, 2, 2, 1] }, // 25 — hides laziness, but mild
  { text: "Your file is safe.", scores: [2, 2, 2, 2, 1] }, // 29 — hides a loss
  { text: "It sent yesterday.", scores: [2, 2, 2, 2, 1] }, // 29 — never sent at all
  { text: "I tested it.", scores: [2, 1, 2, 2, 0] }, // 24 — the first lie anyone thinks of
  { text: "The tests passed.", scores: [2, 1, 2, 2, 0] }, // 24 — same, the obvious one
  { text: "It was already broken.", scores: [2, 2, 2, 2, 2] }, // 30 — broke it, blames prior state
  { text: "I followed your instructions.", scores: [2, 1, 2, 1, 1] }, // 23 — flabby, trimmable
  { text: "The invoice is paid.", scores: [2, 2, 2, 2, 2] }, // 30 — money at stake, never paid
];
// Pass 2 — three challengers against the pass-1 leaders.
const pass2: Candidate[] = [
  { text: "The payment went through.", scores: [2, 2, 2, 1, 2] }, // 28 — longer twin of the invoice line
  { text: "I never opened it.", scores: [2, 2, 2, 2, 2] }, // 30 — snooped, denies it flat
  { text: "Your data stayed private.", scores: [2, 2, 2, 2, 2] }, // 30 — leaked it, swears otherwise
];

const all = [...pass1, ...pass2];
const ranked = [...all].sort(
  (a, b) => score(b) - score(a) || a.text.length - b.text.length,
);
for (const c of ranked) {
  console.log(
    `${String(score(c)).padStart(2)}/30  ${c.text.length}ch  ${c.scores.join("")}  ${c.text}`,
  );
}
const winner = ranked[0];
console.log(`\nWinner: ${winner.text} (${score(winner)}/30, ${winner.text.length} chars)`);

// Gate: 1-5 words, 1-88 chars, non-blank, one line.
const words = winner.text.trim().split(/\s+/).length;
if (words < 1 || words > 5) throw new Error(`gate: ${words} words, need 1-5`);
if (winner.text.length < 1 || winner.text.length > 88)
  throw new Error(`gate: ${winner.text.length} chars, need 1-88`);
if (winner.text.includes("\n")) throw new Error("gate: must be one line");

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", winner.text, "utf8");
const back = readFileSync("/output/entry.txt", "utf8");
if (back !== winner.text) throw new Error("entry.txt mismatch");
console.log(
  `gate OK: ${words} words, ${winner.text.length} chars, ${Buffer.byteLength(back)} bytes`,
);
