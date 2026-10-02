import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./Chatbox.css";

const API = "http://localhost:5001";

// Your Chat model stores the time in `timestamp`; use it as createdAt
const normalize = (m) => ({ ...m, createdAt: m.createdAt || m.timestamp });

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
      .then((data) => setMessages(Array.isArray(data) ? data.map(normalize) : []))
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setError("Could not load earlier messages.");
      })
      .finally(() => setLoading(false));

    const socket = io(API);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("newCommunityMessage", (raw) => {
      const message = normalize(raw);
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
    <div className="cb-root">
      <div className="cb-container">
        {/* Header */}
        <header className="cb-header">
          <div className="cb-header-left">
            <div className="cb-header-icon">💬</div>
            <div>
              <h1 className="cb-title">Community Chat</h1>
              <span className={`cb-status ${connected ? "cb-status--online" : "cb-status--offline"}`}>
                <span className="cb-status-dot" />
                {connected ? "Connected" : "Reconnecting…"}
              </span>
            </div>
          </div>
          <button className="cb-back-btn" onClick={() => navigate("/TrainerDashboard")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 7H4M7 4L4 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to dashboard</span>
          </button>
        </header>

        {/* Messages */}
        <div className="cb-messages" ref={messagesRef}>
          {loading ? (
            <div className="cb-empty">
              <div className="cb-spinner" />
              <p className="cb-empty-text">Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="cb-empty">
              <span className="cb-empty-icon">👋</span>
              <p className="cb-empty-title">No messages yet</p>
              <p className="cb-empty-text">Start the conversation with your trainees.</p>
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
                    <div className="cb-day">{dayLabel(msg.createdAt)}</div>
                  )}
                  <div
                    className={`cb-row ${mine ? "cb-row--mine" : "cb-row--other"} ${
                      first ? "cb-row--first" : ""
                    }`}
                  >
                    {!mine && (
                      <span className={`cb-avatar ${last ? "" : "cb-avatar--spacer"}`}>
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="cb-bubble-wrap">
                      {!mine && first && <span className="cb-sender">{name}</span>}
                      <div className="cb-bubble">{msg.message}</div>
                      {last && msg.createdAt && (
                        <span className="cb-time">{timeLabel(msg.createdAt)}</span>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Composer */}
        <div className="cb-composer">
          {error && <p className="cb-error" role="alert">{error}</p>}
          <div className="cb-input-row">
            <textarea
              ref={inputRef}
              className="cb-input"
              rows={1}
              value={newMessage}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              aria-label="Message"
            />
            <button
              className="cb-send-btn"
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
          <p className="cb-hint">Press Enter to send, Shift + Enter for a new line</p>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;