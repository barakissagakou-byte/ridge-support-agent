'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, getToolName, isToolUIPart } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { ToolCard } from '@/components/ToolCard';
import { loadFacts, loadTickets, saveFacts, saveTickets, type Ticket } from '@/lib/storage';

const SUGGESTIONS = ['Where is my order?', 'I want to return something', 'My backpack zipper broke'];

// Minimal formatting: **bold** and line breaks.
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
        chunk.startsWith('**') && chunk.endsWith('**') ? (
          <strong key={i}>{chunk.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{chunk}</span>
        ),
      )}
    </>
  );
}

export default function Home() {
  const [input, setInput] = useState('');
  const [facts, setFacts] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const processed = useRef(new Set<string>());
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, setMessages, status, error, stop } = useChat({
    // Short-term memory: the full conversation is sent by default.
    // Long-term memory: remembered facts are read fresh from localStorage on every request.
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({ memory: loadFacts() }),
    }),
  });

  const busy = status === 'submitted' || status === 'streaming';

  // Load long-term memory after mount (localStorage is browser-only).
  useEffect(() => {
    setFacts(loadFacts());
    setTickets(loadTickets());
  }, []);

  // Persist facts and tickets as their tool calls complete.
  useEffect(() => {
    const newFacts: string[] = [];
    const newTickets: Ticket[] = [];
    for (const message of messages) {
      if (message.role !== 'assistant') continue;
      for (const part of message.parts) {
        if (!isToolUIPart(part) || part.state !== 'output-available') continue;
        if (processed.current.has(part.toolCallId)) continue;
        processed.current.add(part.toolCallId);

        const name = getToolName(part);
        const out = part.output as Record<string, unknown> | undefined;
        if (name === 'remember_customer' && typeof out?.fact === 'string' && out.fact) {
          newFacts.push(out.fact);
        } else if (name === 'create_ticket' && typeof out?.ticket_id === 'string') {
          newTickets.push({
            id: out.ticket_id,
            category: String(out.category),
            priority: String(out.priority),
            summary: String(out.summary),
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    if (newFacts.length) {
      const current = loadFacts();
      const seen = new Set(current.map((f) => f.toLowerCase()));
      const merged = [...current, ...newFacts.filter((f) => !seen.has(f.toLowerCase()))];
      saveFacts(merged);
      setFacts(merged);
    }
    if (newTickets.length) {
      const merged = [...newTickets.reverse(), ...loadTickets()];
      saveTickets(merged);
      setTickets(merged);
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, status]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput('');
  }

  function forgetMe() {
    if (!confirm('Forget everything Ridge remembers about you? This also clears the current chat.')) return;
    stop();
    saveFacts([]);
    setFacts([]);
    setMessages([]);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo" aria-hidden>
            <svg viewBox="0 0 32 32" width="28" height="28">
              <path d="M2 26 L12 10 L17 18 L21 13 L30 26 Z" fill="currentColor" />
            </svg>
          </span>
          <div>
            <div className="brand-name">Allegheny Gear Co.</div>
            <div className="brand-sub">Customer Support · Chat with Ridge</div>
          </div>
        </div>
      </header>

      <div className="main">
        <section className="chat" aria-label="Chat with Ridge">
          <div className="messages">
            {messages.length === 0 && (
              <div className="welcome">
                <h1>{facts.length ? 'Welcome back!' : 'Hi, I’m Ridge.'}</h1>
                <p>
                  I can help with orders, returns, warranty claims, shipping, and product questions.
                  {facts.length > 0 && ' I remember a few things from last time — see the sidebar.'}
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`row ${message.role}`}>
                <div className="stack">
                  {message.parts.map((part, i) => {
                    const key = `${message.id}-${i}`;
                    if (part.type === 'text') {
                      if (!part.text.trim()) return null;
                      return (
                        <div key={key} className={`bubble ${message.role}`}>
                          <RichText text={part.text} />
                        </div>
                      );
                    }
                    if (isToolUIPart(part)) {
                      return (
                        <ToolCard
                          key={key}
                          name={getToolName(part)}
                          state={part.state}
                          input={part.input}
                          output={part.state === 'output-available' ? part.output : undefined}
                          errorText={part.state === 'output-error' ? part.errorText : undefined}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}

            {status === 'submitted' && (
              <div className="row assistant">
                <div className="bubble assistant typing" aria-label="Ridge is typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {error && (
              <div className="error-banner" role="alert">
                Something went wrong reaching Ridge. Please try again.
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="composer">
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)} disabled={busy}>
                  {s}
                </button>
              ))}
            </div>
            <form
              className="input-row"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Ridge about an order, return, or product…"
                aria-label="Message"
                autoFocus
              />
              {busy ? (
                <button type="button" className="send" onClick={() => stop()}>
                  Stop
                </button>
              ) : (
                <button type="submit" className="send" disabled={!input.trim()}>
                  Send
                </button>
              )}
            </form>
          </div>
        </section>

        <aside className="sidebar">
          <div className="panel">
            <div className="panel-head">
              <h2>What Ridge remembers about you</h2>
            </div>
            {facts.length === 0 ? (
              <p className="empty">Nothing yet. Ridge saves useful details you share, like your name or order number.</p>
            ) : (
              <ul className="facts">
                {facts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            )}
            <button className="forget" onClick={forgetMe} disabled={facts.length === 0}>
              Forget me
            </button>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Tickets created</h2>
            </div>
            {tickets.length === 0 ? (
              <p className="empty">No tickets yet.</p>
            ) : (
              <ul className="tickets">
                {tickets.map((t) => (
                  <li key={t.id + t.createdAt} className="ticket">
                    <div className="ticket-top">
                      <span className="ticket-id">{t.id}</span>
                      <span className={`badge prio-${t.priority.toLowerCase()}`}>{t.priority}</span>
                    </div>
                    <div className="ticket-cat">{t.category}</div>
                    <div className="ticket-sum">{t.summary}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
