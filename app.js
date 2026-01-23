// ==========================================
// 1. CONFIGURAÇÃO DE CONTATOS
// ==========================================
const CADASTRO_GERENTES = {
    "gerente1": { nome: "Jihad", email: "jihad@t3imoveis.com.br", whatsapp: "5541988251027" },
    "gerente2": { nome: "Tiago", email: "tiagosilva.mkt@gmail.com", whatsapp: "554195163585" },
    "gerente3": { nome: "Delta", email: "delta@t3imoveis.com.br", whatsapp: "554198820165" },
    "gerente4": { nome: "Roque", email: "Roque@t3imoveis.com.br", whatsapp: "55419999999" },
    "gerente5": { nome: "Nathan", email: "Nathan@t3imoveis.com.br", whatsapp: "554199023524" },
    "gerente6": { nome: "Paulo", email: "Paulo@t3imoveis.com.br", whatsapp: "5542991426547" },
    "gerente7": { nome: "Guilherme", email: "guibizan@gmail.com", whatsapp: "5541995073396" },
    "gerente8": { nome: "Pedro", email: "Pedro@t3imoveis.com.br", whatsapp: "5541996916905" },
    "gerente9": { nome: "Nickson", email: "nickson@t3imoveis.com.br", whatsapp: "5541987625292" }
};

const DADOS_ADMIN = {
    nome: "Admin",
    email: "nickson.jean21@gmail.com", 
    whatsapp: "5541987625292"
};

// ==========================================
// 2. CONFIGURAÇÃO DO EMAILJS
// ==========================================
(function() {
    emailjs.init("F7b-IyVHtWqwQ1Eis"); 
})();

// ==========================================
// 3. CONFIGURAÇÃO DO FIREBASE
// ==========================================
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

const ADMIN_EMAIL = "nickson.jean21@gmail.com"; 
let filtroAtual = 'todos'; 
let roleAtual = '';
let meuGerenteID = ''; 
let chartStatusInstance = null;
let chartDiretoriaInstance = null;

// ==========================================
// 4. LÓGICA DE TEMA E INICIALIZAÇÃO
// ==========================================
function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem('tema');
    const btn = document.getElementById('btn-theme-toggle');
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
        if(btn) btn.innerText = '☀️';
    } else {
        if(btn) btn.innerText = '🌙';
    }
}

function alternarTema() {
    const body = document.body;
    const btn = document.getElementById('btn-theme-toggle');
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('tema', 'dark');
        btn.innerText = '☀️';
        // Atualiza cores dos gráficos se necessário
        atualizarGraficos(dadosGlobaisParaGrafico); 
    } else {
        localStorage.setItem('tema', 'light');
        btn.innerText = '🌙';
        atualizarGraficos(dadosGlobaisParaGrafico);
    }
}

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        carregarTemaSalvo();
        definirMesAtual();

        roleAtual = (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? 'Admin' : 'Gerente';
        if (roleAtual === 'Gerente') meuGerenteID = identificarGerentePorEmail(user.email);

        document.getElementById('user-display').innerText = user.email;
        document.getElementById('role-badge').innerText = roleAtual;

        if (roleAtual === 'Admin') {
            document.getElementById('area-cadastro').classList.remove('hidden');
            document.getElementById('area-dashboard').classList.remove('hidden'); // Exibe Dashboard
            document.getElementById('btn-relatorio-roque').classList.remove('hidden');
            document.getElementById('btn-relatorio-cesar').classList.remove('hidden');
            document.getElementById('area-agendamento-form').classList.add('hidden');
        } else {
            document.getElementById('area-cadastro').classList.add('hidden');
            document.getElementById('area-dashboard').classList.add('hidden'); // Esconde Dashboard
            document.getElementById('btn-relatorio-roque').classList.add('hidden');
            document.getElementById('btn-relatorio-cesar').classList.add('hidden');
            document.getElementById('area-agendamento-form').classList.remove('hidden');
            selecionarNomeNoAgendamento();
        }
        
        document.getElementById('container-lista-agendamentos').classList.remove('hidden');
        carregarPendencias();
        carregarAgendamentos();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-screen').classList.add('hidden');
    }
});

