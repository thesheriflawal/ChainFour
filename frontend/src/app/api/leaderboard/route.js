import { NextResponse } from "next/server";

const TENCENT_NAMESPACE_ID = process.env.NEXT_PUBLIC_TENCENT_KV_NAMESPACE_ID;

const BASE_URL = `https://api.tencentcloudapi.com/kv/${TENCENT_NAMESPACE_ID}`;

async function kvRequest(method, key, body = null) {
  try {
    const response = await fetch(`${BASE_URL}/${key}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      throw new Error(`KV request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("KV request error:", error);
    throw error;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const player = searchParams.get("player");

  try {
    if (player) {
      const stats = await kvRequest("GET", `player:${player}`);
      return NextResponse.json(stats);
    } else {
      const leaderboard = await kvRequest("GET", "leaderboard");
      return NextResponse.json(leaderboard);
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { playerAddress, username, gameResult } = await req.json();

    let playerStats;
    try {
      playerStats = await kvRequest("GET", `player:${playerAddress}`);
    } catch {
      playerStats = { wins: 0, losses: 0, gamesPlayed: 0 };
    }

    if (gameResult === "win") playerStats.wins += 1;
    if (gameResult === "loss") playerStats.losses += 1;
    playerStats.gamesPlayed += 1;

    await kvRequest("PUT", `player:${playerAddress}`, playerStats);
    await kvRequest("PUT", `player:${playerAddress}:username`, { username });

    let leaderboard;
    try {
      leaderboard = await kvRequest("GET", "leaderboard");
    } catch {
      leaderboard = [];
    }

    const index = leaderboard.findIndex((p) => p.address === playerAddress);
    if (index >= 0) {
      leaderboard[index] = { address: playerAddress, username, ...playerStats };
    } else {
      leaderboard.push({ address: playerAddress, username, ...playerStats });
    }

    leaderboard.sort((a, b) => b.wins - a.wins);

    await kvRequest("PUT", "leaderboard", leaderboard);

    return NextResponse.json({ success: true, leaderboard, playerStats });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
