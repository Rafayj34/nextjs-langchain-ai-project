import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { ModelMessage } from "ai";
const {
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  OPENAI_API_KEY,
} = process.env;
console.log(OPENAI_API_KEY)

const openAi = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const conn = createOpenAI({
  apiKey: OPENAI_API_KEY,
});
const model = openai("gpt-4");

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);

const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const modelMessages = convertToModelMessages(messages);
    let docContext = "";

    // Extract last message text safely
    const lastMsg = messages[messages.length - 1];
    const latestMessage = lastMsg?.parts
      ?.filter((p) => p.type === "text")
      ?.map((p) => p.text)
      ?.join(" ") ?? "";

    // 🧠 Get embeddings
    const embedding = await openAi.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
    });
    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
       const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });
      const documents = await cursor.toArray();

      //   const docsmap = documents?.map((doc) => doc.text);

      docContext = JSON.stringify(documents.map((d) => d.text));
    } catch (error) {
      console.error("Error querying the database:", error);
      docContext = "";
    }

    const template: ModelMessage = {
      role: "system",
      content: `You are an AI assistant who knows everything about Formula One.
        Use the below context to augment what you know about Formula One racing.
        The context will provide you with the most recent page data from wikipedia, the official F1 website and others.
        If the context doesn't include the information you need answer based on your existing knowledge and don't mention the source of your information or what the context does or doesn't include. Don't make up answers if the context is not sufficient to answer the question. And don't refer to the context in your answers. Also don't mention you are an AI model. If you don't have the answer, just say you don't know.
        Format responses using markdown where applicable and don't return images.
        ------------
        START CONTEXT
        ${docContext}
        END CONTEXT
        ------------
        QUESTION: ${latestMessage}
        ------------
        `,
    };

    // const response = await openAi.chat.completions.create({
    //   model: "gpt-4",
    //   stream: true,
    //   messages: [template, ...messages],
    // });

    const result = streamText({
      model: model,
      messages: [template, ...modelMessages],
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