function identificarGerentePorEmail(emailLogado) {
    for (const [key, dados] of Object.entries(CADASTRO_GERENTES)) {
        if (dados.email.toLowerCase() === emailLogado.toLowerCase()) return key;
    }
    return null;
}

function selecionarNomeNoAgendamento() {
    const select = document.getElementById('ag-gerente');
    if(meuGerenteID) select.value = meuGerenteID;
}

function definirMesAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    document.getElementById('filtro-mes').value = `${ano}-${mes}`;
}

function fazerLogin() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    if(!email || !pass) { alert("Preencha todos os campos"); return; }
    auth.signInWithEmailAndPassword(email, pass).catch(e => document.getElementById('msg-erro').innerText = e.message);
}

function logout() {
    auth.signOut();
    location.reload();
}

function filtrar(tipo, elemento) {
    filtroAtual = tipo;
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    elemento.classList.add('active');
    carregarPendencias();
}

function toggleHistorico(id) {
    const el = document.getElementById(`hist-${id}`);
    if (el) el.classList.toggle('hidden');
}

// ==========================================
// 5. FUNÇÕES DE AGENDAMENTO (CALENDAR)
// ==========================================
function gerarLinkGoogleCalendar(dataStr, horaStr, titulo, descricao) {
    const start = dataStr.replace(/-/g, '') + 'T' + horaStr.replace(':', '') + '00';
    let horaFim = parseInt(horaStr.split(':')[0]) + 1;
    let minFim = horaStr.split(':')[1];
    if (horaFim < 10) horaFim = '0' + horaFim;
    const end = dataStr.replace(/-/g, '') + 'T' + horaFim + minFim + '00';
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", titulo);
    url.searchParams.append("dates", `${start}/${end}`);
    url.searchParams.append("details", descricao);
    url.searchParams.append("sf", "true");
    url.searchParams.append("output", "xml");
    return url.toString();
}

function salvarAgendamento() {
    const gerenteKey = document.getElementById('ag-gerente').value;
    const data = document.getElementById('ag-data').value;
    const hora = document.getElementById('ag-hora').value;
    const motivo = document.getElementById('ag-motivo').value;

    if(!gerenteKey || !data || !hora || !motivo) { alert("Preencha todos os campos."); return; }

    const nomeGerente = CADASTRO_GERENTES[gerenteKey] ? CADASTRO_GERENTES[gerenteKey].nome : "Gerente";

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
        if(snapshot.empty) { div.innerHTML = "<p style='padding:10px; color:#666;'>Nenhum agendamento futuro.</p>"; return; }

        snapshot.forEach(doc => {
            const a = doc.data();
            const id = doc.id;
            let classeTag = "tag-pendente"; let textoTag = "Aguardando";
            if(a.status === 'aceito') { classeTag = "tag-aceito"; textoTag = "Confirmado"; }
            if(a.status === 'recusado') { classeTag = "tag-recusado"; textoTag = "Recusado"; }
            let dataF = a.data.split('-').reverse().join('/');
            const linkCalendar = gerarLinkGoogleCalendar(a.data, a.hora, `Reunião ${a.gerente}`, a.motivo);
            const btnAgenda = `<a href="${linkCalendar}" target="_blank" style="text-decoration:none;"><button style="background:#4285F4; color:white; border:none; border-radius:4px; padding:5px; font-size:0.8em; margin-top:5px; width:100%;">📅 Google Agenda</button></a>`;
            let botoesAdmin = "";
            if (roleAtual === 'Admin' && a.status === 'pendente') {
                botoesAdmin = `<button class="btn-agenda-aceitar" onclick="responderAgendamento('${id}', 'aceito')">✔ Aceitar</button> <button class="btn-agenda-recusar" onclick="responderAgendamento('${id}', 'recusado')">✖ Recusar</button>`;
            }
            const btnExcluir = roleAtual === 'Admin' ? `<button class="btn-excluir" style="border:none; padding:0;" onclick="excluirAgendamento('${id}')">🗑</button>` : "";

            div.innerHTML += `<div class="card-agenda"><span class="tag-agenda ${classeTag}">${textoTag}</span><h4>${a.gerente}</h4><p>${dataF} às ${a.hora}<br>${a.motivo}</p>${btnAgenda}<div style="margin-top:10px; display:flex; justify-content:space-between;"><div>${botoesAdmin}</div>${btnExcluir}</div></div>`;
        });
    });
}

