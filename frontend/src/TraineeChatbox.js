import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./TraineeChatbox.css";

const API = "http://localhost:5001";

const senderKey = (msg) => msg.senderId?._id || msg.senderId?.name || "unknown";

const dayKey = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toDateString();
};

const dayLabel = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const timeLabel = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

const Chatbox = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const myId = localStorage.getItem("userId");
  const myName = localStorage.getItem("userName");

  const isMine = (msg) => {
    if (myId && msg.senderId?._id) return msg.senderId._id === myId;
    return !!myName && msg.senderId?.name === myName;
  };

  // Load history + open ONE socket connection for the life of the page
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API}/api/chat/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setError("Could not load earlier messages.");
      })
      .finally(() => setLoading(false));

    const socket = io(API);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("newCommunityMessage", (message) => {
      setMessages((prev) =>
        message._id && prev.some((m) => m._id === message._id) ? prev : [...prev, message]
      );
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  // Keep the newest message in view
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSendMessage = async () => {
    const text = newMessage.trim();
    if (!text || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("Request failed");
      setNewMessage("");
      if (inputRef.current) inputRef.current.style.height = "auto";
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Message not sent. Check your connection and try again.");
    } finally {
      setSending(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInput = (e) => {
    setNewMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="tc-root">
      <div className="tc-container">
        {/* Header */}
        <header className="tc-header">
          <div className="tc-header-left">
            <div className="tc-header-icon">💬</div>
            <div>
              <h1 className="tc-title">Community Chat</h1>
              <span className={`tc-status ${connected ? "tc-status--online" : "tc-status--offline"}`}>
                <span className="tc-status-dot" />
                {connected ? "Connected" : "Reconnecting…"}
              </span>
            </div>
          </div>
          <button className="tc-back-btn" onClick={() => navigate("/TraineeDashboard")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 7H4M7 4L4 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to dashboard</span>
          </button>
        </header>

        {/* Messages */}
        <div className="tc-messages" ref={messagesRef}>
          {loading ? (
            <div className="tc-empty">
              <div className="tc-spinner" />
              <p className="tc-empty-text">Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="tc-empty">
              <span className="tc-empty-icon">👋</span>
              <p className="tc-empty-title">No messages yet</p>
              <p className="tc-empty-text">Say hello to your trainer and the community.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const prev = messages[index - 1];
              const mine = isMine(msg);
              const name = msg.senderId?.name || "Unknown";
              const newDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
              const first = newDay || senderKey(prev) !== senderKey(msg);
              const next = messages[index + 1];
              const last =
                !next ||
                senderKey(next) !== senderKey(msg) ||
                dayKey(next.createdAt) !== dayKey(msg.createdAt);

              return (
                <React.Fragment key={msg._id || index}>
                  {newDay && msg.createdAt && (
                    <div className="tc-day">{dayLabel(msg.createdAt)}</div>
                  )}
                  <div
                    className={`tc-row ${mine ? "tc-row--mine" : "tc-row--other"} ${
                      first ? "tc-row--first" : ""
                    }`}
                  >
                    {!mine && (
                      <span className={`tc-avatar ${last ? "" : "tc-avatar--spacer"}`}>
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="tc-bubble-wrap">
                      {!mine && first && <span className="tc-sender">{name}</span>}
                      <div className="tc-bubble">{msg.message}</div>
                      {last && msg.createdAt && (
                        <span className="tc-time">{timeLabel(msg.createdAt)}</span>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Composer */}
        <div className="tc-composer">
          {error && <p className="tc-error" role="alert">{error}</p>}
          <div className="tc-input-row">
            <textarea
              ref={inputRef}
              className="tc-input"
              rows={1}
              value={newMessage}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              aria-label="Message"
            />
            <button
              className="tc-send-btn"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? "Sending…" : "Send"}
              {!sending && (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M14 2L7 9M14 2l-4.5 12-2.5-5-5-2.5L14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
          <p className="tc-hint">Press Enter to send, Shift + Enter for a new line</p>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
