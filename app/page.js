'use client'
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis l\'assistant de réservation. Comment puis-je vous aider ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur de connexion.' }])
    }
    setLoading(false)
  }

  return (
    <div className="container">
      <div className="chat-box">
        <div className="header">🏨 Assistant de Réservation</div>
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>{m.content}</div>
          ))}
          {loading && <div className="message assistant">...</div>}
        </div>
        <div className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez votre message..."
          />
          <button onClick={sendMessage}>Envoyer</button>
        </div>
      </div>
    </div>
  )
}