function responderAgendamento(id, resposta) { if(confirm(`Marcar como ${resposta}?`)) db.collection("agendamentos").doc(id).update({ status: resposta }); }
function excluirAgendamento(id) { if(confirm("Excluir?")) db.collection("agendamentos").doc(id).delete(); }

// ==========================================
// 6. FUNÇÕES DE PENDÊNCIAS
// ==========================================

function salvarPendencia() {
    const gerenteKey = document.getElementById('p-responsavel').value;
    const diretoria = document.getElementById('p-diretoria').value;
    const titulo = document.getElementById('p-titulo').value;
    const descricao = document.getElementById('p-descricao').value;
    const cliente = document.getElementById('p-cliente').value;
    const reserva = document.getElementById('p-reserva').value;
    const dataOcorr = document.getElementById('p-data').value;
    const prazo = document.getElementById('p-prazo').value;
    const prioridade = document.getElementById('p-prioridade').value;
    const linkArquivo = document.getElementById('p-link').value;

    if (!titulo || !gerenteKey || !dataOcorr || !diretoria) { alert("Preencha Título, Diretoria, Gerente e Data."); return; }

    const numeroProtocolo = Math.floor(10000 + Math.random() * 90000);
    const dadosGerente = CADASTRO_GERENTES[gerenteKey];
    
    db.collection("pendencias").add({
        numero: numeroProtocolo, titulo: titulo, descricao: descricao, nome: titulo, 
        cliente: cliente, reserva: reserva, data: dataOcorr, prazo: prazo, 
        diretoria: diretoria, prioridade: prioridade, link: linkArquivo,
        notificadoVencimento: false, gerente: dadosGerente.nome, gerenteID: gerenteKey, 
        status: "pendente", dataResolucao: "", 
        historico: [{ data: new Date().toLocaleString('pt-BR'), acao: "Criado", usuario: auth.currentUser.email }],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        const prazoF = prazo ? prazo.split('-').reverse().join('/') : "S/ Prazo";
        const templateParams = { to_email: dadosGerente.email, nome_gerente: dadosGerente.nome, nome_pendencia: `#${numeroProtocolo} - ${titulo}`, cliente: cliente, reserva: reserva };
        emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams);
        if(confirm("Salvo! WhatsApp?")) window.open(`https://wa.me/${dadosGerente.whatsapp}?text=${encodeURIComponent(`Pendência #${numeroProtocolo}\n${titulo}\nPrazo: ${prazoF}`)}`, '_blank');
        document.querySelectorAll('#area-cadastro input, #area-cadastro textarea').forEach(i => i.value = '');
        definirMesAtual();
    }).catch(err => alert("Erro: " + err.message));
}

let dadosGlobaisParaGrafico = []; // Armazena dados para o gráfico

