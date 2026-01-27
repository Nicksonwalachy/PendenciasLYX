// ==========================================
// 1. CONFIGURAÇÃO E DADOS GLOBAIS
// ==========================================
const SLA_CONFIG = { 'Urgente': 1, 'Alta': 2, 'Media': 3, 'Baixa': 7 };
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
const DADOS_ADMIN = { nome: "Admin", email: "nickson.jean21@gmail.com", whatsapp: "5541987625292" };

let notificacoesLidas = false; 

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
let idEmEdicao = null; 
let dadosGlobaisParaGrafico = []; 

// Chart Instances
let chartStatusInstance = null;
let chartDiretoriaInstance = null;
let chartEvolucaoInstance = null;
let chartAgingInstance = null;
let chartParetoInstance = null;
let chartDetalheGerenteInstance = null;

// ==========================================
// 3. NAVEGAÇÃO E INICIALIZAÇÃO
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
            document.getElementById('btn-relatorio-roque').classList.remove('hidden');
            document.getElementById('btn-relatorio-cesar').classList.remove('hidden');
            document.getElementById('btn-metricas-gerentes').classList.remove('hidden');
            document.getElementById('btn-equipe').classList.remove('hidden'); 
            document.getElementById('area-agendamento-form').classList.add('hidden');
        } else {
            meuGerenteID = identificarGerentePorEmail(user.email);
            document.getElementById('area-cadastro').classList.add('hidden');
            document.getElementById('btn-relatorio-roque').classList.add('hidden');
            document.getElementById('btn-relatorio-cesar').classList.add('hidden');
            document.getElementById('btn-metricas-gerentes').classList.remove('hidden'); 
            document.getElementById('btn-equipe').classList.add('hidden');
            document.getElementById('area-agendamento-form').classList.remove('hidden');
            preencherSelectGerenteNoAgendamento();
        }
        
        navegarPara('operacional');
        carregarPendencias();
        carregarAgendamentos();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-screen').classList.add('hidden');
    }
});

function navegarPara(pagina) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${pagina}`).classList.add('active');
    document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
    document.getElementById(`page-${pagina}`).classList.remove('hidden');

    if (pagina === 'dashboard') {
        atualizarGraficos(dadosGlobaisParaGrafico);
    }
}

function toggleNotificacoes() {
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) {
        notificacoesLidas = true; 
        document.querySelectorAll('#notif-badge, #notif-badge-mobile').forEach(b => {
            b.classList.add('hidden');
            b.innerText = '0';
        });
    }
}

// ==========================================
// 4. FUNÇÕES DE PENDÊNCIAS
// ==========================================

function calcularDataLimite(dataInicioStr, diasSla) {
    let dataAtual = new Date(dataInicioStr + "T12:00:00"); 
    let diasContados = 0;
    while (diasContados < diasSla) {
        dataAtual.setDate(dataAtual.getDate() + 1);
        if (dataAtual.getDay() !== 0) diasContados++; 
    }
    return dataAtual;
}

function salvarPendencia() {
    const btnSalvar = document.getElementById('btn-salvar');
    btnSalvar.innerText = "Salvando..."; btnSalvar.disabled = true;

    const gerenteKey = document.getElementById('p-responsavel').value;
    const titulo = document.getElementById('p-titulo').value;
    const prioridade = document.getElementById('p-prioridade').value;
    const valor = parseFloat(document.getElementById('p-valor').value) || 0; 
    let dataOcorr = document.getElementById('p-data').value || new Date().toISOString().split('T')[0];
    
    if (!titulo || !gerenteKey) { 
        alert("Preencha Título e Responsável."); 
        btnSalvar.innerText = "Cadastrar"; btnSalvar.disabled = false; return; 
    }

    const diasPrazo = SLA_CONFIG[prioridade] || 3; 
    const prazoCalculado = calcularDataLimite(dataOcorr, diasPrazo).toISOString().split('T')[0];
    const nomeGerente = LISTA_USUARIOS[gerenteKey] ? LISTA_USUARIOS[gerenteKey].nome : "Gerente";
    const numero = Math.floor(10000 + Math.random() * 90000);

    const novaPendencia = {
        numero: numero, titulo: titulo,
        descricao: document.getElementById('p-descricao').value,
        cliente: document.getElementById('p-cliente').value,
        reserva: document.getElementById('p-reserva').value,
        valor: valor,
        tipo: document.getElementById('p-tipo').value,
        prioridade: prioridade, data: dataOcorr, prazo: prazoCalculado,
        diretoria: document.getElementById('p-diretoria').value,
        gerente: nomeGerente, gerenteID: gerenteKey, status: "pendente", dataResolucao: "",
        historico: [{ data: new Date().toLocaleString('pt-BR'), acao: "Criado", usuario: auth.currentUser.email }],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("pendencias").add(novaPendencia).then(() => {
        const dGerente = LISTA_USUARIOS[gerenteKey];
        if(dGerente) {
             const templateParams = { to_email: dGerente.email, nome_gerente: dGerente.nome, nome_pendencia: `#${numero} - ${titulo}`, cliente: novaPendencia.cliente };
             emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams);
             if(confirm(`Salvo! Enviar WhatsApp para ${dGerente.nome}?`)) {
                 window.open(`https://wa.me/${dGerente.whatsapp}?text=${encodeURIComponent(`Nova Pendência #${numero}: ${titulo}`)}`, '_blank');
             }
        } else { alert("Salvo com sucesso!"); }

        limparFormularioCadastro();
        btnSalvar.innerText = "Cadastrar"; btnSalvar.disabled = false;
        if(viewMode === 'clientes') carregarPendencias();
    }).catch(err => { alert("Erro: " + err.message); btnSalvar.disabled = false; });
}

