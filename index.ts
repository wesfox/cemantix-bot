import { serve } from "https://deno.land/std@0.119.0/http/server.ts";

async function handler(_req: Request): Promise<Response> {
  try {
    const wordToFind = "chien";
    const guess = await extractGuess(_req);
    const similarityResult = await similarity(guess, wordToFind);
    console.log(
      `Tried with word ${guess}, similarity is ${similarityResult}, word to find is ${wordToFind}`
    );
    return new Response(responseBuilder(guess, similarityResult));
  } catch (e) {
    console.error(e);
    return new Response("An error occured : ", e);
  }
}

const extractGuess = async (req: Request) => {
  const slackPayload = await req.formData();
  const guess = await slackPayload.get("text")?.toString();
  if (!guess) {
    throw Error("Guess is empty or null");
  }
  return guess;
};

const responseBuilder = (word: string, similarity: number) => {
  if (similarity == 1) {
    return `Well played ! The word was ${word}.`;
  } else if (similarity > 0.5) {
    return `${word} is very close to the word, score : ${similarity * 100}`;
  } else if (similarity < 0.5) {
    return `${word} is quite far to the word, score : ${similarity * 100}`;
  }
};

const similarity = async (word1, word2) => {
  const body = {
    sim1: word1,
    sim2: word2,
    lang: "fr",
    type: "General Word2Vec",
  };
  const similarityResponse = await fetch(
    "http://nlp.polytechnique.fr/similarityscore",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const similarityResponseJson = await similarityResponse.json();
  return Number(similarityResponseJson.simscore);
};

serve(handler);
