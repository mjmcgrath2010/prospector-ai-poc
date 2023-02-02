import { NextApiRequest } from "next";
const axios = require("axios");
const cheerio = require("cheerio");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: any) {
  const { url } = req.body;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const el = $("h1, h2, h3, h4, h5, h6, p, a, button");
  const body = el
    .map((_i: any, el: any) =>
      typeof $(el).text() === "string" ? $(el).text() : ""
    )
    .get()
    .join("\n\n");

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${body}\n\nTl;dr`,
      temperature: 0.7,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 1,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