function limparFormularioCadastro() {
    document.querySelectorAll('#area-cadastro input, #area-cadastro textarea').forEach(i => i.value = '');
    document.getElementById('p-prioridade').value = 'Media';
}

function carregarPendencias() {
    const mesFiltro = document.getElementById('filtro-mes').value;
    const textoPesquisa = document.getElementById('input-pesquisa').value.toLowerCase();

    db.collection("pendencias").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        let novasPendencias = [];
        let notifCount = 0;
        const listaNotif = document.getElementById('lista-notificacoes');
        listaNotif.innerHTML = "";
        
        dadosGlobaisParaGrafico = [];

        snapshot.forEach((doc) => {
            const p = doc.data(); p.id = doc.id;

            if (roleAtual === 'Gerente' && p.gerenteID !== meuGerenteID) return;

            dadosGlobaisParaGrafico.push(p);

            if (p.data && !p.data.startsWith(mesFiltro)) return;
            if (filtroAtual === 'abertos' && p.status === 'aprovado') return;
            if (filtroAtual === 'finalizados' && p.status !== 'aprovado') return;
            
            const termo = (p.titulo + " " + p.cliente + " " + p.numero).toLowerCase();
            if (textoPesquisa && !termo.includes(textoPesquisa)) return;

            novasPendencias.push(p);

            if ((roleAtual === 'Gerente' && p.status === 'pendente' && p.dataResolucao === "") || 
                (roleAtual === 'Admin' && p.status === 'analise')) {
                notifCount++;
                listaNotif.innerHTML += `<li>Pendência #${p.numero} requer atenção.</li>`;
            }
        });

        if (notifCount === 0) listaNotif.innerHTML = "<li style='padding:10px; color:#666'>Nenhuma notificação nova.</li>";

        document.querySelectorAll('#notif-badge, #notif-badge-mobile').forEach(b => {
            if (notificacoesLidas) { b.classList.add('hidden'); } 
            else { b.innerText = notifCount; b.classList.toggle('hidden', notifCount === 0); }
        });

        renderizarLista(novasPendencias);
        renderizarKanban(novasPendencias);
        renderizarAgrupadoPorCliente(novasPendencias); 
        calcularSLAStatus(dadosGlobaisParaGrafico);
    });
}

function mudarModoVisualizacao(modo, btn) {
    viewMode = modo;
    document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('lista-pendencias').classList.add('hidden');
    document.getElementById('kanban-pendencias').classList.add('hidden');
    document.getElementById('lista-agrupada').classList.add('hidden');

    if (modo === 'lista') document.getElementById('lista-pendencias').classList.remove('hidden');
    else if (modo === 'kanban') document.getElementById('kanban-pendencias').classList.remove('hidden');
    else if (modo === 'clientes') {
        document.getElementById('lista-agrupada').classList.remove('hidden');
        renderizarAgrupadoPorCliente(dadosGlobaisParaGrafico.filter(p => {
             const mesFiltro = document.getElementById('filtro-mes').value;
             if (p.data && !p.data.startsWith(mesFiltro)) return false;
             if (filtroAtual === 'abertos' && p.status === 'aprovado') return false;
             if (filtroAtual === 'finalizados' && p.status !== 'aprovado') return false;
             return true; 
        }));
    }
}

// ==========================================
// 5. RENDERIZAÇÃO
// ==========================================

function renderizarLista(lista) {
    const div = document.getElementById('lista-pendencias');
    div.innerHTML = "";
    if (lista.length === 0) { div.innerHTML = "<p style='text-align:center; padding:20px;'>Nada encontrado.</p>"; return; }
    lista.forEach(p => div.innerHTML += criarHTMLCard(p));
}

function renderizarKanban(lista) {
    document.getElementById('col-pendente').querySelector('.kanban-items').innerHTML = "";
    document.getElementById('col-analise').querySelector('.kanban-items').innerHTML = "";
    document.getElementById('col-aprovado').querySelector('.kanban-items').innerHTML = "";
    lista.forEach(p => {
        let colId = p.status === 'pendente' ? 'col-pendente' : p.status === 'analise' ? 'col-analise' : 'col-aprovado';
        document.getElementById(colId).querySelector('.kanban-items').innerHTML += criarHTMLCard(p, true);
    });
}

