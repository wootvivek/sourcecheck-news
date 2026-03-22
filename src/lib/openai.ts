import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "missing",
    });
  }
  return _client;
}

export default { get client() { return getOpenAI(); } };
