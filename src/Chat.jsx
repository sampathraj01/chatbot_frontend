import { useState } from "react";
import { sendMessage } from "./api";

export default function Chat() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  async function handleSend() {
    if (!input.trim()) return;

    setMessages((m) => [...m, { from: "user", text: input }]);

    const res = await sendMessage(input);
    const reply = res.reply ?? "No backend reply";

    setMessages((m) => [...m, { from: "bot", text: reply }]);
    setInput("");
  }

  return (
    <>
    <h1 className="text-3xl font-bold text-center text-sky-600 mb-4">
        Chatbot PWA 
    </h1>
    <div className="bg-white shadow rounded-lg p-4 flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-[70%] ${
                m.from === "user"
                  ? "bg-sky-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-sky-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
    </>
  );
}