function renderizarAgrupadoPorCliente(pendencias) {
    const container = document.getElementById('lista-agrupada');
    container.innerHTML = "";
    
    const grupos = {};
    pendencias.forEach(p => {
        const cliente = p.cliente || "Sem Cliente Identificado";
        if (!grupos[cliente]) grupos[cliente] = [];
        grupos[cliente].push(p);
    });

    if (Object.keys(grupos).length === 0) { container.innerHTML = "<p style='text-align:center'>Nenhum registro.</p>"; return; }

    Object.keys(grupos).sort().forEach(cliente => {
        const itens = grupos[cliente];
        const qtd = itens.length;
        const temAtraso = itens.some(i => i.prazo < new Date().toISOString().split('T')[0] && i.status !== 'aprovado');
        const alerta = temAtraso ? '<span style="color:red; font-size:0.8em; margin-left:10px;">⚠️ Atrasado</span>' : '';

        let htmlItens = itens.map(p => {
            const icon = p.status === 'aprovado' ? '✅' : p.status === 'analise' ? '⏳' : '🔴';
            const btnAcao = (roleAtual === 'Admin') 
                ? `<button class="btn-outline" style="font-size:0.8em; padding:2px 8px;" onclick="abrirModalEdicao('${p.id}')">✏️ Editar</button>` 
                : (p.status === 'pendente' ? `<button class="btn-secondary" style="font-size:0.7em; padding:2px 5px;" onclick="mudarStatus('${p.id}', 'analise')">Resolver</button>` : '');
            
            return `
            <div class="item-mini">
                <div style="flex:1">
                    <div style="font-size:0.8em; color:var(--text-secondary);">${icon} #${p.numero} • ${p.tipo}</div>
                    <strong style="font-size:0.95em;">${p.titulo}</strong>
                </div>
                <div>${btnAcao}</div>
            </div>`;
        }).join('');

        const card = `
            <div class="grupo-cliente">
                <div class="grupo-header" onclick="toggleAccordion(this)">
                    <div>
                        <strong>${cliente}</strong>
                        <span style="background:var(--bg-body); padding:2px 8px; border-radius:10px; font-size:0.75em; margin-left:8px; border:1px solid var(--border-color);">${qtd} pendências</span>
                        ${alerta}
                    </div>
                    <div style="font-size:0.8em; color:var(--text-secondary);">▼</div>
                </div>
                <div class="grupo-body">
                    ${htmlItens}
                    ${roleAtual === 'Admin' ? `<div style="padding:10px; text-align:center; background:var(--bg-secondary);"><button class="btn-outline" style="width:100%; font-size:0.8em; border-style:dashed;" onclick="preencherNovoParaCliente('${cliente}')">+ Nova Pendência</button></div>` : ''}
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

function toggleAccordion(header) {
    const body = header.nextElementSibling;
    body.classList.toggle('aberto');
}

function preencherNovoParaCliente(cliente) {
    if (roleAtual !== 'Admin') return alert("Apenas Admin cadastra.");
    document.getElementById('p-cliente').value = cliente;
    navegarPara('operacional'); 
    document.getElementById('area-cadastro').classList.remove('hidden'); 
    document.getElementById('area-cadastro').scrollIntoView({behavior: "smooth"});
    document.getElementById('p-titulo').focus();
}

function criarHTMLCard(p, mini = false) {
    const prio = p.prioridade || "Media";
    const slaBadge = (p.prazo < new Date().toISOString().split('T')[0] && p.status !== 'aprovado') 
        ? `<span style="color:red; font-weight:bold; font-size:0.8em;">ATRASADO</span>` 
        : ``;
    
    let classePrio = `prio-${prio}`;
    
    // --- LÓGICA DE BOTÕES CORRIGIDA PARA O REQUISITO ---
    let botoes = "";
    const isOwner = (p.gerenteID === meuGerenteID);
    
    // 1. Botão EDITAR: Apenas ADMIN pode ver, independente do status.
    const btnEditar = (roleAtual === 'Admin') 
        ? `<button class="btn-outline" onclick="abrirModalEdicao('${p.id}')">✏️</button>` 
        : ""; 

    // 2. Montagem dos Botões
    if (p.status === 'pendente' && roleAtual === 'Gerente') {
        // Gerente só pode resolver, NUNCA editar
        botoes = `<button class="btn-resolver" onclick="mudarStatus('${p.id}', 'analise')">✅ Resolvi</button>`;
    } 
    else if (p.status === 'analise' && roleAtual === 'Admin') {
        botoes = `${btnEditar} <button class="btn-aprovar" onclick="mudarStatus('${p.id}', 'aprovado')">OK</button> <button class="btn-recusar" onclick="mudarStatus('${p.id}', 'pendente')">Recusar</button>`;
    } 
    else if (roleAtual === 'Admin') {
        // Admin pode excluir e editar
        botoes = `${btnEditar} <button class="btn-excluir" onclick="excluirPendencia('${p.id}')">🗑</button>`;
    }
    
    // Formatação do Valor
    const valorF = p.valor ? `R$ ${parseFloat(p.valor).toFixed(2)}` : "";

    if (mini) { 
        return `<div class="kanban-item" draggable="true" ondragstart="drag(event)" data-id="${p.id}" data-status="${p.status}">
            <strong>${p.titulo}</strong><br>
            <small style="color:var(--text-secondary)">${p.cliente}</small>
            <div style="font-weight:bold; color:#16a34a; font-size:0.85em;">${valorF}</div>
            <div style="margin-top:5px; display:flex; justify-content:space-between; align-items:center;">
                <span class="tag-prio ${classePrio}">${prio}</span>
                ${slaBadge}
            </div>
            <div style="margin-top:8px; text-align:right;">${botoes}</div>
        </div>`;
    } else { 
        const logsHtml = (p.historico && p.historico.length > 0) 
            ? p.historico.map(log => `<div class="hist-item"><strong>${log.usuario.split('@')[0]}</strong> <small>(${log.data})</small><br>${log.acao}</div>`).join('') 
            : "<div class='hist-item'>Sem histórico.</div>";

        const areaHistorico = `
            <button id="btn-hist-${p.id}" class="btn-outline" style="margin-top:10px; font-size:0.8em; width:100%;" onclick="toggleHistorico('${p.id}')">📜 Ver Histórico</button>
            <div id="hist-${p.id}" class="historico-box hidden">${logsHtml}</div>
        `;

        return `
        <div class="item-pendencia status-${p.status}">
            <div style="flex:1;">
                <div style="font-size:0.8em; text-transform:uppercase; color:var(--text-secondary); margin-bottom:5px;">
                    ${p.status} • #${p.numero} • <span class="tag-prio ${classePrio}">${prio}</span> ${slaBadge}
                </div>
                <h3>${p.titulo}</h3>
                <p style="color:var(--text-secondary); white-space:pre-wrap;">${p.descricao}</p>
                <div style="font-size:0.85em; margin-top:10px; color:var(--text-primary);">
                    <strong>Cliente:</strong> ${p.cliente} | <strong>Prazo:</strong> ${p.prazo ? p.prazo.split('-').reverse().join('/') : '-'} | <strong>Valor:</strong> ${valorF}
                </div>
                ${areaHistorico}
            </div>
            <div style="display:flex; flex-direction:column; gap:5px; margin-left:15px;">
                ${botoes}
            </div>
        </div>`;
    }
}

function toggleHistorico(id) {
    const box = document.getElementById(`hist-${id}`);
    box.classList.toggle('hidden');
}

// ==========================================
// 6. UTILITÁRIOS
// ==========================================
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.getAttribute('data-id')); ev.dataTransfer.setData("oldStatus", ev.target.getAttribute('data-status')); }
function drop(ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text");
    const oldStatus = ev.dataTransfer.getData("oldStatus");
    const col = ev.target.closest('.kanban-col');
    if (!col) return;
    let newStatus = col.id === 'col-pendente' ? 'pendente' : col.id === 'col-analise' ? 'analise' : 'aprovado';
    if (newStatus === oldStatus) return;
    if (roleAtual === 'Gerente' && (oldStatus !== 'pendente' || newStatus !== 'analise')) return alert("Ação não permitida.");
    mudarStatus(id, newStatus);
}

function mudarStatus(id, st) {
    let motivo = "";
    if (st === 'pendente') { motivo = prompt("Motivo da devolução:"); if (!motivo) return; }
    else if (st === 'analise' && !confirm("Confirma resolução?")) return;
    else if (st === 'aprovado' && !confirm("Aprovar e Finalizar?")) return;

    let updateData = { 
        status: st, 
        historico: firebase.firestore.FieldValue.arrayUnion({ data: new Date().toLocaleString(), acao: `Status: ${st} ${motivo ? '- '+motivo : ''}`, usuario: auth.currentUser.email }) 
    };
    if(st === 'analise' || st === 'aprovado') updateData.dataResolucao = new Date().toISOString().split('T')[0];
    if(st === 'pendente') updateData.dataResolucao = "";

    db.collection("pendencias").doc(id).update(updateData);
}

function excluirPendencia(id) { if(confirm("Tem certeza?")) db.collection("pendencias").doc(id).delete(); }

// ==========================================
// 7. DASHBOARDS AVANÇADOS (BI COMPLETO)
// ==========================================

function atualizarGraficos(dados) {
    // 1. Gráficos Básicos (Status e Diretoria)
    let statusC = { pendente: 0, analise: 0, aprovado: 0 };
    let dirC = { Roque: 0, Cesar: 0 };
    
    dados.forEach(p => {
        statusC[p.status] = (statusC[p.status]||0) + 1;
        if (p.diretoria && dirC[p.diretoria] !== undefined) dirC[p.diretoria]++;
    });

    const isDark = document.body.classList.contains('dark-mode');
    const colorText = isDark ? '#e5e7eb' : '#333';

    if (chartStatusInstance) chartStatusInstance.destroy();
    chartStatusInstance = new Chart(document.getElementById('chartStatus').getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['Pendente', 'Análise', 'OK'], datasets: [{ data: [statusC.pendente, statusC.analise, statusC.aprovado], backgroundColor: ['#ef4444', '#f59e0b', '#10b981'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: colorText } } } }
    });

    if (chartDiretoriaInstance) chartDiretoriaInstance.destroy();
    chartDiretoriaInstance = new Chart(document.getElementById('chartDiretoria').getContext('2d'), {
        type: 'bar',
        data: { labels: ['Roque', 'Cesar'], datasets: [{ label: 'Qtd', data: [dirC.Roque, dirC.Cesar], backgroundColor: ['#16a34a', '#14532d'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: colorText } }, y: { ticks: { color: colorText } } } }
    });

    // 2. Chamar Dashboards Avançados
    calcularBIAvancado(dados, colorText);
}

function calcularBIAvancado(dados, colorText) {
    // A. Valor Travado (VGV) & Taxa de Retrabalho Global
    let vgvTravado = 0;
    let totalRetrabalho = 0;
    let totalTarefas = dados.length;

    dados.forEach(p => {
        // Soma VGV apenas de abertos
        if (p.status !== 'aprovado') {
            vgvTravado += parseFloat(p.valor || 0);
        }
        // Retrabalho: Verifica se voltou para pendente
        if (p.historico && p.historico.some(h => h.acao.includes('Status: pendente') && !h.acao.includes('Criado'))) {
            totalRetrabalho++;
        }
    });

    document.getElementById('kpi-valor-travado').innerText = `R$ ${vgvTravado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    const taxaRetrabalho = totalTarefas > 0 ? ((totalRetrabalho / totalTarefas) * 100).toFixed(1) : 0;
    document.getElementById('kpi-retrabalho').innerText = `${taxaRetrabalho}%`;

    // B. Evolução (Linha) - Criados vs Resolvidos por mês
    const meses = {};
    dados.forEach(p => {
        const mesCriacao = p.data.substring(0, 7); // YYYY-MM
        if (!meses[mesCriacao]) meses[mesCriacao] = { criados: 0, resolvidos: 0 };
        meses[mesCriacao].criados++;

        if (p.status === 'aprovado' && p.dataResolucao) {
            const mesRes = p.dataResolucao.substring(0, 7);
            if (!meses[mesRes]) meses[mesRes] = { criados: 0, resolvidos: 0 };
            meses[mesRes].resolvidos++;
        }
    });
    const labelsEvolucao = Object.keys(meses).sort();
    
    if (chartEvolucaoInstance) chartEvolucaoInstance.destroy();
    chartEvolucaoInstance = new Chart(document.getElementById('chartEvolucao').getContext('2d'), {
        type: 'line',
        data: {
            labels: labelsEvolucao,
            datasets: [
                { label: 'Novas', data: labelsEvolucao.map(m => meses[m].criados), borderColor: '#ef4444', tension: 0.3 },
                { label: 'Resolvidas', data: labelsEvolucao.map(m => meses[m].resolvidos), borderColor: '#10b981', tension: 0.3 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: colorText } }, y: { ticks: { color: colorText } } } }
    });

    // C. Aging (Envelhecimento de Pendências Abertas)
    let aging = { '1-3 Dias': 0, '4-7 Dias': 0, '+7 Dias': 0, '+15 Dias': 0 };
    const hoje = new Date();
    dados.filter(p => p.status !== 'aprovado').forEach(p => {
        const dataP = new Date(p.data);
        const diffTime = Math.abs(hoje - dataP);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3) aging['1-3 Dias']++;
        else if (diffDays <= 7) aging['4-7 Dias']++;
        else if (diffDays <= 15) aging['+7 Dias']++;
        else aging['+15 Dias']++;
    });

    if (chartAgingInstance) chartAgingInstance.destroy();
    chartAgingInstance = new Chart(document.getElementById('chartAging').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(aging), datasets: [{ label: 'Qtd', data: Object.values(aging), backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'] }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: colorText } }, y: { ticks: { color: colorText } } } }
    });

    // D. Pareto (Causas de Atraso por Tipo)
    // Consideramos "Problema" se estiver atrasado ou rejeitado
    let paretoData = {};
    dados.forEach(p => {
        const isLate = p.prazo < new Date().toISOString().split('T')[0] && p.status !== 'aprovado';
        if (isLate) {
            paretoData[p.tipo] = (paretoData[p.tipo] || 0) + 1;
        }
    });
    // Ordenar
    const sortedPareto = Object.entries(paretoData).sort((a,b) => b[1] - a[1]);
    
    if (chartParetoInstance) chartParetoInstance.destroy();
    chartParetoInstance = new Chart(document.getElementById('chartPareto').getContext('2d'), {
        type: 'bar',
        data: { labels: sortedPareto.map(i => i[0]), datasets: [{ label: 'Atrasos', data: sortedPareto.map(i => i[1]), backgroundColor: '#6366f1' }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: colorText } }, y: { ticks: { color: colorText } } } }
    });
}