function carregarPendencias() {
    db.collection("pendencias").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        const lista = document.getElementById('lista-pendencias');
        lista.innerHTML = "";
        const mesFiltro = document.getElementById('filtro-mes').value;
        const textoPesquisa = document.getElementById('input-pesquisa').value.toLowerCase(); // PESQUISA

        dadosGlobaisParaGrafico = []; // Reseta dados gráfico
        let itensVisiveis = 0;

        if (snapshot.empty) { lista.innerHTML = "<p style='text-align:center'>Nenhuma pendência.</p>"; return; }

        snapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;
            
            // Dados para o Gráfico (Pega tudo, independente do filtro visual)
            dadosGlobaisParaGrafico.push(p);

            // FILTROS
            if (p.data && !p.data.startsWith(mesFiltro)) return;
            if (filtroAtual === 'abertos' && p.status === 'aprovado') return;
            if (filtroAtual === 'finalizados' && p.status !== 'aprovado') return;
            if (roleAtual === 'Gerente' && p.gerenteID !== meuGerenteID) return;
            
            // PESQUISA (Busca no titulo, cliente ou numero)
            const termoBusca = (p.titulo + " " + p.cliente + " " + p.numero).toLowerCase();
            if (textoPesquisa && !termoBusca.includes(textoPesquisa)) return;

            // RENDERIZAÇÃO
            itensVisiveis++;
            const protocolo = p.numero ? `#${p.numero}` : "S/N";
            const nomeDiretoria = p.diretoria ? ` | Dir. ${p.diretoria}` : "";
            const prioridadeHTML = p.prioridade ? `<span class="tag-prio prio-${p.prioridade}">${p.prioridade}</span>` : "";
            const linkHTML = p.link ? `<a href="${p.link}" target="_blank" style="display:block; margin-top:5px; font-size:0.9em; color:#2563eb;">📎 Ver Arquivo Anexo</a>` : "";

            let htmlVencido = "";
            const hoje = new Date().toISOString().split('T')[0];
            if (p.prazo && p.prazo < hoje && p.status !== 'aprovado') {
                htmlVencido = `<span class="vencido-badge">⚠️ VENCIDO (${p.prazo.split('-').reverse().join('/')})</span>`;
                if (roleAtual === 'Admin' && !p.notificadoVencimento) verificarVencimento(id, p);
            } else if (p.prazo) htmlVencido = `<small style="margin-left:5px;">(Prazo: ${p.prazo.split('-').reverse().join('/')})</small>`;

            let htmlAcao = "";
            let btnExcluir = roleAtual === 'Admin' ? `<button class="btn-excluir" onclick="excluirPendencia('${id}')">🗑</button>` : "";
            let areaHistorico = "";

            if (roleAtual === 'Admin') {
                let logsHtml = (p.historico || []).map(log => `<div class="hist-item"><span class="hist-data">${log.data}</span> ${log.acao} <small>(${log.usuario})</small></div>`).join('');
                areaHistorico = `<button class="btn-historico" onclick="toggleHistorico('${id}')">📜 Histórico</button><div id="hist-${id}" class="historico-box hidden">${logsHtml}</div>`;
            }

            // Botão de Comentário
            const btnComentar = `<button class="btn-comentario" onclick="adicionarComentario('${id}')">💬</button>`;

            if (p.status === 'pendente') {
                htmlAcao = (roleAtual === 'Gerente') ? `<button class="btn-resolver" onclick="mudarStatus('${id}', 'analise')">✅ Resolvi</button>` : `<small>Aguardando...</small>`;
            } else if (p.status === 'analise') {
                htmlAcao = (roleAtual === 'Admin') ? `<button class="btn-aprovar" onclick="mudarStatus('${id}', 'aprovado')">Aprovar</button><button class="btn-recusar" onclick="mudarStatus('${id}', 'pendente')">Recusar</button>` : `<small style='color:orange'>Em análise</small>`;
            } else {
                htmlAcao = "✔ OK";
            }

            lista.innerHTML += `
                <div class="item-pendencia status-${p.status}">
                    <div style="flex:1; margin-right:15px;">
                        <div style="margin-bottom:5px"><span style="color:var(--status-${p.status === 'pendente' ? 'pending' : p.status === 'analise' ? 'analysis' : 'approved'}); font-weight:bold">${p.status.toUpperCase()}</span> <span style="font-size:0.8em; margin-left:10px;">${protocolo}</span> ${prioridadeHTML} ${htmlVencido}</div>
                        <strong style="font-size:1.1em;">${p.titulo || p.nome}</strong>
                        <p>${p.descricao || ""}</p>
                        ${linkHTML}
                        <div style="margin-top:10px; font-size:0.9em;"><span>Cli: ${p.cliente} (Res: ${p.reserva})</span><br><span style="color:var(--color-primary); font-weight:bold">Resp: ${p.gerente}${nomeDiretoria}</span> | <span>${p.data ? p.data.split('-').reverse().join('/') : '-'}</span></div>
                        ${areaHistorico}
                    </div>
                    <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                        <div>${btnComentar} ${htmlAcao}</div>
                        ${btnExcluir}
                    </div>
                </div>`;
        });
        
        if (itensVisiveis === 0) lista.innerHTML = "<p style='text-align:center; margin-top:20px;'>Nenhuma pendência encontrada.</p>";
        
        // Atualiza gráficos apenas se for Admin
        if (roleAtual === 'Admin') atualizarGraficos(dadosGlobaisParaGrafico);
    });
}

