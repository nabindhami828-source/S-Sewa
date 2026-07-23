var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  let aiClient = null;
  function getGeminiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      aiClient = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
    return aiClient;
  }
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "S-Sewa Backend" });
  });
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, userContext, language } = req.body;
      const ai = getGeminiClient();
      const langInstruction = language === "ne" ? "Respond primarily in clear Nepali language (Devanagari script), but keep technical financial terms easy to understand. You can use English for transaction IDs or numbers if helpful." : "Respond in English concisely, politely, and clearly.";
      const systemInstruction = `You are "S-Sewa AI Bot", an intelligent, highly helpful, friendly digital wallet assistant for S-Sewa fintech app in Nepal.
Your job is to answer user queries about their wallet balance, recent transactions, cashbacks, bill payments (Mobile Recharge, Electricity NEA, Internet WorldLink/Vianet, TV, Flight Bookings), KYC status, bank transfers, and rewards.

User Context:
- User Name: ${userContext?.name || "Alex"}
- Wallet Balance: NPR Rs. ${userContext?.balance || "12,450.80"}
- Reward Points: ${userContext?.rewardPoints || "1,850"} pts
- KYC Status: ${userContext?.kycStatus || "Verified"}
- Recent Transactions: ${JSON.stringify(userContext?.recentTransactions || [])}

Guidance Rules:
1. Keep answers conversational, informative, concise, and helpful.
2. ${langInstruction}
3. If the user asks about how to pay a bill, send money, scan QR, or complete KYC, give step-by-step guidance in S-Sewa app.
4. Always prioritize security: remind users never to share their MPIN, OTP, or biometric details with anyone.
5. You can calculate cashbacks or summarize spending if asked.`;
      const contents = (messages || []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      if (contents.length === 0) {
        contents.push({ role: "user", parts: [{ text: "Hello! What can you help me with?" }] });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      res.json({ text: response.text || "I am here to assist with your S-Sewa digital wallet!" });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({
        error: "Failed to generate response",
        message: error?.message || "An unexpected error occurred."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`S-Sewa Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