function calcularSLAStatus(dados) {
    const atrasados = dados.filter(p => p.prazo < new Date().toISOString().split('T')[0] && p.status !== 'aprovado').length;
    document.getElementById('sla-stats').innerHTML = atrasados > 0 
        ? `<h3 style="color:red">⚠️ ${atrasados} pendências atrasadas</h3>` 
        : `<h3 style="color:green">✅ Tudo no prazo</h3>`;
}

function exportarExcel(filtroDiretoria) {
    if (roleAtual !== 'Admin') {
        alert("Acesso negado. Apenas administradores podem exportar relatórios.");
        return;
    }
    const dados = dadosGlobaisParaGrafico
        .filter(p => p.diretoria === filtroDiretoria && p.status !== 'aprovado')
        .map(p => ({ 
            "ID": p.numero, "Título": p.titulo, "Cliente": p.cliente, 
            "Valor": p.valor || 0, "Status": p.status, "Prazo": p.prazo 
        }));
        
    if (dados.length === 0) { alert(`Nada encontrado para ${filtroDiretoria}.`); return; }
    const ws = XLSX.utils.json_to_sheet(dados); const wb = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(wb, ws, `Pendencias`); 
    XLSX.writeFile(wb, `Relatorio_${filtroDiretoria}.xlsx`);
}

