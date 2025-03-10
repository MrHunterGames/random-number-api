const crypto = require("crypto");

export default function handler(req, res) {
    if (req.method === "GET") {
        const randomNumber = Math.floor(Math.random() * 20) + 1;

        function hashSHA256(message) {
            return crypto.createHash("sha256").update(message.toString()).digest("hex");
        }

        const hashedNumber = hashSHA256(randomNumber);
        
        res.status(200).json({ number: hashedNumber });
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}

