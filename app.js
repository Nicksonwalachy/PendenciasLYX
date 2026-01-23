// ==========================================
// 1. CONFIGURAÇÃO E DADOS GLOBAIS
// ==========================================
const GERENTES_PADRAO = [
    { id: "gerente1", nome: "Jihad", email: "jihad@t3imoveis.com.br", whatsapp: "5541988251027" },
    { id: "gerente2", nome: "Tiago", email: "tiagosilva.mkt@gmail.com", whatsapp: "554195163585" },
    { id: "gerente3", nome: "Delta", email: "delta@t3imoveis.com.br", whatsapp: "554198820165" },
    { id: "gerente4", nome: "Roque", email: "Roque@t3imoveis.com.br", whatsapp: "55419999999" },
    { id: "gerente5", nome: "Nathan", email: "Nathan@t3imoveis.com.br", whatsapp: "554199023524" },
    { id: "gerente6", nome: "Paulo", email: "Paulo@t3imoveis.com.br", whatsapp: "5542991426547" },
    { id: "gerente7", nome: "Guilherme", email: "guibizan@gmail.com", whatsapp: "5541995073396" },
    { id: "gerente8", nome: "Pedro", email: "Pedro@t3imoveis.com.br", whatsapp: "5541996916905" },
    { id: "gerente9", nome: "Nickson", email: "nickson@t3imoveis.com.br", whatsapp: "5541987625292" }
];

let LISTA_USUARIOS = {};

const DADOS_ADMIN = {
    nome: "Admin",
    email: "nickson.jean21@gmail.com", 
    whatsapp: "5541987625292"
};

// ==========================================
// 2. CONFIGURAÇÃO FIREBASE & EMAILJS
// ==========================================
(function() { emailjs.init("F7b-IyVHtWqwQ1Eis"); })();

const firebaseConfig = {
  apiKey: "AIzaSyB57eei852hJo0WxRh1Bkz4qfNc1LKHjQk",
  authDomain: "pendencias-lyx.firebaseapp.com",
  projectId: "pendencias-lyx",
  storageBucket: "pendencias-lyx.firebasestorage.app",
  messagingSenderId: "390054578932",
  appId: "1:390054578932:web:4df690e76519c2dcb72ca1",
  measurementId: "G-SHNHN94FZ7"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();
const auth = firebase.auth();

let roleAtual = '';
let meuGerenteID = ''; 
let filtroAtual = 'todos'; 
let viewMode = 'lista'; 
let chartStatusInstance = null;
let chartDiretoriaInstance = null;

// ==========================================
// 3. INICIALIZAÇÃO
// ==========================================
auth.onAuthStateChanged(async user => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        
        carregarTemaSalvo();
        definirMesAtual();
        await carregarUsuariosDoBanco();

        roleAtual = (user.email.toLowerCase() === DADOS_ADMIN.email.toLowerCase()) ? 'Admin' : 'Gerente';
        document.getElementById('user-display').innerText = user.email;
        document.getElementById('role-badge').innerText = roleAtual;

        if (roleAtual === 'Admin') {
            document.getElementById('area-cadastro').classList.remove('hidden');
            document.getElementById('area-dashboard').classList.remove('hidden');
            document.getElementById('btn-relatorio-roque').classList.remove('hidden');
            document.getElementById('btn-relatorio-cesar').classList.remove('hidden');
            document.getElementById('btn-equipe').classList.remove('hidden'); 
            document.getElementById('area-agendamento-form').classList.add('hidden');
        } else {
            meuGerenteID = identificarGerentePorEmail(user.email);
            document.getElementById('area-cadastro').classList.add('hidden');
            document.getElementById('area-dashboard').classList.add('hidden');
            document.getElementById('btn-relatorio-roque').classList.add('hidden');
            document.getElementById('btn-relatorio-cesar').classList.add('hidden');
            document.getElementById('btn-equipe').classList.add('hidden');
            document.getElementById('area-agendamento-form').classList.remove('hidden');
            preencherSelectGerenteNoAgendamento();
        }
        
        document.getElementById('container-lista-agendamentos').classList.remove('hidden');
        carregarPendencias();
        carregarAgendamentos();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-screen').classList.add('hidden');
    }
});