// METRICAS & DRILL DOWN
function normalizarData(str) { if(!str) return null; let p = str.includes('/') ? str.split('/').reverse().join('-') : str; return new Date(p + "T12:00:00"); }
function calcularDiasUteis(d1, d2) {
    let count = 0; let curr = new Date(d1);
    while (curr < d2) { curr.setDate(curr.getDate()+1); if (curr.getDay()!==0) count++; }
    return count || 1;
}

function abrirModalMetricas() {
    document.getElementById('modal-metricas').classList.remove('hidden');
    calcularMetricasGerentes();
}
function fecharModalMetricas() { document.getElementById('modal-metricas').classList.add('hidden'); }

function calcularMetricasGerentes() {
    const metricas = {};
    const hoje = new Date().toISOString().split('T')[0];

    dadosGlobaisParaGrafico.forEach(p => {
        const nome = p.gerente || "Outro";
        if(!metricas[nome]) metricas[nome] = { onTime:0, late:0, totalResolved:0, historyLate:0 };
        
        if (p.status !== 'aprovado') { 
            if (p.prazo < hoje) metricas[nome].late++; 
            else metricas[nome].onTime++; 
        } else {
            metricas[nome].totalResolved++;
            if(p.dataResolucao > p.prazo) metricas[nome].historyLate++;
        }
    });
    
    const tbody = document.getElementById('tabela-metricas-body'); tbody.innerHTML = "";
    Object.keys(metricas).forEach(g => {
        const m = metricas[g];
        const risk = m.totalResolved > 0 ? ((m.historyLate/m.totalResolved)*100).toFixed(1) : 0;
        let color = "green"; if(risk > 20) color = "orange"; if(risk > 50) color = "red";

        tbody.innerHTML += `
        <tr>
            <td><button class="btn-link-gerente" onclick="abrirDetalhesGerente('${g}')">${g} 🔗</button></td>
            <td class="text-center"><span class="badge-table badge-success">${m.onTime}</span></td>
            <td class="text-center"><span class="badge-table badge-danger">${m.late}</span></td>
            <td class="text-center">${m.totalResolved}</td>
            <td class="text-center" style="color:${color}; font-weight:bold;">${risk}%</td>
        </tr>`;
    });
}

