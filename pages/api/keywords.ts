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

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const el = $("h1, h2, h3, h4, h5, h6, p");
    const body = el
      .map((_i: any, el: any) =>
        typeof $(el).text() === "string" ? $(el).text() : ""
      )
      .get()
      .join("\n\n");
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Extract keywords from this text:\n\n${body}`,
      temperature: 0.5,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0.8,
      presence_penalty: 0,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