// --- GRÁFICOS (CHART.JS) ---
function atualizarGraficos(dados) {
    if (!dados || dados.length === 0) return;

    // Processa dados
    const statusCount = { pendente: 0, analise: 0, aprovado: 0 };
    const diretoriaCount = { Roque: 0, Cesar: 0 };

    dados.forEach(p => {
        if (statusCount[p.status] !== undefined) statusCount[p.status]++;
        if (p.diretoria && diretoriaCount[p.diretoria] !== undefined) diretoriaCount[p.diretoria]++;
    });

    const isDark = document.body.classList.contains('dark-mode');
    const colorText = isDark ? '#e5e7eb' : '#333';

    // Gráfico 1: Status (Doughnut)
    const ctxStatus = document.getElementById('chartStatus').getContext('2d');
    if (chartStatusInstance) chartStatusInstance.destroy();
    chartStatusInstance = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Pendente', 'Em Análise', 'Finalizado'],
            datasets: [{
                data: [statusCount.pendente, statusCount.analise, statusCount.aprovado],
                backgroundColor: ['#ef4444', '#f59e0b', '#22c55e']
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                legend: { position: 'right', labels: { color: colorText } },
                title: { display: true, text: 'Status das Pendências', color: colorText }
            } 
        }
    });

    // Gráfico 2: Diretoria (Bar)
    const ctxDir = document.getElementById('chartDiretoria').getContext('2d');
    if (chartDiretoriaInstance) chartDiretoriaInstance.destroy();
    chartDiretoriaInstance = new Chart(ctxDir, {
        type: 'bar',
        data: {
            labels: ['Roque', 'Cesar'],
            datasets: [{
                label: 'Pendências',
                data: [diretoriaCount.Roque, diretoriaCount.Cesar],
                backgroundColor: ['#16a34a', '#14532d']
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                title: { display: true, text: 'Por Diretoria', color: colorText }
            },
            scales: {
                x: { ticks: { color: colorText } },
                y: { ticks: { color: colorText } }
            }
        }
    });
}

// --- COMENTÁRIO RÁPIDO ---
function adicionarComentario(id) {
    const texto = prompt("Adicionar observação:");
    if (!texto) return;
    const novoLog = { data: new Date().toLocaleString('pt-BR'), acao: `💬 ${texto}`, usuario: auth.currentUser.email };
    db.collection("pendencias").doc(id).update({ historico: firebase.firestore.FieldValue.arrayUnion(novoLog) });
}

// Demais funções mantidas (verificarVencimento, exportarExcel, mudarStatus...)
function verificarVencimento(id, pendencia) {
    if (!pendencia.prazo) return;
    const hoje = new Date().toISOString().split('T')[0];
    if (hoje > pendencia.prazo && pendencia.status !== 'aprovado' && !pendencia.notificadoVencimento) {
        const dadosGerente = CADASTRO_GERENTES[pendencia.gerenteID];
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
            dados.push({ "ID": p.numero||"S/N", "Status": p.status, "Diretoria": p.diretoria, "Título": p.titulo||p.nome, "Prioridade": p.prioridade||"-", "Descrição": p.descricao||"", "Gerente": p.gerente, "Data": p.data, "Prazo": p.prazo, "Cliente": p.cliente, "Link": p.link||"" });
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
                    const d = CADASTRO_GERENTES[p.gerenteID];
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