function abrirDetalhesGerente(nome) {
    document.getElementById('modal-detalhe-gerente').classList.remove('hidden');
    document.getElementById('titulo-detalhe-gerente').innerText = `Detalhes: ${nome}`;
    
    const tempos = {};
    dadosGlobaisParaGrafico.filter(p => p.gerente === nome && p.status === 'aprovado').forEach(p => {
        const dias = calcularDiasUteis(normalizarData(p.data), normalizarData(p.dataResolucao));
        if(!tempos[p.tipo]) tempos[p.tipo] = { total:0, qtd:0 };
        tempos[p.tipo].total += dias; tempos[p.tipo].qtd++;
    });
    
    const labels = Object.keys(tempos);
    const ctx = document.getElementById('chartDetalheGerente').getContext('2d');
    if (chartDetalheGerenteInstance) chartDetalheGerenteInstance.destroy();
    
    if(labels.length === 0) return; 
    
    const data = labels.map(l => (tempos[l].total/tempos[l].qtd).toFixed(1));
    const colorText = document.body.classList.contains('dark-mode') ? '#fff' : '#333';
    
    chartDetalheGerenteInstance = new Chart(ctx, {
        type: 'bar', 
        data: { labels, datasets: [{ label: 'Média Dias Úteis', data, backgroundColor: '#3b82f6' }] },
        options: { 
            responsive:true, 
            maintainAspectRatio:false,
            scales: { y: { ticks: { color: colorText } }, x: { ticks: { color: colorText } } },
            plugins: { legend: { display: false } }
        }
    });
}
function fecharModalDetalheGerente() { document.getElementById('modal-detalhe-gerente').classList.add('hidden'); }