async function carregarUsuariosDoBanco() {
    try {
        const snap = await db.collection('usuarios').get();
        if (snap.empty) {
            for (let g of GERENTES_PADRAO) { await db.collection('usuarios').doc(g.id).set(g); }
            return carregarUsuariosDoBanco();
        }
        LISTA_USUARIOS = {};
        const selectCadastro = document.getElementById('p-responsavel');
        const selectAgendamento = document.getElementById('ag-gerente');
        selectCadastro.innerHTML = '<option value="" disabled selected>Responsável...</option>';
        selectAgendamento.innerHTML = '<option value="" disabled selected>Quem é você?</option>';

        snap.forEach(doc => {
            const u = doc.data();
            LISTA_USUARIOS[doc.id] = u;
            const opt1 = new Option(u.nome, doc.id);
            const opt2 = new Option(u.nome, doc.id);
            selectCadastro.add(opt1);
            selectAgendamento.add(opt2);
        });
    } catch (err) { alert("Erro ao carregar usuários. Verifique as regras do Firebase."); }
}

function identificarGerentePorEmail(email) {
    for (const [id, dados] of Object.entries(LISTA_USUARIOS)) {
        if (dados.email.toLowerCase() === email.toLowerCase()) return id;
    }
    return null;
}

function preencherSelectGerenteNoAgendamento() {
    if(meuGerenteID) document.getElementById('ag-gerente').value = meuGerenteID;
}

function abrirModalEquipe() { document.getElementById('modal-equipe').classList.remove('hidden'); listarUsuariosModal(); }
function fecharModalEquipe() { document.getElementById('modal-equipe').classList.add('hidden'); }

function listarUsuariosModal() {
    const ul = document.getElementById('lista-usuarios-db');
    ul.innerHTML = '';
    for (const [id, u] of Object.entries(LISTA_USUARIOS)) {
        ul.innerHTML += `<li style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #eee;"><span>${u.nome} (${u.email})</span><button onclick="removerUsuario('${id}')" style="color:red; background:none; border:none; cursor:pointer;">❌</button></li>`;
    }
}

function adicionarUsuario() {
    const nome = document.getElementById('novo-nome').value;
    const email = document.getElementById('novo-email').value;
    const zap = document.getElementById('novo-zap').value;
    if(!nome || !email) return alert("Preencha Nome e Email");
    const novoId = "gerente" + new Date().getTime();
    db.collection('usuarios').doc(novoId).set({ nome, email, whatsapp: zap }).then(() => {
        alert("Usuário adicionado!"); carregarUsuariosDoBanco(); listarUsuariosModal();
        document.getElementById('novo-nome').value = ''; document.getElementById('novo-email').value = '';
    }).catch(err => alert("Erro ao adicionar: " + err.message));
}

function removerUsuario(id) {
    if(confirm("Remover este usuário?")) db.collection('usuarios').doc(id).delete().then(() => { carregarUsuariosDoBanco(); listarUsuariosModal(); });
}

// ==========================================
// 4. PENDÊNCIAS
// ==========================================

