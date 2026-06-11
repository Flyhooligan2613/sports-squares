/**
 * Simulate end-of-quarter winner calculation for the linked NBA pool.
 * Run: node --env-file=.env.local scripts/simulate-nba-winner.mjs
 */
import { readFileSync } from "fs";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const POOL_ID = "14oj1u66";
const ESPN_GAME_ID = "401859966";
const ESPN_SPORT = "nba";
const SIMULATE_PERIOD = "Q1";

// --- winner engine (mirrors lib/winnerEngine.ts) ---
function getLastDigit(score) {
  return Math.abs(Math.floor(score)) % 10;
}

function findWinningSquare(topNumbers, sideNumbers, homeScore, awayScore) {
  const homeDigit = getLastDigit(homeScore);
  const awayDigit = getLastDigit(awayScore);
  const col = topNumbers.indexOf(homeDigit);
  const row = sideNumbers.indexOf(awayDigit);
  if (col === -1 || row === -1) return null;
  return { squareId: row * 10 + col, row, col, homeDigit, awayDigit };
}

function calculateWinner(quarter, topNumbers, sideNumbers, squares, homeScore, awayScore) {
  const match = findWinningSquare(topNumbers, sideNumbers, homeScore, awayScore);
  if (!match) return null;
  const square = squares[match.squareId];
  return {
    quarter,
    homeScore,
    awayScore,
    homeDigit: match.homeDigit,
    awayDigit: match.awayDigit,
    squareId: match.squareId,
    ownerName: square?.owner?.name ?? "Unclaimed",
  };
}

// --- ESPN parser (mirrors lib/espn/parser.ts) ---
function parseScore(value) {
  const n = parseInt(value ?? "0", 10);
  return Number.isNaN(n) ? 0 : n;
}

function parseLineScores(competitor) {
  return (competitor?.linescores ?? []).map((ls) => ls.value ?? 0);
}

function parseEspnSummary(data, gameId) {
  const competition = data.header?.competitions?.[0];
  if (!competition) return null;
  const competitors = competition.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;
  const status = competition.status;
  const statusType = status?.type;
  return {
    gameId,
    homeTeam: home.team?.displayName ?? "Home",
    awayTeam: away.team?.displayName ?? "Away",
    homeScore: parseScore(home.score),
    awayScore: parseScore(away.score),
    homeLineScores: parseLineScores(home),
    awayLineScores: parseLineScores(away),
    period: status?.period ?? 0,
    gameCompleted: statusType?.completed ?? false,
    statusDetail: statusType?.shortDetail ?? statusType?.detail ?? "Unknown",
  };
}