// ==========================================
// 8. AGENDA & USUÁRIOS
// ==========================================
async function carregarUsuariosDoBanco() {
    const snap = await db.collection('usuarios').get();
    if (snap.empty) { GERENTES_PADRAO.forEach(g => db.collection('usuarios').doc(g.id).set(g)); return; }
    LISTA_USUARIOS = {};
    const sel = document.getElementById('p-responsavel'); sel.innerHTML = '<option disabled selected>Selecione...</option>';
    const selAg = document.getElementById('ag-gerente'); selAg.innerHTML = '<option disabled selected>Eu sou...</option>';
    
    snap.forEach(doc => {
        LISTA_USUARIOS[doc.id] = doc.data();
        sel.add(new Option(doc.data().nome, doc.id));
        selAg.add(new Option(doc.data().nome, doc.id));
    });
}
function identificarGerentePorEmail(email) {
    for (const [id, u] of Object.entries(LISTA_USUARIOS)) if (u.email.toLowerCase() === email.toLowerCase()) return id;
    return null;
}
function preencherSelectGerenteNoAgendamento() { if(meuGerenteID) document.getElementById('ag-gerente').value = meuGerenteID; }

function salvarAgendamento() {
    const gID = document.getElementById('ag-gerente').value;
    if(!gID) return alert("Identifique-se.");

    db.collection("agendamentos").add({
        gerenteID: gID,
        gerente: LISTA_USUARIOS[gID] ? LISTA_USUARIOS[gID].nome : "Gerente",
        data: document.getElementById('ag-data').value,
        hora: document.getElementById('ag-hora').value,
        motivo: document.getElementById('ag-motivo').value,
        status: 'pendente', timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Agendamento solicitado!");
        const params = { to_email: DADOS_ADMIN.email, nome_gerente: "AGENDA", nome_pendencia: "Solicitação Reunião", cliente: "Verifique o sistema" };
        emailjs.send('service_ywnbbqr', 'template_7ago0v7', params);
    });
}

function carregarAgendamentos() {
    db.collection("agendamentos").orderBy("data").onSnapshot(snap => {
        const div = document.getElementById('lista-agendamentos'); 
        div.innerHTML = "";
        
        if(snap.empty) { div.innerHTML = "<p>Nenhum agendamento.</p>"; return; }

        snap.forEach(doc => {
            const a = doc.data(); const id = doc.id;
            
            if (roleAtual === 'Gerente' && a.gerenteID !== meuGerenteID) return;

            let classeTag = "tag-pendente"; let textoTag = "Aguardando";
            if(a.status === 'aceito') { classeTag = "tag-aceito"; textoTag = "Confirmado"; }
            if(a.status === 'recusado') { classeTag = "tag-recusado"; textoTag = "Recusado"; }
            
            let dataF = a.data ? a.data.split('-').reverse().join('/') : '-';
            const linkCalendar = gerarLinkGoogleCalendar(a.data, a.hora, `Reunião ${a.gerente}`, a.motivo);
            const btnAgenda = `<a href="${linkCalendar}" target="_blank" style="text-decoration:none;"><button style="background:#4285F4; color:white; border:none; border-radius:4px; padding:5px; font-size:0.8em; margin-top:5px; width:100%;">📅 Google Agenda</button></a>`;
            
            let botoesAdmin = "";
            if (roleAtual === 'Admin' && a.status === 'pendente') {
                botoesAdmin = `<div style="margin-top:10px;"><button class="btn-agenda-aceitar" onclick="responderAgendamento('${id}', 'aceito')">✔ Aceitar</button> <button class="btn-agenda-recusar" onclick="responderAgendamento('${id}', 'recusado')">✖ Recusar</button></div>`;
            }
            
            let btnExcluir = "";
            if (roleAtual === 'Admin') btnExcluir = `<button class="btn-excluir" style="position:absolute; top:10px; right:10px; border:none;" onclick="excluirAgendamento('${id}')">🗑</button>`;
            
            div.innerHTML += `
            <div class="card-agenda">
                <span class="tag-agenda ${classeTag}">${textoTag}</span>
                <h4>${a.gerente}</h4>
                <p style="margin:5px 0;">${dataF} às ${a.hora}<br>${a.motivo}</p>
                ${btnAgenda}
                ${botoesAdmin}
                ${btnExcluir}
            </div>`;
        });
    });
}