function salvarPendencia() {
    const btnSalvar = document.getElementById('btn-salvar');
    const textoOriginal = btnSalvar.innerText;
    btnSalvar.innerText = "Salvando...";
    btnSalvar.disabled = true;

    const gerenteKey = document.getElementById('p-responsavel').value;
    const diretoria = document.getElementById('p-diretoria').value;
    const titulo = document.getElementById('p-titulo').value;
    const descricao = document.getElementById('p-descricao').value;
    const cliente = document.getElementById('p-cliente').value;
    const reserva = document.getElementById('p-reserva').value;
    const dataOcorr = document.getElementById('p-data').value;
    const prazo = document.getElementById('p-prazo').value;
    const prioridade = document.getElementById('p-prioridade').value;

    if (!titulo || !gerenteKey || !dataOcorr || !diretoria) { 
        alert("Preencha Título, Diretoria, Gerente e Data."); 
        btnSalvar.innerText = textoOriginal; btnSalvar.disabled = false; return; 
    }

    const nomeGerente = LISTA_USUARIOS[gerenteKey] ? LISTA_USUARIOS[gerenteKey].nome : "Gerente";
    const numero = Math.floor(10000 + Math.random() * 90000);
    const dadosGerente = LISTA_USUARIOS[gerenteKey];

    // Gravação direta no banco (SEM UPLOAD)
    db.collection("pendencias").add({
        numero: numero, titulo: titulo, descricao: descricao, nome: titulo, 
        cliente: cliente, reserva: reserva, data: dataOcorr, prazo: prazo, 
        diretoria: diretoria, prioridade: prioridade, 
        imagemUrl: "", // Sem imagem
        notificadoVencimento: false, gerente: nomeGerente, gerenteID: gerenteKey, 
        status: "pendente", dataResolucao: "", 
        historico: [{ data: new Date().toLocaleString('pt-BR'), acao: "Criado", usuario: auth.currentUser.email }],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        const prazoF = prazo ? prazo.split('-').reverse().join('/') : "S/ Prazo";
        if(dadosGerente && dadosGerente.email) {
            const templateParams = { to_email: dadosGerente.email, nome_gerente: dadosGerente.nome, nome_pendencia: `#${numero} - ${titulo}`, cliente: cliente, reserva: reserva };
            emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams);
        }
        if(confirm("Salvo com sucesso! Abrir WhatsApp do gerente?")) {
            if(dadosGerente && dadosGerente.whatsapp) window.open(`https://wa.me/${dadosGerente.whatsapp}?text=${encodeURIComponent(`Pendência #${numero}\n${titulo}\nPrazo: ${prazoF}`)}`, '_blank');
        }
        document.querySelectorAll('#area-cadastro input, #area-cadastro textarea').forEach(i => i.value = '');
        document.getElementById('p-responsavel').value = "";
        document.getElementById('p-diretoria').value = "";
        definirMesAtual();
        btnSalvar.innerText = textoOriginal; btnSalvar.disabled = false;
    })
    .catch((error) => {
        console.error("Erro ao gravar:", error);
        alert("Erro ao salvar: " + error.message);
        btnSalvar.innerText = textoOriginal; btnSalvar.disabled = false;
    });
}

let dadosGlobaisParaGrafico = []; 

function carregarPendencias() {
    const mesFiltro = document.getElementById('filtro-mes').value;
    const textoPesquisa = document.getElementById('input-pesquisa').value.toLowerCase();

    db.collection("pendencias").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        const lista = document.getElementById('lista-pendencias');
        lista.innerHTML = "";
        
        let novasPendencias = [];
        let contagemNotificacoes = 0;
        const listaNotif = document.getElementById('lista-notificacoes');
        listaNotif.innerHTML = "";
        dadosGlobaisParaGrafico = [];

        if (snapshot.empty) { lista.innerHTML = "<p style='text-align:center; padding:20px;'>Nenhuma pendência.</p>"; return; }

        snapshot.forEach((doc) => {
            const p = doc.data();
            p.id = doc.id;
            dadosGlobaisParaGrafico.push(p);

            if (p.data && !p.data.startsWith(mesFiltro)) return;
            if (filtroAtual === 'abertos' && p.status === 'aprovado') return;
            if (filtroAtual === 'finalizados' && p.status !== 'aprovado') return;
            if (roleAtual === 'Gerente' && p.gerenteID !== meuGerenteID) return;
            
            const termo = (p.titulo + " " + p.cliente + " " + p.numero).toLowerCase();
            if (textoPesquisa && !termo.includes(textoPesquisa)) return;

            novasPendencias.push(p);

            if (roleAtual === 'Gerente' && p.status === 'pendente' && p.dataResolucao === "") {
                contagemNotificacoes++;
                listaNotif.innerHTML += `<li>⚠️ Pendência #${p.numero} devolvida!</li>`;
            }
            if (roleAtual === 'Admin' && p.status === 'analise') {
                contagemNotificacoes++;
                listaNotif.innerHTML += `<li>📝 Pendência #${p.numero} aguardando aprovação.</li>`;
            }
        });

        const badge = document.getElementById('notif-badge');
        badge.innerText = contagemNotificacoes;
        badge.classList.toggle('hidden', contagemNotificacoes === 0);

        renderizarLista(novasPendencias);
        renderizarKanban(novasPendencias);
        if (roleAtual === 'Admin') atualizarGraficos(dadosGlobaisParaGrafico);
        calcularSLA(dadosGlobaisParaGrafico);
    });
}

