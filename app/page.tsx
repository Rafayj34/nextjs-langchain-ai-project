"use client";

import Image from "next/image";
import f1GPTLogo from "./assets/f1GPTLogo.png";
import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import { useState } from "react";

const Home = () => {
    const [input, setInput] = useState('');

  const {
    sendMessage,
    status,
    messages,
  } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage({text: input})
    setInput('');
  }

  const noMessages = !messages || messages.length === 0;
    const handlePrompt = (promptText) => {
        const msg: UIMessage = {
            id: crypto.randomUUID(),
            parts: [{ type: "text", text: promptText }],
            role: "user"
        }
        sendMessage(msg);

    
    }

  return (
    <main>
      <Image src={f1GPTLogo} alt="F1 GPT Logo" width={250} height={200} />
      <section className={noMessages ? "" : "populated"}>
        {noMessages ? (
          <>
            <p className="starter-text">
              The ultimate Formula 1 assistant is here! Ask me anything about F1
              history, stats, drivers
            </p>
            <br />
            <PromptSuggestionRow onPromptClick={handlePrompt} />
          </>
        ) : (
          <>
            {messages.map((message, index) => (
              <Bubble
                key={`message-${index}`}
                message={message}
              />
            ))}
            {status === "submitted" && <LoadingBubble />}

          </>
        )}
      </section>
      <form onSubmit={handleSubmit}>
        <input
          className="question-box"
          onChange={e => setInput(e.target.value)}
          value={input}
          placeholder="Ask anything about F1"
        />
        <input type="submit" />
      </form>
    </main>
  );
};

export default Home;