function responderAgendamento(id, resposta) { 
    if(confirm(`Marcar como ${resposta}?`)) db.collection("agendamentos").doc(id).update({ status: resposta }); 
}

function excluirAgendamento(id) { 
    if(confirm("Excluir agendamento?")) db.collection("agendamentos").doc(id).delete(); 
}

function gerarLinkGoogleCalendar(dataStr, horaStr, titulo, descricao) {
    if(!dataStr || !horaStr) return "#";
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

// ==========================================
// 9. MODAIS & SISTEMA
// ==========================================
function abrirModalEdicao(id) {
    // 1. Verificação de Segurança (Apenas Admin pode abrir)
    if (roleAtual !== 'Admin') return alert("Apenas Administradores podem editar pendências.");

    idEmEdicao = id;
    const p = dadosGlobaisParaGrafico.find(x => x.id === id);
    if(p) {
        document.getElementById('edit-titulo').value = p.titulo;
        document.getElementById('edit-cliente').value = p.cliente;
        document.getElementById('edit-reserva').value = p.reserva;
        document.getElementById('edit-valor').value = p.valor || 0; 
        document.getElementById('edit-tipo').value = p.tipo;
        document.getElementById('edit-prioridade').value = p.prioridade;
        document.getElementById('edit-data').value = p.data;
        document.getElementById('edit-prazo').value = p.prazo;
        document.getElementById('edit-diretoria').value = p.diretoria;
        document.getElementById('edit-descricao').value = p.descricao;
        document.getElementById('modal-editar').classList.remove('hidden');
    }
}
function fecharModalEdicao() { document.getElementById('modal-editar').classList.add('hidden'); }
function salvarEdicao() {
    // 1. Verificação de Segurança
    if (roleAtual !== 'Admin') return alert("Acesso negado.");

    db.collection("pendencias").doc(idEmEdicao).update({
        titulo: document.getElementById('edit-titulo').value,
        cliente: document.getElementById('edit-cliente').value,
        reserva: document.getElementById('edit-reserva').value,
        valor: parseFloat(document.getElementById('edit-valor').value) || 0,
        tipo: document.getElementById('edit-tipo').value,
        prioridade: document.getElementById('edit-prioridade').value,
        data: document.getElementById('edit-data').value,
        prazo: document.getElementById('edit-prazo').value,
        diretoria: document.getElementById('edit-diretoria').value,
        descricao: document.getElementById('edit-descricao').value,
        historico: firebase.firestore.FieldValue.arrayUnion({ data: new Date().toLocaleString(), acao: "Editado", usuario: auth.currentUser.email })
    }).then(() => fecharModalEdicao());
}

function abrirModalEquipe() { document.getElementById('modal-equipe').classList.remove('hidden'); listarUsuariosModal(); }
function fecharModalEquipe() { document.getElementById('modal-equipe').classList.add('hidden'); }
function listarUsuariosModal() {
    const ul = document.getElementById('lista-usuarios-db'); ul.innerHTML = "";
    Object.entries(LISTA_USUARIOS).forEach(([id, u]) => ul.innerHTML += `<li>${u.nome} <button onclick="removerUsuario('${id}')" style="color:red;border:none;background:none;cursor:pointer;">X</button></li>`);
}
function adicionarUsuario() {
    db.collection('usuarios').add({ nome: document.getElementById('novo-nome').value, email: document.getElementById('novo-email').value, whatsapp: document.getElementById('novo-zap').value })
    .then(() => { carregarUsuariosDoBanco(); listarUsuariosModal(); });
}
function removerUsuario(id) { db.collection('usuarios').doc(id).delete().then(() => { carregarUsuariosDoBanco(); listarUsuariosModal(); }); }

function fazerLogin() { auth.signInWithEmailAndPassword(document.getElementById('email').value, document.getElementById('password').value).catch(e => document.getElementById('msg-erro').innerText = e.message); }
function logout() { auth.signOut().then(() => location.reload()); }
function filtrar(f, btn) { filtroAtual = f; document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active')); btn.classList.add('active'); carregarPendencias(); }
function definirMesAtual() { document.getElementById('filtro-mes').value = new Date().toISOString().slice(0, 7); }
function carregarTemaSalvo() { if(localStorage.getItem('tema') === 'dark') alternarTema(); }
function alternarTema() { document.body.classList.toggle('dark-mode'); localStorage.setItem('tema', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); atualizarGraficos(dadosGlobaisParaGrafico); }