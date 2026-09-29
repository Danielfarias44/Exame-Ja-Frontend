import { useEffect, useRef, useState } from 'react'
import './App.css'

function Icon({ name, size = 20 }) {
  const caminhos = {
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm4 11 2 2 4-4',
    chat: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z',
    search: 'm21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    send: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13',
    arrow: 'm15 18-6-6 6-6',
    info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={caminhos[name]} /></svg>
}

const contatos = [
  { id: 'central', name: 'Central de atendimento', initials: 'E', role: 'Equipe de agendamentos • Exame Já', preview: 'Como podemos ajudar você hoje?', time: '09:42', unread: 1, color: 'purple' },
  { id: 'clinica', name: 'Clínica Bem Estar', initials: 'BE', role: 'Recepção • Clínica parceira', preview: 'Tire suas dúvidas sobre agendamentos.', time: 'Ontem', color: 'slate' },
  { id: 'lab', name: 'Laboratório Vida', initials: 'LV', role: 'Atendimento • Laboratório parceiro', preview: 'Estamos à disposição para ajudar.', time: 'Seg', color: 'blue' },
]
const mensagensIniciais = {
  central: [
    { id: 1, text: 'Olá! Boas-vindas ao Exame Já!', time: '09:40' },
    { id: 2, text: 'Este é o seu espaço para conversar com nossa equipe e tirar dúvidas sobre seus agendamentos.', time: '09:40' },
    { id: 3, text: 'Olá! Gostaria de algumas informações sobre meus exames.', time: '09:41', own: true },
    { id: 4, text: 'Claro! Estamos aqui para ajudar. Como podemos ajudar você hoje?', time: '09:42' },
  ],
  clinica: [{ id: 5, text: 'Olá! Você está na conversa de demonstração com a recepção da Clínica Bem Estar. Tire suas dúvidas sobre agendamentos por aqui.', time: '14:30' }],
  lab: [{ id: 6, text: 'Olá! Seja bem-vindo ao Laboratório Vida. Estamos à disposição para ajudar.', time: '10:15' }],
}

const normalizeSearch = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()

function App() {
  const [conta, definirConta] = useState(null)
  const [erroConta, definirErroConta] = useState('')
  const referenciaSessao = useRef(null)
  const [selecionado, definirSelecionado] = useState('central')
  const [busca, definirBusca] = useState('')
  const [filtro, definirFiltro] = useState('Todas')
  const [mensagens, definirMensagens] = useState(mensagensIniciais)
  const [rascunhos, definirRascunhos] = useState({})
  const [lidas, definirLidas] = useState([])
  const [conversaMovel, definirConversaMovel] = useState(false)
  const [mostrarInformacoes, definirMostrarInformacoes] = useState(false)
  const [sugestao, definirSugestao] = useState(null)
  const [aviso, definirAviso] = useState('')
  const referenciaAplicacao = useRef(null)
  const referenciaFim = useRef(null)
  const referenciaTituloConversa = useRef(null)
  const referenciaTituloLista = useRef(null)
  const referenciasContatos = useRef({})
  const referenciaSugestao = useRef(null)
  const referenciaCampo = useRef(null)
  const referenciaBusca = useRef(null)
  const contato = contatos.find((item) => item.id === selecionado)
  const rascunho = rascunhos[selecionado] || ''
  const contatosVisiveis = contatos.filter((item) => normalizeSearch(`${item.name} ${item.role}`).includes(normalizeSearch(busca)) && (filtro === 'Todas' || (item.unread && !lidas.includes(item.id))))

  useEffect(() => {
    let ativo = true
    const urlSessao = new URL('/api/session.js', window.location.origin).href
    import(/* @vite-ignore */ urlSessao).then(async (sessao) => {
      referenciaSessao.current = sessao
      if (sessao.hasSession()) {
        const perfil = await sessao.getProfile()
        if (ativo) definirConta(perfil)
      }
    }).catch((erro) => {
      if (ativo) definirErroConta(erro.status === 401 ? 'Sua sessão expirou. Entre novamente.' : 'Não foi possível verificar sua conta. Tente entrar novamente.')
    })
    return () => { ativo = false }
  }, [])

  function signOut() {
    referenciaSessao.current?.clearSession()
    window.location.assign('/login.html')
  }

  useEffect(() => { referenciaFim.current?.scrollIntoView({ block: 'nearest' }) }, [selecionado, mensagens, conversaMovel])

  useEffect(() => {
    const campo = referenciaCampo.current
    if (!campo) return
    campo.style.height = 'auto'
    campo.style.height = `${Math.min(campo.scrollHeight, 144)}px`
  }, [rascunho, selecionado, conversaMovel])

  useEffect(() => {
    const telaDesktop = window.matchMedia('(min-width: 701px)')
    const marcarVisivelComoLida = () => {
      if (telaDesktop.matches || conversaMovel) {
        definirLidas((atual) => atual.includes(selecionado) ? atual : [...atual, selecionado])
      }
    }
    marcarVisivelComoLida()
    telaDesktop.addEventListener('change', marcarVisivelComoLida)
    return () => telaDesktop.removeEventListener('change', marcarVisivelComoLida)
  }, [selecionado, conversaMovel])

  useEffect(() => {
    const areaVisivel = window.visualViewport
    const atualizarAltura = () => referenciaAplicacao.current?.style.setProperty('--viewport-height', `${areaVisivel?.height ?? window.innerHeight}px`)
    atualizarAltura()
    areaVisivel?.addEventListener('resize', atualizarAltura)
    window.addEventListener('resize', atualizarAltura)
    return () => {
      areaVisivel?.removeEventListener('resize', atualizarAltura)
      window.removeEventListener('resize', atualizarAltura)
    }
  }, [])

  function openContact(id) {
    definirSelecionado(id)
    definirLidas((atual) => [...new Set([...atual, id])])
    definirMostrarInformacoes(false)
    definirConversaMovel(true)
    requestAnimationFrame(() => referenciaTituloConversa.current?.focus())
  }

  function prepareRequest(texto) {
    openContact('central')
    definirSugestao(texto)
    requestAnimationFrame(() => referenciaSugestao.current?.focus())
  }

  function openConversations(focarBusca = false) {
    definirConversaMovel(false)
    if (focarBusca) definirFiltro('Todas')
    requestAnimationFrame(() => {
      const destino = focarBusca ? referenciaBusca.current : referenciasContatos.current[selecionado] || referenciaTituloLista.current
      destino?.focus()
    })
  }

  function addMessage(texto) {
    if (!texto.trim() || texto.length > 4000) return
    const mensagem = { id: crypto.randomUUID(), text: texto.trim(), own: true, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
    definirMensagens((atual) => ({ ...atual, [selecionado]: [...atual[selecionado], mensagem] }))
    definirLidas((atual) => [...new Set([...atual, selecionado])])
    definirAviso(`Mensagem adicionada à conversa com ${contato.name}. Esta é uma demonstração; a clínica não recebeu a mensagem.`)
  }

  function sendMessage(evento) {
    evento.preventDefault()
    if (!rascunho.trim()) return
    addMessage(rascunho)
    definirRascunhos((atual) => ({ ...atual, [selecionado]: '' }))
    referenciaCampo.current?.focus()
  }

  function sendSuggestion() {
    if (!sugestao) return
    addMessage(sugestao)
    definirSugestao(null)
    referenciaCampo.current?.focus()
  }

  function clearSearch() {
    definirBusca('')
    definirFiltro('Todas')
    requestAnimationFrame(() => referenciaBusca.current?.focus())
  }

  return (
    <div ref={referenciaAplicacao} className={`app ${conversaMovel ? 'conversation-open' : ''}`}>
      <a className="skip-link" href={conversaMovel ? "#message-input" : "#conversation-list-title"}>Pular para o atendimento</a>
      <div className="sr-only" role="status" aria-atomic="true">{aviso}</div>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => openConversations()} aria-label="Exame Já, voltar ao atendimento"><img className="brand-symbol" src="/logo-symbol.svg" alt="" width="43" height="50" /><span>EXAME JÁ</span></button>
        <div className="topbar-section"><Icon name="chat" size={18} /><span>Área do paciente</span></div>
        <div className="profile">{conta ? <><span className="profile-avatar" aria-hidden="true">{conta.name.slice(0, 2).toLocaleUpperCase('pt-BR')}</span><div><strong>{conta.name}</strong><span>Conta conectada</span></div><button className="account-action" onClick={signOut}>Sair</button></> : <a className="account-action" href="/login.html">Entrar</a>}</div>
      </header>

      <main>
        {erroConta && <p className="account-notice" role="status">{erroConta} <a href="/login.html">Entrar na conta</a></p>}
        <div className="page-heading"><div><h1>Atendimento</h1><p>Precisa marcar um exame? Prepare um pedido ou escreva sua dúvida.</p></div></div>
        <section className="service-actions" aria-label="Como podemos ajudar?">
          <button className="primary-action" onClick={() => prepareRequest('Olá! Quero marcar um exame.')}><Icon name="calendar" /><span>Pedir agendamento de exame</span></button>
          <button onClick={() => prepareRequest('Olá! Quero consultar meus agendamentos.')}><Icon name="calendar" /><span>Perguntar sobre meus agendamentos</span></button>
          <button onClick={() => prepareRequest('Olá! Gostaria de falar com um atendente.')}><Icon name="chat" /><span>Pedir ajuda à equipe</span></button>
          <p>As opções abrem uma sugestão de mensagem para a central. Nenhum exame é agendado automaticamente.</p>
        </section>
        <div className={`chat-shell ${conversaMovel ? 'mobile-chat-open' : ''}`}>
          <aside id="conversation-list" className="conversations" aria-label="Conversas">
            <div className="list-heading"><h2 id="conversation-list-title" ref={referenciaTituloLista} tabIndex={-1}>Suas conversas <span>{contatos.length}</span></h2><Icon name="chat" /></div>
            <label className="search-label" htmlFor="conversation-search">Buscar conversas</label>
            <div className="search"><Icon name="search" size={19} /><input id="conversation-search" ref={referenciaBusca} value={busca} onChange={(evento) => definirBusca(evento.target.value)} placeholder="Nome da clínica ou atendimento" /></div>
            <div className="filters" role="group" aria-label="Filtrar conversas">{['Todas', 'Não lidas'].map((rotulo) => <button key={rotulo} className={filtro === rotulo ? 'active' : ''} aria-pressed={filtro === rotulo} onClick={() => definirFiltro(rotulo)}>{rotulo}{rotulo === 'Não lidas' && <span>{contatos.filter((item) => item.unread && !lidas.includes(item.id)).length}</span>}</button>)}</div>
            <div className="contact-list">{contatosVisiveis.map((item) => {
              const ultimaMensagem = mensagens[item.id].at(-1)
              return <button className={`contact ${selecionado === item.id ? 'selected' : ''}`} key={item.id} ref={(elemento) => { referenciasContatos.current[item.id] = elemento }} aria-pressed={selecionado === item.id} onClick={() => openContact(item.id)}><span className={`avatar ${item.color}`}>{item.initials}</span><span className="contact-content"><span className="contact-top"><strong>{item.name}</strong><time>{ultimaMensagem.own ? ultimaMensagem.time : item.time}</time></span><span className="contact-role">{item.role}</span><span className="contact-preview"><span>{rascunhos[item.id]?.trim() ? `Rascunho: ${rascunhos[item.id]}` : ultimaMensagem.own ? `Você: ${ultimaMensagem.text}` : item.preview}</span>{item.unread && !lidas.includes(item.id) ? <b aria-label={`${item.unread} mensagem não lida`}>{item.unread}</b> : null}</span></span></button>
            })}{!contatosVisiveis.length && <div className="empty-list"><p role="status">{busca.trim() ? `Nenhuma conversa encontrada para “${busca.trim()}”${filtro === 'Não lidas' ? ' entre as não lidas' : ''}.` : 'Você não tem mensagens não lidas.'}</p><button onClick={clearSearch}>{busca.trim() ? 'Limpar busca e filtros' : 'Ver todas as conversas'}</button><button onClick={() => openContact('central')}>Abrir conversa com a central</button></div>}</div>
          </aside>

          <section className="conversation" aria-label={`Conversa com ${contato.name}`}>
            <header className="conversation-header"><button className="icon-button back-button" aria-label="Voltar às conversas" onClick={() => openConversations()}><Icon name="arrow" /><span>Voltar às conversas</span></button><span className={`avatar ${contato.color}`}>{contato.initials}</span><div className="conversation-title"><h2 ref={referenciaTituloConversa} tabIndex={-1}>{contato.name}</h2><span>{contato.role}</span><span className="attendance-status">Demonstração • sem atendente conectado</span></div><button className={`icon-button ${mostrarInformacoes ? 'info-active' : ''}`} aria-label="Informações da conversa" aria-expanded={mostrarInformacoes} aria-controls="conversation-info" onClick={() => definirMostrarInformacoes(!mostrarInformacoes)}><Icon name="info" /></button></header>
            <div id="conversation-info" className="info-panel" hidden={!mostrarInformacoes}><strong>Quem atende neste canal?</strong><p>{contato.role}. Canal para dúvidas administrativas sobre exames e agendamentos.</p><p>Esta é uma demonstração, sem atendimento humano ou respostas automáticas. Mensagens e rascunhos ficam apenas nesta página e são apagados ao recarregar. Horários e prazo de resposta não estão disponíveis.</p></div>
            <div className="message-area" role="log" tabIndex={0} aria-label={`Histórico com ${contato.name}`} aria-live="polite" aria-relevant="additions">
              <div className="date-divider"><span>Conversa demonstrativa</span></div>
              {mensagens[selecionado].map((mensagem) => <div className={`message-row ${mensagem.own ? 'own' : ''}`} key={mensagem.id}>{!mensagem.own && <span className={`avatar small ${contato.color}`}>{contato.initials}</span>}<div className="message-wrap"><span className="sender-name">{mensagem.own ? 'Você' : contato.name}</span><div className="message-bubble"><p>{mensagem.text}</p><span className="message-time">{mensagem.time}{mensagem.own && <span>Somente nesta demonstração</span>}</span></div></div></div>)}
              <div ref={referenciaFim} />
            </div>
            <div className="composer-area">
              {selecionado === 'central' && sugestao && <section className="suggestion-preview" aria-labelledby="suggestion-title">
                <h3 id="suggestion-title" ref={referenciaSugestao} tabIndex={-1}>Sugestão para a central</h3>
                <p>{sugestao}</p>
                {rascunho.trim() && <p className="draft-notice">Seu rascunho abaixo será mantido.</p>}
                <div className="suggestion-controls">
                  <button className="suggestion-send" onClick={sendSuggestion}>Enviar esta sugestão</button>
                  <button onClick={() => { definirSugestao(null); referenciaCampo.current?.focus() }}>Cancelar sugestão</button>
                </div>
              </section>}
              <label className="composer-label" htmlFor="message-input">Sua mensagem para {contato.name}</label>
              <form className="composer" onSubmit={sendMessage}>
                <textarea id="message-input" ref={referenciaCampo} rows={2} value={rascunho} onChange={(evento) => { definirRascunhos((atual) => ({ ...atual, [selecionado]: evento.target.value })); definirAviso('') }} onKeyDown={(evento) => {
                  if (evento.key === 'Enter' && (evento.ctrlKey || evento.metaKey) && !evento.nativeEvent.isComposing) sendMessage(evento)
                }} placeholder="Escreva sua dúvida aqui…" aria-describedby="message-help message-count demo-note" aria-keyshortcuts="Control+Enter Meta+Enter" maxLength={4000} />
                <button className="send-button" type="submit" disabled={!rascunho.trim()}><Icon name="send" size={20} /><span>Enviar</span></button>
              </form>
              <div className="composer-details"><p id="message-help" className="message-help">Enter cria uma nova linha. Para enviar, use o botão Enviar.</p><span id="message-count">{rascunho.length.toLocaleString('pt-BR')} / 4.000 caracteres</span></div>
              <p className="sr-only" role="status">{rascunho.length === 4000 ? 'Limite de 4.000 caracteres atingido.' : ''}</p>
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