// --- FUNÇÃO DE RENDERIZAÇÃO OTIMIZADA (CLEAN & HIDDEN HISTORY) ---
function renderizarLista(pendencias) {
    const div = document.getElementById('lista-pendencias');
    div.innerHTML = "";
    if (pendencias.length === 0) { div.innerHTML = "<p style='text-align:center; padding:20px;'>Nada encontrado.</p>"; return; }
    pendencias.forEach(p => div.innerHTML += criarHTMLCard(p));
}

function renderizarKanban(pendencias) {
    document.getElementById('col-pendente').querySelector('.kanban-items').innerHTML = "";
    document.getElementById('col-analise').querySelector('.kanban-items').innerHTML = "";
    document.getElementById('col-aprovado').querySelector('.kanban-items').innerHTML = "";
    pendencias.forEach(p => {
        let colId = p.status === 'pendente' ? 'col-pendente' : p.status === 'analise' ? 'col-analise' : 'col-aprovado';
        document.getElementById(colId).querySelector('.kanban-items').innerHTML += criarHTMLCard(p, true);
    });
}

function toggleHistorico(id) {
    const box = document.getElementById(`hist-${id}`);
    const btn = document.getElementById(`btn-hist-${id}`);
    if (box.classList.contains('hidden')) {
        box.classList.remove('hidden');
        btn.innerText = "🔼 Ocultar Histórico";
    } else {
        box.classList.add('hidden');
        btn.innerText = "📜 Ver Histórico Completo";
    }
}

