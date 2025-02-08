"use client";

import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import styles from "./Chat.module.scss";

const Chat = ({ namespace }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !namespace) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, namespace }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chat}>
      <div className={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className={styles.loading}>AI is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the PDF..."
          disabled={isLoading || !namespace}
        />
        <button type="submit" disabled={isLoading || !namespace}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
