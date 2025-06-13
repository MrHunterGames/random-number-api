// /api/number-game.js
import crypto from "crypto";

function hashSHA256(message) {
  return crypto.createHash("sha256").update(message.toString()).digest("hex");
}

export default function handler(req, res) {
  // ── CORS ───────────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ── GET → new round ────────────────────────────────────────────────────
  if (req.method === "GET") {
    const randomNumber = Math.floor(Math.random() * 20) + 1;      // 1-20
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedNumber = hashSHA256(randomNumber + salt);

    return res.status(200).json({ hashedNumber, salt });
  }

  // ── POST → evaluate guess ──────────────────────────────────────────────
  if (req.method === "POST") {
    const { guess, hashedNumber, salt } = req.body ?? {};

    // quick sanity checks
    if (
      typeof guess !== "number" ||
      guess < 1 ||
      guess > 20 ||
      typeof hashedNumber !== "string" ||
      typeof salt !== "string"
    ) {
      return res.status(400).json({ error: "Bad payload" });
    }

    // brute-force the answer (range is tiny, so who cares)
    let answer = null;
    for (let n = 1; n <= 20; n++) {
      if (hashSHA256(n + salt) === hashedNumber) {
        answer = n;
        break;
      }
    }
    if (answer === null) {
      return res.status(400).json({ error: "Hash/salt mismatch" });
    }

    // compare
    if (guess < answer) return res.status(200).json({ result: "TOOLOW" });
    if (guess > answer) return res.status(200).json({ result: "TOOHIGH" });
    return res.status(200).json({ result: "CORRECT" });
  }

  // ── all other verbs ────────────────────────────────────────────────────
  res.status(405).json({ error: "Method Not Allowed" });
}
