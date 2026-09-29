import { useEffect, useRef, useState } from 'react'
import './App.css'

function Icon({ name, size = 20 }) {
  const paths = {
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm4 11 2 2 4-4',
    chat: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z',
    search: 'm21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    send: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13',
    arrow: 'm15 18-6-6 6-6',
    info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

const contacts = [
  { id: 'central', name: 'Central de atendimento', initials: 'E', role: 'Equipe de agendamentos • Exame Já', preview: 'Como podemos ajudar você hoje?', time: '09:42', unread: 1, color: 'purple' },
  { id: 'clinica', name: 'Clínica Bem Estar', initials: 'BE', role: 'Recepção • Clínica parceira', preview: 'Tire suas dúvidas sobre agendamentos.', time: 'Ontem', color: 'slate' },
  { id: 'lab', name: 'Laboratório Vida', initials: 'LV', role: 'Atendimento • Laboratório parceiro', preview: 'Estamos à disposição para ajudar.', time: 'Seg', color: 'blue' },
]
const initialMessages = {
  central: [
    { id: 1, text: 'Olá! Boas-vindas ao Exame Já!', time: '09:40' },
    { id: 2, text: 'Este é o seu espaço para conversar com nossa equipe e tirar dúvidas sobre seus agendamentos.', time: '09:40' },
    { id: 3, text: 'Olá! Gostaria de algumas informações sobre meus exames.', time: '09:41', own: true },
    { id: 4, text: 'Claro! Estamos aqui para ajudar. Como podemos ajudar você hoje?', time: '09:42' },
  ],
  clinica: [{ id: 5, text: 'Olá! Você está na conversa de demonstração com a recepção da Clínica Bem Estar. Tire suas dúvidas sobre agendamentos por aqui.', time: '14:30' }],
  lab: [{ id: 6, text: 'Olá! Seja bem-vindo ao Laboratório Vida. Estamos à disposição para ajudar.', time: '10:15' }],
}

const normalizeSearch = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()

function App() {
  const [selected, setSelected] = useState('central')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todas')
  const [messages, setMessages] = useState(initialMessages)
  const [drafts, setDrafts] = useState({})
  const [read, setRead] = useState([])
  const [mobileChat, setMobileChat] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const appRef = useRef(null)
  const endRef = useRef(null)
  const conversationHeadingRef = useRef(null)
  const listHeadingRef = useRef(null)
  const contactRefs = useRef({})
  const suggestionRef = useRef(null)
  const inputRef = useRef(null)
  const searchRef = useRef(null)
  const contact = contacts.find((item) => item.id === selected)
  const draft = drafts[selected] || ''
  const visibleContacts = contacts.filter((item) => normalizeSearch(`${item.name} ${item.role}`).includes(normalizeSearch(query)) && (filter === 'Todas' || (item.unread && !read.includes(item.id))))

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }) }, [selected, messages, mobileChat])

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 144)}px`
  }, [draft, selected, mobileChat])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 701px)')
    const markVisibleAsRead = () => {
      if (desktop.matches || mobileChat) {
        setRead((current) => current.includes(selected) ? current : [...current, selected])
      }
    }
    markVisibleAsRead()
    desktop.addEventListener('change', markVisibleAsRead)
    return () => desktop.removeEventListener('change', markVisibleAsRead)
  }, [selected, mobileChat])

  useEffect(() => {
    const viewport = window.visualViewport
    const updateHeight = () => appRef.current?.style.setProperty('--viewport-height', `${viewport?.height ?? window.innerHeight}px`)
    updateHeight()
    viewport?.addEventListener('resize', updateHeight)
    window.addEventListener('resize', updateHeight)
    return () => {
      viewport?.removeEventListener('resize', updateHeight)
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  function openContact(id) {
    setSelected(id)
    setRead((current) => [...new Set([...current, id])])
    setShowInfo(false)
    setMobileChat(true)
    requestAnimationFrame(() => conversationHeadingRef.current?.focus())
  }

  function prepareRequest(text) {
    openContact('central')
    setSuggestion(text)
    requestAnimationFrame(() => suggestionRef.current?.focus())
  }

  function openConversations(focusSearch = false) {
    setMobileChat(false)
    if (focusSearch) setFilter('Todas')
    requestAnimationFrame(() => {
      const target = focusSearch ? searchRef.current : contactRefs.current[selected] || listHeadingRef.current
      target?.focus()
    })
  }

  function addMessage(text) {
    if (!text.trim() || text.length > 4000) return
    const message = { id: crypto.randomUUID(), text: text.trim(), own: true, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
    setMessages((current) => ({ ...current, [selected]: [...current[selected], message] }))
    setRead((current) => [...new Set([...current, selected])])
    setAnnouncement(`Mensagem adicionada à conversa com ${contact.name}. Esta é uma demonstração; a clínica não recebeu a mensagem.`)
  }

  function sendMessage(event) {
    event.preventDefault()
    if (!draft.trim()) return
    addMessage(draft)
    setDrafts((current) => ({ ...current, [selected]: '' }))
    inputRef.current?.focus()
  }

  function sendSuggestion() {
    if (!suggestion) return
    addMessage(suggestion)
    setSuggestion(null)
    inputRef.current?.focus()
  }

  function clearSearch() {
    setQuery('')
    setFilter('Todas')
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  return (
    <div ref={appRef} className={`app ${mobileChat ? 'conversation-open' : ''}`}>
      <a className="skip-link" href={mobileChat ? "#message-input" : "#conversation-list-title"}>Pular para o atendimento</a>
      <div className="sr-only" role="status" aria-atomic="true">{announcement}</div>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => openConversations()} aria-label="Exame Já, voltar ao atendimento"><img className="brand-symbol" src="/logo-symbol.svg" alt="" width="43" height="50" /><span>EXAME JÁ</span></button>
        <div className="topbar-section"><Icon name="chat" size={18} /><span>Área do paciente</span></div>
        <div className="profile"><span className="profile-avatar">VC</span><div><strong>Você</strong><span>Paciente</span></div></div>
      </header>

      <main>
        <div className="page-heading"><div><h1>Atendimento</h1><p>Precisa marcar um exame? Prepare um pedido ou escreva sua dúvida.</p></div></div>
        <section className="service-actions" aria-label="Como podemos ajudar?">
          <button className="primary-action" onClick={() => prepareRequest('Olá! Quero marcar um exame.')}><Icon name="calendar" /><span>Pedir agendamento de exame</span></button>
          <button onClick={() => prepareRequest('Olá! Quero consultar meus agendamentos.')}><Icon name="calendar" /><span>Perguntar sobre meus agendamentos</span></button>
          <button onClick={() => prepareRequest('Olá! Gostaria de falar com um atendente.')}><Icon name="chat" /><span>Pedir ajuda à equipe</span></button>
          <p>As opções abrem uma sugestão de mensagem para a central. Nenhum exame é agendado automaticamente.</p>
        </section>
        <div className={`chat-shell ${mobileChat ? 'mobile-chat-open' : ''}`}>
          <aside id="conversation-list" className="conversations" aria-label="Conversas">
            <div className="list-heading"><h2 id="conversation-list-title" ref={listHeadingRef} tabIndex={-1}>Suas conversas <span>{contacts.length}</span></h2><Icon name="chat" /></div>
            <label className="search-label" htmlFor="conversation-search">Buscar conversas</label>
            <div className="search"><Icon name="search" size={19} /><input id="conversation-search" ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome da clínica ou atendimento" /></div>
            <div className="filters" role="group" aria-label="Filtrar conversas">{['Todas', 'Não lidas'].map((label) => <button key={label} className={filter === label ? 'active' : ''} aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}{label === 'Não lidas' && <span>{contacts.filter((item) => item.unread && !read.includes(item.id)).length}</span>}</button>)}</div>
            <div className="contact-list">{visibleContacts.map((item) => {
              const last = messages[item.id].at(-1)
              return <button className={`contact ${selected === item.id ? 'selected' : ''}`} key={item.id} ref={(element) => { contactRefs.current[item.id] = element }} aria-pressed={selected === item.id} onClick={() => openContact(item.id)}><span className={`avatar ${item.color}`}>{item.initials}</span><span className="contact-content"><span className="contact-top"><strong>{item.name}</strong><time>{last.own ? last.time : item.time}</time></span><span className="contact-role">{item.role}</span><span className="contact-preview"><span>{drafts[item.id]?.trim() ? `Rascunho: ${drafts[item.id]}` : last.own ? `Você: ${last.text}` : item.preview}</span>{item.unread && !read.includes(item.id) ? <b aria-label={`${item.unread} mensagem não lida`}>{item.unread}</b> : null}</span></span></button>
            })}{!visibleContacts.length && <div className="empty-list"><p role="status">{query.trim() ? `Nenhuma conversa encontrada para “${query.trim()}”${filter === 'Não lidas' ? ' entre as não lidas' : ''}.` : 'Você não tem mensagens não lidas.'}</p><button onClick={clearSearch}>{query.trim() ? 'Limpar busca e filtros' : 'Ver todas as conversas'}</button><button onClick={() => openContact('central')}>Abrir conversa com a central</button></div>}</div>
          </aside>

          <section className="conversation" aria-label={`Conversa com ${contact.name}`}>
            <header className="conversation-header"><button className="icon-button back-button" aria-label="Voltar às conversas" onClick={() => openConversations()}><Icon name="arrow" /><span>Voltar às conversas</span></button><span className={`avatar ${contact.color}`}>{contact.initials}</span><div className="conversation-title"><h2 ref={conversationHeadingRef} tabIndex={-1}>{contact.name}</h2><span>{contact.role}</span><span className="attendance-status">Demonstração • sem atendente conectado</span></div><button className={`icon-button ${showInfo ? 'info-active' : ''}`} aria-label="Informações da conversa" aria-expanded={showInfo} aria-controls="conversation-info" onClick={() => setShowInfo(!showInfo)}><Icon name="info" /></button></header>
            <div id="conversation-info" className="info-panel" hidden={!showInfo}><strong>Quem atende neste canal?</strong><p>{contact.role}. Canal para dúvidas administrativas sobre exames e agendamentos.</p><p>Esta é uma demonstração, sem atendimento humano ou respostas automáticas. Mensagens e rascunhos ficam apenas nesta página e são apagados ao recarregar. Horários e prazo de resposta não estão disponíveis.</p></div>
            <div className="message-area" role="log" tabIndex={0} aria-label={`Histórico com ${contact.name}`} aria-live="polite" aria-relevant="additions">
              <div className="date-divider"><span>Conversa demonstrativa</span></div>
              {messages[selected].map((message) => <div className={`message-row ${message.own ? 'own' : ''}`} key={message.id}>{!message.own && <span className={`avatar small ${contact.color}`}>{contact.initials}</span>}<div className="message-wrap"><span className="sender-name">{message.own ? 'Você' : contact.name}</span><div className="message-bubble"><p>{message.text}</p><span className="message-time">{message.time}{message.own && <span>Somente nesta demonstração</span>}</span></div></div></div>)}
              <div ref={endRef} />
            </div>
            <div className="composer-area">
              {selected === 'central' && suggestion && <section className="suggestion-preview" aria-labelledby="suggestion-title">
                <h3 id="suggestion-title" ref={suggestionRef} tabIndex={-1}>Sugestão para a central</h3>
                <p>{suggestion}</p>
                {draft.trim() && <p className="draft-notice">Seu rascunho abaixo será mantido.</p>}
                <div className="suggestion-controls">
                  <button className="suggestion-send" onClick={sendSuggestion}>Enviar esta sugestão</button>
                  <button onClick={() => { setSuggestion(null); inputRef.current?.focus() }}>Cancelar sugestão</button>
                </div>
              </section>}
              <label className="composer-label" htmlFor="message-input">Sua mensagem para {contact.name}</label>
              <form className="composer" onSubmit={sendMessage}>
                <textarea id="message-input" ref={inputRef} rows={2} value={draft} onChange={(event) => { setDrafts((current) => ({ ...current, [selected]: event.target.value })); setAnnouncement('') }} onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) sendMessage(event)
                }} placeholder="Escreva sua dúvida aqui…" aria-describedby="message-help message-count demo-note" aria-keyshortcuts="Control+Enter Meta+Enter" maxLength={4000} />
                <button className="send-button" type="submit" disabled={!draft.trim()}><Icon name="send" size={20} /><span>Enviar</span></button>
              </form>
              <div className="composer-details"><p id="message-help" className="message-help">Enter cria uma nova linha. Para enviar, use o botão Enviar.</p><span id="message-count">{draft.length.toLocaleString('pt-BR')} / 4.000 caracteres</span></div>
              <p className="sr-only" role="status">{draft.length === 4000 ? 'Limite de 4.000 caracteres atingido.' : ''}</p>
              <p id="demo-note" className="demo-note">Demonstração: a clínica não recebe estas mensagens.</p>
            </div>
          </section>
        </div>
        <nav className="bottom-nav" aria-label="Navegação do atendimento">
          <button className="nav-current" aria-current="page" onClick={() => openConversations()}><Icon name="chat" /><span>Atendimento</span></button>
          <button onClick={() => openConversations(true)}><Icon name="search" /><span>Buscar conversas</span></button>
        </nav>
      </main>
    </div>
  )
}

export default App