function criarHTMLCard(p, mini = false) {
    const protocolo = p.numero ? `#${p.numero}` : "S/N";
    const prio = p.prioridade || "Media";
    
    const hoje = new Date().toISOString().split('T')[0];
    let slaBadge = "";
    if (p.prazo) {
        if (p.prazo < hoje && p.status !== 'aprovado') slaBadge = `<span class="vencido-badge">ATRASADO</span>`;
        else slaBadge = `<span class="tag-prio" style="color:var(--color-primary); border:1px solid var(--color-primary); background:transparent;">No Prazo</span>`;
    }

    // Configuração para Drag & Drop (Mini card)
    const dragAttr = mini ? `draggable="true" ondragstart="drag(event)" id="card-${p.id}" data-id="${p.id}" data-status="${p.status}"` : "";

    let botoes = "";
    if (p.status === 'pendente' && roleAtual === 'Gerente') botoes = `<button class="btn-resolver" onclick="mudarStatus('${p.id}', 'analise')">✅ Resolvi</button>`;
    if (p.status === 'analise' && roleAtual === 'Admin') botoes = `<button class="btn-aprovar" onclick="mudarStatus('${p.id}', 'aprovado')">OK</button> <button class="btn-recusar" onclick="mudarStatus('${p.id}', 'pendente')">Recusar</button>`;
    if (roleAtual === 'Admin') botoes += ` <button class="btn-excluir" onclick="excluirPendencia('${p.id}')">🗑</button>`;

    // --- Versão Mini (Kanban) ---
    if (mini) {
        return `<div class="kanban-item status-${p.status}" ${dragAttr}>
            <strong>${p.titulo}</strong><br><small>${p.cliente}</small>
            <div style="margin-top:5px;">${slaBadge} <span class="tag-prio prio-${prio}">${prio}</span></div>
            <div style="margin-top:5px; text-align:right;">${botoes}</div>
        </div>`;
    } 
    
    // --- Versão Completa (Lista) com Histórico Oculto ---
    else {
        let logsHtml = "";
        if (p.historico && p.historico.length > 0) {
            logsHtml = p.historico.map(log => `<div class="hist-item"><strong>${log.usuario.split('@')[0]}</strong> <small>(${log.data})</small><br>${log.acao}</div>`).join('');
        } else {
            logsHtml = "<div class='hist-item'>Sem histórico.</div>";
        }

        const areaHistorico = `
            <button id="btn-hist-${p.id}" class="btn-historico" onclick="toggleHistorico('${p.id}')">📜 Ver Histórico Completo</button>
            <div id="hist-${p.id}" class="historico-box hidden">${logsHtml}</div>
            
            <div class="chat-input-area" style="margin-top:10px;">
                <input type="text" id="chat-input-${p.id}" class="chat-input" placeholder="Mensagem rápida...">
                <button class="btn-secondary" onclick="enviarMensagem('${p.id}')" style="padding:5px 12px;">➤</button>
            </div>
        `;

        return `
        <div class="item-pendencia status-${p.status}">
            <div style="flex:1; margin-right:20px;">
                <div style="margin-bottom:8px; font-size:0.85em; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-secondary);">
                    ${p.status} • ${protocolo} • <span style="color:var(--text-primary); font-weight:bold;">${prio}</span> ${slaBadge}
                </div>
                <h3>${p.titulo}</h3>
                <p>${p.descricao}</p>
                <div style="font-size:0.9em; color:var(--text-secondary); margin-top:15px; padding-top:10px; border-top:1px solid var(--border-color);">
                    <strong>Cliente:</strong> ${p.cliente} | <strong>Resp:</strong> ${p.gerente} | <strong>Data:</strong> ${p.data ? p.data.split('-').reverse().join('/') : '-'}
                </div>
                ${areaHistorico}
            </div>
            <div style="display:flex; flex-direction:column; gap:10px; min-width:120px;">
                ${botoes}
            </div>
        </div>`;
    }
}

// ==========================================
// 5. DRAG & DROP LOGIC
// ==========================================
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.getAttribute('data-id')); ev.dataTransfer.setData("oldStatus", ev.target.getAttribute('data-status')); }
function drop(ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text");
    const oldStatus = ev.dataTransfer.getData("oldStatus");
    const col = ev.target.closest('.kanban-col');
    if (!col) return;
    
    let newStatus = "";
    if (col.id === 'col-pendente') newStatus = 'pendente';
    else if (col.id === 'col-analise') newStatus = 'analise';
    else if (col.id === 'col-aprovado') newStatus = 'aprovado';

    if (newStatus === oldStatus) return;

    if (roleAtual === 'Gerente') {
        if (oldStatus === 'pendente' && newStatus === 'analise') mudarStatus(id, newStatus);
        else alert("Gerentes só movem de Pendente para Análise.");
        return;
    }
    if (roleAtual === 'Admin') mudarStatus(id, newStatus);
}

// ==========================================
// 6. FUNCIONALIDADES AUXILIARES
// ==========================================

function enviarMensagem(id) {
    const input = document.getElementById(`chat-input-${id}`);
    const texto = input.value;
    if (!texto) return;
    const log = { data: new Date().toLocaleString('pt-BR'), acao: `💬 ${texto}`, usuario: auth.currentUser.email };
    db.collection("pendencias").doc(id).update({ historico: firebase.firestore.FieldValue.arrayUnion(log) }).then(() => { input.value = ""; toggleHistorico(id); }); // Abre histórico para ver msg
}

function mudarModoVisualizacao(modo, btn) {
    viewMode = modo;
    document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (modo === 'lista') {
        document.getElementById('lista-pendencias').classList.remove('hidden');
        document.getElementById('kanban-pendencias').classList.add('hidden');
    } else {
        document.getElementById('lista-pendencias').classList.add('hidden');
        document.getElementById('kanban-pendencias').classList.remove('hidden');
    }
}

function toggleNotificacoes() { document.getElementById('notif-dropdown').classList.toggle('hidden'); }

