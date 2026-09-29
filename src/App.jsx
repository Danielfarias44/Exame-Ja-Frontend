import { useEffect, useRef, useState } from 'react'
import './App.css'

function Icon({ name, size = 20 }) {
  const paths = {
    home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z',
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm4 11 2 2 4-4',
    chat: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z',
    search: 'm21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    send: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13',
    arrow: 'm15 18-6-6 6-6',
    shield: 'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-4-11 3 3 5-5',
    check: 'm4 12 4 4 8-8m-3 8 8-8',
    cross: 'M12 5v14M5 12h14',
    info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

const contacts = [
  { id: 'central', name: 'Central de atendimento', initials: 'E', role: 'Equipe Exame Já', preview: 'Como podemos ajudar você hoje?', time: '09:42', unread: 1, color: 'purple' },
  { id: 'clinica', name: 'Clínica Bem Estar', initials: 'BE', role: 'Recepção • Clínica parceira', preview: 'Seu agendamento está confirmado!', time: 'Ontem', color: 'slate' },
  { id: 'lab', name: 'Laboratório Vida', initials: 'LV', role: 'Atendimento • Laboratório parceiro', preview: 'Estamos à disposição para ajudar.', time: 'Seg', color: 'blue' },
]
const initialMessages = {
  central: [
    { id: 1, text: 'Olá! Boas-vindas ao Exame Já!', time: '09:40' },
    { id: 2, text: 'Este é o seu espaço para conversar com nossa equipe e tirar dúvidas sobre seus agendamentos.', time: '09:40' },
    { id: 3, text: 'Olá! Gostaria de algumas informações sobre meus exames.', time: '09:41', own: true },
    { id: 4, text: 'Claro! Estamos aqui para ajudar. Como podemos ajudar você hoje?', time: '09:42' },
  ],
  clinica: [{ id: 5, text: 'Olá! Seu agendamento está confirmado. Se precisar de mais informações, envie sua dúvida por aqui.', time: '14:30' }],
  lab: [{ id: 6, text: 'Olá! Seja bem-vindo ao Laboratório Vida. Estamos à disposição para ajudar.', time: '10:15' }],
}

function App() {
  const [selected, setSelected] = useState('central')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todas')
  const [messages, setMessages] = useState(initialMessages)
  const [drafts, setDrafts] = useState({})
  const [read, setRead] = useState([])
  const [mobileChat, setMobileChat] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const searchRef = useRef(null)
  const contact = contacts.find((item) => item.id === selected)
  const draft = drafts[selected] || ''
  const visibleContacts = contacts.filter((item) => item.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) && (filter === 'Todas' || (item.unread && !read.includes(item.id))))

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [selected, messages])

  function openConversations(focusSearch = false) {
    setMobileChat(false)
    if (focusSearch) {
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }

  function sendMessage(event) {
    event.preventDefault()
    if (!draft.trim()) return
    const message = { id: Date.now(), text: draft.trim(), own: true, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
    setMessages((current) => ({ ...current, [selected]: [...current[selected], message] }))
    setDrafts((current) => ({ ...current, [selected]: '' }))
    setRead((current) => [...new Set([...current, selected])])
    inputRef.current?.focus()
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="./" aria-label="Exame Já, início"><span className="brand-symbol"><Icon name="cross" size={25} /></span>exame<span className="brand-accent">já</span><span className="brand-dot">.</span></a>
        <div className="topbar-section"><Icon name="chat" size={18} /><span>Área do paciente</span></div>
        <div className="profile"><span className="profile-avatar">VC</span><div><strong>Você</strong><span>Paciente</span></div></div>
      </header>

      <main>
        <div className="page-heading"><div><div className="eyebrow">ATENDIMENTO</div><h1>Seu cuidado começa com uma <span>conversa</span></h1><p>Fale com a clínica, tire suas dúvidas e acompanhe seus exames.</p></div><span className="privacy-label"><Icon name="shield" size={17} /> Um espaço para suas conversas</span></div>
        <div className={`chat-shell ${mobileChat ? 'mobile-chat-open' : ''}`}>
          <aside className="conversations" aria-label="Conversas">
            <div className="list-heading"><h2>Suas conversas <span>{contacts.length}</span></h2><Icon name="chat" /></div>
            <label className="search"><Icon name="search" size={19} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar conversa" aria-label="Buscar conversa" /></label>
            <div className="filters" aria-label="Filtrar conversas">{['Todas', 'Não lidas'].map((label) => <button key={label} className={filter === label ? 'active' : ''} aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}{label === 'Não lidas' && <span>{contacts.filter((item) => item.unread && !read.includes(item.id)).length}</span>}</button>)}</div>
            <div className="contact-list">{visibleContacts.map((item) => {
              const last = messages[item.id].at(-1)
              return <button className={`contact ${selected === item.id ? 'selected' : ''}`} key={item.id} aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); setRead((current) => [...new Set([...current, item.id])]); setMobileChat(true); setShowInfo(false) }}><span className={`avatar ${item.color}`}>{item.initials}</span><span className="contact-content"><span className="contact-top"><strong>{item.name}</strong><time>{last.own ? last.time : item.time}</time></span><span className="contact-role">{item.role}</span><span className="contact-preview"><span>{last.own ? `Você: ${last.text}` : item.preview}</span>{item.unread && !read.includes(item.id) ? <b>{item.unread}</b> : null}</span></span></button>
            })}{!visibleContacts.length && <p className="empty-list">Nenhuma conversa encontrada.</p>}</div>
            <div className="sidebar-note"><span className="note-icon"><Icon name="chat" size={19} /></span><div><strong>Do sintoma ao exame, sem burocracia</strong><p>Conte o que sente. Nossa equipe ajuda você a dar o próximo passo.</p></div></div>
          </aside>

          <section className="conversation" aria-label={`Conversa com ${contact.name}`}>
            <header className="conversation-header"><button className="icon-button back-button" aria-label="Voltar às conversas" onClick={() => setMobileChat(false)}><Icon name="arrow" /></button><span className={`avatar ${contact.color}`}>{contact.initials}</span><div className="conversation-title"><h2>{contact.name}</h2><span>{contact.role}</span></div><button className={`icon-button ${showInfo ? 'info-active' : ''}`} aria-label="Informações da conversa" aria-expanded={showInfo} onClick={() => setShowInfo(!showInfo)}><Icon name="info" /></button></header>
            {showInfo && <div className="info-panel"><strong>Sobre esta conversa</strong><p>Interface demonstrativa com mensagens fictícias. As mensagens enviadas ficam apenas nesta sessão e não são encaminhadas a uma clínica.</p></div>}
            <div className="message-area" role="log" aria-label="Mensagens da conversa" aria-live="polite">
              <div className="conversation-start"><span className="start-icon"><Icon name="chat" size={25} /></span><strong>Mais perto de você</strong><p>Tire suas dúvidas e cuide do próximo passo.</p></div>
              <div className="date-divider"><span>Conversa demonstrativa</span></div>
              {messages[selected].map((message, index) => <div className={`message-row ${message.own ? 'own' : ''}`} key={message.id}>{!message.own && <span className={`avatar small ${contact.color}`}>{contact.initials}</span>}<div className="message-wrap">{!message.own && (index === 0 || messages[selected][index - 1].own) && <span className="sender-name">{contact.name}</span>}<div className="message-bubble"><p>{message.text}</p><span className="message-time">{message.time}{message.own && <span title="Adicionada à conversa local"><Icon name="check" size={15} /></span>}</span></div></div></div>)}
              <div ref={endRef} />
            </div>
            <div className="composer-area"><div className="suggestions">{['Dúvidas sobre agendamento', 'Preparo para exames', 'Preciso de ajuda'].map((text) => <button key={text} onClick={() => { setDrafts((current) => ({ ...current, [selected]: text })); inputRef.current?.focus() }}>{text}</button>)}</div><form className="composer" onSubmit={sendMessage}><input ref={inputRef} value={draft} onChange={(event) => setDrafts((current) => ({ ...current, [selected]: event.target.value }))} placeholder="Escreva sua mensagem…" aria-label="Sua mensagem" maxLength={4000} /><button className="send-button" type="submit" disabled={!draft.trim()} aria-label="Enviar mensagem"><Icon name="send" size={20} /></button></form><div className="composer-caption"><span>Enter para enviar</span><span>Ambiente demonstrativo • envio local</span></div></div>
          </section>
        </div>
        <nav className="bottom-nav" aria-label="Navegação principal">
          <button disabled title="Início ainda não disponível" aria-label="Início (em breve)"><Icon name="home" /><span>Início</span></button>
          <button onClick={() => openConversations(true)} aria-label="Buscar conversas"><Icon name="search" /><span>Buscar</span></button>
          <button className="nav-current" aria-current="page" onClick={() => openConversations()}><Icon name="chat" /><span>Chat</span></button>
          <button disabled title="Agendamentos ainda não disponíveis" aria-label="Agendamentos (em breve)"><Icon name="calendar" /><span>Agenda</span></button>
        </nav>
        <footer className="page-footer"><span>Exame Já <span className="footer-dot">•</span> Mais facilidade para cuidar de você.</span><span>Feito para aproximar.</span></footer>
      </main>
    </div>
  )
}

export default App