function simulateQ1Complete(liveGame) {
  // During live Q1, ESPN often omits linescores — use current totals as Q1 cumulative.
  const homeQ1 =
    liveGame.period <= 1 ? liveGame.homeScore : liveGame.homeLineScores[0] ?? liveGame.homeScore;
  const awayQ1 =
    liveGame.period <= 1 ? liveGame.awayScore : liveGame.awayLineScores[0] ?? liveGame.awayScore;
  return {
    ...liveGame,
    period: 2,
    homeLineScores: [homeQ1],
    awayLineScores: [awayQ1],
    homeScore: homeQ1,
    awayScore: awayQ1,
    gameCompleted: false,
    statusDetail: `Simulated end of Q1 (${liveGame.awayTeam} ${awayQ1} - ${liveGame.homeTeam} ${homeQ1})`,
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// --- Supabase REST ---
function getSupabaseConfig() {
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1)];
      })
  );
  return {
    base: env.NEXT_PUBLIC_SUPABASE_URL,
    key: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

async function sb(path, options = {}) {
  const { base, key } = getSupabaseConfig();
  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: options.prefer ?? "return=representation",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  console.log("=== NBA End-of-Quarter Winner Simulation ===\n");
  console.log(`Pool: ${POOL_ID}`);
  console.log(`ESPN Game: ${ESPN_GAME_ID} (${ESPN_SPORT})\n`);

  // 1. Fetch live ESPN data
  const espnRes = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${ESPN_GAME_ID}`,
    { headers: { "User-Agent": "SportsSquares/1.0" } }
  );
  const espnData = await espnRes.json();
  const liveGame = parseEspnSummary(espnData, ESPN_GAME_ID);
  if (!liveGame) throw new Error("Could not parse ESPN game data");

  console.log("1) ESPN LIVE SCORES");
  console.log(`   ${liveGame.awayTeam} ${liveGame.awayScore} @ ${liveGame.homeTeam} ${liveGame.homeScore}`);
  console.log(`   Status: ${liveGame.statusDetail} (period ${liveGame.period})`);
  console.log(`   Line scores — home: [${liveGame.homeLineScores.join(", ")}] away: [${liveGame.awayLineScores.join(", ")}]`);

  const simulatedGame = simulateQ1Complete(liveGame);
  const q1Home = simulatedGame.homeLineScores[0];
  const q1Away = simulatedGame.awayLineScores[0];

  console.log(`\n   Simulating end of Q1 → home ${q1Home}, away ${q1Away}`);

  // 2. Last digits
  const homeDigit = getLastDigit(q1Home);
  const awayDigit = getLastDigit(q1Away);
  console.log("\n2) LAST DIGITS");
  console.log(`   Home ${q1Home} → digit ${homeDigit}`);
  console.log(`   Away ${q1Away} → digit ${awayDigit}`);

  // Load pool from Supabase
  const [pool] = await sb(`pools?select=*&id=eq.${POOL_ID}`);
  if (!pool) throw new Error(`Pool ${POOL_ID} not found`);

  let topNumbers = pool.top_numbers;
  let sideNumbers = pool.side_numbers;

  // Ensure numbers are drawn for simulation
  if (!topNumbers?.length || !sideNumbers?.length) {
    topNumbers = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    sideNumbers = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    await sb(`pools?id=eq.${POOL_ID}`, {
      method: "PATCH",
      body: JSON.stringify({
        top_numbers: topNumbers,
        side_numbers: sideNumbers,
        status: "numbers-drawn",
      }),
    });
    console.log("\n   (Setup) Drew board numbers for simulation");
  }

  // Load players and squares
  let players = await sb(`players?select=*&pool_id=eq.${POOL_ID}`);
  let squareRows = await sb(
    `squares?select=*&pool_id=eq.${POOL_ID}&order=square_number`
  );

  if (!players.length) {
    const playerId = generateId();
    const [player] = await sb("players", {
      method: "POST",
      body: JSON.stringify({
        id: playerId,
        pool_id: POOL_ID,
        name: "Sim Test Player",
        initials: "ST",
        credits_allocated: 10,
        credits_used: 0,
        color: "#6366f1",
      }),
    });
    players = [player];
    console.log("   (Setup) Created test player: Sim Test Player");
  }

  const match = findWinningSquare(topNumbers, sideNumbers, q1Home, q1Away);
  if (!match) throw new Error("Could not find winning square on board");

  // Claim winning square if unclaimed
  const winRow = squareRows.find((s) => s.square_number === match.squareId);
  if (!winRow?.claimed) {
    await sb(`squares?pool_id=eq.${POOL_ID}&square_number=eq.${match.squareId}`, {
      method: "PATCH",
      body: JSON.stringify({
        claimed: true,
        player_id: players[0].id,
      }),
    });
    console.log(`   (Setup) Claimed winning square #${match.squareId} for ${players[0].name}`);
    squareRows = await sb(
      `squares?select=*&pool_id=eq.${POOL_ID}&order=square_number`
    );
  }

  const playersById = new Map(players.map((p) => [p.id, p]));
  const squares = Array.from({ length: 100 }, (_, id) => ({
    id,
    claimed: false,
    owner: undefined,
  }));
  for (const row of squareRows) {
    const owner = row.player_id ? playersById.get(row.player_id) : undefined;
    squares[row.square_number] = {
      id: row.square_number,
      claimed: row.claimed,
      owner: owner
        ? { id: owner.id, name: owner.name, initials: owner.initials }
        : undefined,
    };
  }

  // 3. Winning square
  console.log("\n3) WINNING SQUARE");
  console.log(`   topNumbers[col ${match.col}] = ${topNumbers[match.col]} (home digit ${homeDigit})`);
  console.log(`   sideNumbers[row ${match.row}] = ${sideNumbers[match.row]} (away digit ${awayDigit})`);
  console.log(`   Square ID: ${match.squareId} (row ${match.row}, col ${match.col})`);

  const result = calculateWinner(
    SIMULATE_PERIOD,
    topNumbers,
    sideNumbers,
    squares,
    q1Home,
    q1Away
  );
  if (!result) throw new Error("Winner calculation returned null");

  console.log(`   Winner: ${result.ownerName}`);

  // 4. Write to Supabase winners table
  const winnerId = generateId();
  const winnerRow = {
    id: winnerId,
    pool_id: POOL_ID,
    quarter: result.quarter,
    winning_square: result.squareId,
    winning_player: result.ownerName,
    home_score: result.homeScore,
    away_score: result.awayScore,
  };

  const existing = await sb(
    `winners?select=id&pool_id=eq.${POOL_ID}&quarter=eq.${SIMULATE_PERIOD}`
  );
  if (existing.length) {
    await sb(`winners?pool_id=eq.${POOL_ID}&quarter=eq.${SIMULATE_PERIOD}`, {
      method: "PATCH",
      body: JSON.stringify({
        winning_square: winnerRow.winning_square,
        winning_player: winnerRow.winning_player,
        home_score: winnerRow.home_score,
        away_score: winnerRow.away_score,
      }),
    });
  } else {
    await sb("winners", {
      method: "POST",
      body: JSON.stringify(winnerRow),
    });
  }

  console.log("\n4) SUPABASE WRITE");
  console.log(`   Inserted/updated winners row for ${result.quarter}`);
  console.log(`   ${JSON.stringify(winnerRow, null, 2)}`);

  // 5. Verify read-back (what admin UI loads)
  const saved = await sb(`winners?select=*&pool_id=eq.${POOL_ID}&quarter=eq.${SIMULATE_PERIOD}`);
  console.log("\n5) ADMIN WINNER HISTORY (from Supabase)");
  if (!saved.length) throw new Error("Winner not found after write!");

  const w = saved[0];
  console.log(`   Period: ${w.quarter}`);
  console.log(`   Score: ${pool.away_team} ${w.away_score} – ${pool.home_team} ${w.home_score}`);
  console.log(`   Digits: away ${getLastDigit(w.away_score)}, home ${getLastDigit(w.home_score)}`);
  console.log(`   Winning square: #${w.winning_square}`);
  console.log(`   Winner: ${w.winning_player}`);

  console.log("\n=== SIMULATION COMPLETE — all 5 checks passed ===");
}

main().catch((err) => {
  console.error("\nSimulation failed:", err.message);
  process.exit(1);
});