function calcularSLA(dados) {
    const hoje = new Date().toISOString().split('T')[0];
    let atrasados = 0;
    dados.forEach(p => { if(p.prazo && p.prazo < hoje && p.status !== 'aprovado') atrasados++; });
    const div = document.getElementById('sla-stats');
    if(atrasados > 0) div.innerHTML = `<span style="color:red; font-weight:bold;">⚠️ Atenção: ${atrasados} pendências atrasadas!</span>`;
    else div.innerHTML = `<span style="color:green;">✅ Tudo dentro do prazo.</span>`;
}

function fazerLogin() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, pass).catch(e => document.getElementById('msg-erro').innerText = e.message);
}
function logout() { auth.signOut(); location.reload(); }
function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') { document.body.classList.add('dark-mode'); document.getElementById('btn-theme-toggle').innerText = '☀️'; }
    else { document.getElementById('btn-theme-toggle').innerText = '🌙'; }
}
function alternarTema() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) { localStorage.setItem('tema', 'dark'); document.getElementById('btn-theme-toggle').innerText = '☀️'; atualizarGraficos(dadosGlobaisParaGrafico); }
    else { localStorage.setItem('tema', 'light'); document.getElementById('btn-theme-toggle').innerText = '🌙'; atualizarGraficos(dadosGlobaisParaGrafico); }
}
function definirMesAtual() {
    const hoje = new Date();
    document.getElementById('filtro-mes').value = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;
}
function salvarAgendamento() {
    const gerenteKey = document.getElementById('ag-gerente').value;
    const data = document.getElementById('ag-data').value;
    const hora = document.getElementById('ag-hora').value;
    const motivo = document.getElementById('ag-motivo').value;
    if(!gerenteKey || !data || !hora || !motivo) { alert("Preencha todos os campos."); return; }
    const nomeGerente = LISTA_USUARIOS[gerenteKey] ? LISTA_USUARIOS[gerenteKey].nome : "Gerente";
    db.collection("agendamentos").add({
        gerente: nomeGerente, gerenteID: gerenteKey, data: data, hora: hora, motivo: motivo, status: 'pendente',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        const templateParams = { to_email: DADOS_ADMIN.email, nome_gerente: "Sistema Agenda", nome_pendencia: "AGENDAMENTO: " + motivo, cliente: "Solicitante: " + nomeGerente, reserva: data.split('-').reverse().join('/') + " às " + hora };
        emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams);
        if(confirm("Solicitação salva! Avisar Admin no WhatsApp?")) window.open(`https://wa.me/${DADOS_ADMIN.whatsapp}?text=${encodeURIComponent(`Olá Admin, solicitei agendamento: ${motivo}`)}`, '_blank');
        document.getElementById('ag-motivo').value = "";
    }).catch(err => alert("Erro: " + err.message));
}
function carregarAgendamentos() {
    db.collection("agendamentos").orderBy("data", "asc").onSnapshot(snapshot => {
        const div = document.getElementById('lista-agendamentos');
        div.innerHTML = "";
        if(snapshot.empty) { div.innerHTML = "<p style='padding:10px; color:var(--text-secondary);'>Nenhum agendamento futuro.</p>"; return; }
        snapshot.forEach(doc => {
            const a = doc.data(); const id = doc.id;
            let classeTag = "tag-pendente"; let textoTag = "Aguardando";
            if(a.status === 'aceito') { classeTag = "tag-aceito"; textoTag = "Confirmado"; }
            if(a.status === 'recusado') { classeTag = "tag-recusado"; textoTag = "Recusado"; }
            let dataF = a.data.split('-').reverse().join('/');
            const linkCalendar = gerarLinkGoogleCalendar(a.data, a.hora, `Reunião ${a.gerente}`, a.motivo);
            const btnAgenda = `<a href="${linkCalendar}" target="_blank" style="text-decoration:none;"><button style="background:#4285F4; color:white; border:none; border-radius:4px; padding:5px; font-size:0.8em; margin-top:5px; width:100%;">📅 Google Agenda</button></a>`;
            let botoesAdmin = "";
            if (roleAtual === 'Admin' && a.status === 'pendente') botoesAdmin = `<button class="btn-agenda-aceitar" onclick="responderAgendamento('${id}', 'aceito')">✔ Aceitar</button> <button class="btn-agenda-recusar" onclick="responderAgendamento('${id}', 'recusado')">✖ Recusar</button>`;
            const btnExcluir = roleAtual === 'Admin' ? `<button class="btn-excluir" style="border:none; padding:0;" onclick="excluirAgendamento('${id}')">🗑</button>` : "";
            div.innerHTML += `<div class="card-agenda"><span class="tag-agenda ${classeTag}">${textoTag}</span><h4>${a.gerente}</h4><p>${dataF} às ${a.hora}<br>${a.motivo}</p>${btnAgenda}<div style="margin-top:10px; display:flex; justify-content:space-between;"><div>${botoesAdmin}</div>${btnExcluir}</div></div>`;
        });
    });
}
function responderAgendamento(id, resposta) { if(confirm(`Marcar como ${resposta}?`)) db.collection("agendamentos").doc(id).update({ status: resposta }); }
function excluirAgendamento(id) { if(confirm("Excluir?")) db.collection("agendamentos").doc(id).delete(); }
function gerarLinkGoogleCalendar(dataStr, horaStr, titulo, descricao) {
    const start = dataStr.replace(/-/g, '') + 'T' + horaStr.replace(':', '') + '00';
    let horaFim = parseInt(horaStr.split(':')[0]) + 1;
    let minFim = horaStr.split(':')[1];
    if (horaFim < 10) horaFim = '0' + horaFim;
    const end = dataStr.replace(/-/g, '') + 'T' + horaFim + minFim + '00';
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE"); url.searchParams.append("text", titulo); url.searchParams.append("dates", `${start}/${end}`); url.searchParams.append("details", descricao); url.searchParams.append("sf", "true"); url.searchParams.append("output", "xml"); return url.toString();
}
function verificarVencimento(id, pendencia) {
    if (!pendencia.prazo) return;
    const hoje = new Date().toISOString().split('T')[0];
    if (hoje > pendencia.prazo && pendencia.status !== 'aprovado' && !pendencia.notificadoVencimento) {
        const dadosGerente = LISTA_USUARIOS[pendencia.gerenteID];
        if (dadosGerente) {
            const templateParams = { to_email: dadosGerente.email, nome_gerente: dadosGerente.nome, nome_pendencia: `[URGENTE - VENCIDO] #${pendencia.numero}`, cliente: pendencia.cliente, reserva: "Prazo expirado." };
            emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams).then(() => {
                db.collection("pendencias").doc(id).update({ notificadoVencimento: true, historico: firebase.firestore.FieldValue.arrayUnion({ data: new Date().toLocaleString('pt-BR'), acao: "Cobrança automática enviada", usuario: "Sistema" }) });
            });
        }
    }
}
function exportarExcel(filtroDiretoria) {
    db.collection("pendencias").orderBy("timestamp", "desc").get().then((snap) => {
        let dados = [];
        snap.forEach((doc) => {
            let p = doc.data();
            if (p.diretoria !== filtroDiretoria) return;
            if (p.status === 'aprovado') return;
            dados.push({ "ID": p.numero||"S/N", "Status": p.status, "Diretoria": p.diretoria, "Título": p.titulo||p.nome, "Prioridade": p.prioridade||"-", "Descrição": p.descricao||"", "Gerente": p.gerente, "Data": p.data, "Prazo": p.prazo, "Cliente": p.cliente, "Link": p.imagemUrl||"" });
        });
        if (dados.length === 0) { alert(`Nada encontrado para ${filtroDiretoria}.`); return; }
        const ws = XLSX.utils.json_to_sheet(dados); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, `Pendencias`); XLSX.writeFile(wb, `Relatorio_${filtroDiretoria}.xlsx`);
    });
}
function mudarStatus(id, st) {
    let msg = ""; let dados = { status: st }; let textoLog = ""; let motivo = "";
    if (st === 'pendente') {
        motivo = prompt("Motivo da devolução:"); if (motivo === null || !motivo.trim()) return;
        dados.dataResolucao = ""; textoLog = `Admin Recusou: ${motivo}`;
    } else if (st === 'analise') { 
        if (!confirm("Confirma resolução?")) return; dados.dataResolucao = new Date().toLocaleString('pt-BR'); textoLog = "Gerente Resolveu";
    } else if (st === 'aprovado') {
        if (!confirm("Aprovar?")) return; textoLog = "Admin Aprovou";
    }
    dados.historico = firebase.firestore.FieldValue.arrayUnion({ data: new Date().toLocaleString('pt-BR'), acao: textoLog, usuario: auth.currentUser.email });
    
    if (st === 'pendente' || st === 'analise') {
        db.collection("pendencias").doc(id).get().then(doc => {
            if (doc.exists) {
                const p = doc.data();
                if(st === 'pendente'){
                    const d = LISTA_USUARIOS[p.gerenteID];
                    if(d) { emailjs.send('service_ywnbbqr', 'template_7ago0v7', { to_email: d.email, nome_pendencia: `[DEVOLVIDA] #${p.numero}`, reserva: `MOTIVO: ${motivo}` }); window.open(`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(`Pendência #${p.numero} devolvida: ${motivo}`)}`, '_blank'); }
                } else if (st === 'analise') {
                    emailjs.send('service_ywnbbqr', 'template_7ago0v7', { to_email: DADOS_ADMIN.email, nome_pendencia: `[RESOLVIDA] #${p.numero}`, reserva: `Gerente resolveu.` });
                    if(confirm("Notificar Admin Zap?")) window.open(`https://wa.me/${DADOS_ADMIN.whatsapp}?text=${encodeURIComponent(`Pendência #${p.numero} resolvida.`)}`, '_blank');
                }
            }
            return db.collection("pendencias").doc(id).update(dados);
        });
    } else { db.collection("pendencias").doc(id).update(dados); }
}
function excluirPendencia(id) { if(confirm("Excluir?")) db.collection("pendencias").doc(id).delete(); }
function filtrar(tipo, el) { filtroAtual = tipo; document.querySelectorAll('.btn-filter').forEach(b=>b.classList.remove('active')); el.classList.add('active'); carregarPendencias(false); }
function atualizarGraficos(dados) {
    if (!dados || dados.length === 0) return;
    const statusCount = { pendente: 0, analise: 0, aprovado: 0 };
    const diretoriaCount = { Roque: 0, Cesar: 0 };
    dados.forEach(p => {
        if (statusCount[p.status] !== undefined) statusCount[p.status]++;
        if (p.diretoria && diretoriaCount[p.diretoria] !== undefined) diretoriaCount[p.diretoria]++;
    });
    const isDark = document.body.classList.contains('dark-mode');
    const colorText = isDark ? '#e5e7eb' : '#333';

    const ctxStatus = document.getElementById('chartStatus').getContext('2d');
    if (chartStatusInstance) chartStatusInstance.destroy();
    chartStatusInstance = new Chart(ctxStatus, {
        type: 'doughnut',
        data: { labels: ['Pendente', 'Em Análise', 'Finalizado'], datasets: [{ data: [statusCount.pendente, statusCount.analise, statusCount.aprovado], backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: colorText } }, title: { display: true, text: 'Status das Pendências', color: colorText } } }
    });

    const ctxDir = document.getElementById('chartDiretoria').getContext('2d');
    if (chartDiretoriaInstance) chartDiretoriaInstance.destroy();
    chartDiretoriaInstance = new Chart(ctxDir, {
        type: 'bar',
        data: { labels: ['Roque', 'Cesar'], datasets: [{ label: 'Pendências', data: [diretoriaCount.Roque, diretoriaCount.Cesar], backgroundColor: ['#16a34a', '#14532d'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Por Diretoria', color: colorText } }, scales: { x: { ticks: { color: colorText } }, y: { ticks: { color: colorText } } } }
    });
}