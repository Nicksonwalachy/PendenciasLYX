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
    "gerente9": { nome: "Nickson", email: "nickson@t3imoveis.com.br", whatsapp: "00000000000" }
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

// ==========================================
// 4. LÓGICA DO SISTEMA
// ==========================================

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        
        definirMesAtual();
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
    "gerente9": { nome: "Nickson", email: "nickson@t3imoveis.com.br", whatsapp: "5541987625292" } // NOVO
};

// DADOS DO ADMIN
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

// ==========================================
// 4. LÓGICA DO SISTEMA
// ==========================================

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        
        definirMesAtual();

        roleAtual = (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? 'Admin' : 'Gerente';
        
        if (roleAtual === 'Gerente') {
            meuGerenteID = identificarGerentePorEmail(user.email);
        }

        document.getElementById('user-display').innerText = user.email;
        document.getElementById('role-badge').innerText = roleAtual;

        if (roleAtual === 'Admin') {
            document.getElementById('area-cadastro').classList.remove('hidden');
            document.getElementById('btn-relatorio').classList.remove('hidden');
            document.getElementById('area-agendamento-form').classList.add('hidden');
        } else {
            document.getElementById('area-cadastro').classList.add('hidden');
            document.getElementById('btn-relatorio').classList.add('hidden');
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

// === AUXILIAR: LINK GOOGLE CALENDAR ===
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

// ==========================================
// 5. FUNÇÕES DE AGENDAMENTO
// ==========================================

function salvarAgendamento() {
    const gerenteKey = document.getElementById('ag-gerente').value;
    const data = document.getElementById('ag-data').value;
    const hora = document.getElementById('ag-hora').value;
    const motivo = document.getElementById('ag-motivo').value;

    if(!gerenteKey || !data || !hora || !motivo) {
        alert("Preencha todos os campos do agendamento.");
        return;
    }

    const nomeGerente = CADASTRO_GERENTES[gerenteKey] ? CADASTRO_GERENTES[gerenteKey].nome : "Gerente";

    db.collection("agendamentos").add({
        gerente: nomeGerente,
        gerenteID: gerenteKey,
        data: data,
        hora: hora,
        motivo: motivo,
        status: 'pendente',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        const templateParams = {
            to_email: DADOS_ADMIN.email,
            nome_gerente: "Sistema Agenda",
            nome_pendencia: "AGENDAMENTO: " + motivo, 
            cliente: "Solicitante: " + nomeGerente,
            reserva: data.split('-').reverse().join('/') + " às " + hora
        };
        emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams);

        const msgZap = `Olá Admin, sou ${nomeGerente}. Solicitei presença dia ${data.split('-').reverse().join('/')} às ${hora}.\nMotivo: ${motivo}`;
        const linkZap = `https://wa.me/${DADOS_ADMIN.whatsapp}?text=${encodeURIComponent(msgZap)}`;

        if(confirm("Solicitação salva! Deseja avisar o Admin no WhatsApp?")) window.open(linkZap, '_blank');
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
            
            let classeTag = "tag-pendente";
            let textoTag = "Aguardando";
            if(a.status === 'aceito') { classeTag = "tag-aceito"; textoTag = "Confirmado"; }
            if(a.status === 'recusado') { classeTag = "tag-recusado"; textoTag = "Recusado"; }

            let dataF = a.data.split('-').reverse().join('/');
            
            const linkCalendar = gerarLinkGoogleCalendar(
                a.data, 
                a.hora, 
                `Reunião com ${a.gerente} (T3 Imóveis)`, 
                `Motivo: ${a.motivo}\nSolicitado via Sistema.`
            );

            const btnAgenda = `
                <a href="${linkCalendar}" target="_blank" style="text-decoration:none;">
                    <button style="background:#4285F4; color:white; border:none; border-radius:4px; padding:5px 10px; font-size:0.8em; margin-top:5px; width:100%; cursor:pointer;">
                        📅 Adicionar ao Google Agenda
                    </button>
                </a>
            `;

            let areaBotoes = "";
            let btnExcluirAgenda = "";

            if (roleAtual === 'Admin') {
                btnExcluirAgenda = `<button class="btn-excluir" style="margin-top:5px;" onclick="excluirAgendamento('${id}')" title="Apagar Agendamento">🗑</button>`;
                
                if (a.status === 'pendente') {
                    areaBotoes = `
                        <div style="display:flex; gap:5px; margin-top:5px;">
                            <button class="btn-agenda-aceitar" style="flex:1;" onclick="responderAgendamento('${id}', 'aceito')">✔ Aceitar</button>
                            <button class="btn-agenda-recusar" style="flex:1;" onclick="responderAgendamento('${id}', 'recusado')">✖ Recusar</button>
                        </div>
                    `;
                }
            }

            const card = `
                <div class="card-agenda">
                    <span class="tag-agenda ${classeTag}">${textoTag}</span>
                    <h4>${a.gerente}</h4>
                    <p style="margin:5px 0; font-size:0.9em">📅 ${dataF} às ${a.hora}</p>
                    <p style="margin:5px 0; color:#666; font-size:0.9em">"${a.motivo}"</p>
                    ${btnAgenda}
                    <div style="border-top:1px solid #eee; margin-top:10px; padding-top:5px;">
                        ${areaBotoes}
                        <div style="text-align:right;">${btnExcluirAgenda}</div>
                    </div>
                </div>`;
            div.innerHTML += card;
        });
    });
}

function responderAgendamento(id, resposta) {
    if(confirm(`Deseja marcar como ${resposta}?`)) db.collection("agendamentos").doc(id).update({ status: resposta });
}

function excluirAgendamento(id) {
    if(confirm("Tem certeza que deseja apagar este agendamento?")) db.collection("agendamentos").doc(id).delete();
}

// ==========================================
// 6. FUNÇÕES DE PENDÊNCIAS
// ==========================================

function salvarPendencia() {
    const gerenteKey = document.getElementById('p-responsavel').value;
    const titulo = document.getElementById('p-titulo').value;
    const descricao = document.getElementById('p-descricao').value;
    const cliente = document.getElementById('p-cliente').value;
    const reserva = document.getElementById('p-reserva').value;
    const dataOcorr = document.getElementById('p-data').value;

    if (!titulo || !gerenteKey || !dataOcorr) {
        alert("Preencha Título, Gerente e Data.");
        return;
    }

    const numeroProtocolo = Math.floor(10000 + Math.random() * 90000);
    const dadosGerente = CADASTRO_GERENTES[gerenteKey];
    const user = auth.currentUser;

    const logInicial = {
        data: new Date().toLocaleString('pt-BR'),
        acao: "Pendência Criada",
        usuario: user.email
    };

    db.collection("pendencias").add({
        numero: numeroProtocolo,
        titulo: titulo,
        descricao: descricao,
        nome: titulo, 
        cliente: cliente,
        reserva: reserva,
        data: dataOcorr, 
        gerente: dadosGerente.nome,
        gerenteID: gerenteKey,
        status: "pendente",
        dataResolucao: "",
        historico: [logInicial],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        const templateParams = {
            to_email: dadosGerente.email,
            nome_gerente: dadosGerente.nome,
            nome_pendencia: `#${numeroProtocolo} - ${titulo}`,
            cliente: cliente,
            reserva: reserva
        };
        emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams);

        const msgZap = `Olá ${dadosGerente.nome}, Pendência #${numeroProtocolo}\n\n*Título:* ${titulo}\n*Cliente:* ${cliente}\n\n*Detalhes:* ${descricao}`;
        const linkZap = `https://wa.me/${dadosGerente.whatsapp}?text=${encodeURIComponent(msgZap)}`;

        if(confirm(`Pendência #${numeroProtocolo} Salva! Abrir WhatsApp?`)) window.open(linkZap, '_blank');
        
        document.querySelectorAll('#area-cadastro input, #area-cadastro textarea').forEach(i => i.value = '');
        document.getElementById('p-responsavel').value = "";
        definirMesAtual();

    }).catch(err => alert("Erro ao salvar: " + err.message));
}

function carregarPendencias() {
    db.collection("pendencias").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        const lista = document.getElementById('lista-pendencias');
        lista.innerHTML = "";
        const mesFiltro = document.getElementById('filtro-mes').value;

        if (snapshot.empty) { lista.innerHTML = "<p style='text-align:center'>Nenhuma pendência.</p>"; return; }

        let itensVisiveis = 0;

        snapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;
            
            const protocolo = p.numero ? `#${p.numero}` : "S/N";

            if (p.data && !p.data.startsWith(mesFiltro)) return;
            if (filtroAtual === 'abertos' && p.status === 'aprovado') return;
            if (filtroAtual === 'finalizados' && p.status !== 'aprovado') return;

            if (roleAtual === 'Gerente') {
                if (p.gerenteID !== meuGerenteID) return;
            }

            itensVisiveis++;

            const displayTitulo = p.titulo || p.nome;
            const displayDesc = p.descricao ? `<p style="margin-top:8px; color:#555; white-space: pre-wrap;">${p.descricao}</p>` : "";

            let htmlAcao = "";
            let textoBadge = "";
            let btnExcluir = "";
            let areaHistorico = "";

            if (roleAtual === 'Admin') {
                let logsHtml = "";
                if (p.historico && p.historico.length > 0) {
                    p.historico.forEach(log => {
                        logsHtml += `<div class="hist-item"><span class="hist-data">${log.data}</span> ${log.acao} <small>(${log.usuario})</small></div>`;
                    });
                } else {
                    logsHtml = "<div class='hist-item'>Sem histórico registrado.</div>";
                }

                areaHistorico = `
                    <button class="btn-historico" onclick="toggleHistorico('${id}')">📜 Histórico de Alterações</button>
                    <div id="hist-${id}" class="historico-box hidden">
                        ${logsHtml}
                    </div>
                `;
            }

            if (p.status === 'pendente') {
                textoBadge = "<span style='color:red; font-weight:bold'>PENDENTE</span>";
                htmlAcao = (roleAtual === 'Gerente') 
                    ? `<button class="btn-resolver" onclick="mudarStatus('${id}', 'analise')">✅ Resolvi</button>` 
                    : `<small style='color:#666'>A aguardar...</small>`;
            } 
            else if (p.status === 'analise') {
                textoBadge = "<span style='color:orange; font-weight:bold'>EM APROVAÇÃO</span>";
                if (roleAtual === 'Admin') {
                    htmlAcao = `
                        <button class="btn-aprovar" onclick="mudarStatus('${id}', 'aprovado')">Aprovar</button>
                        <button class="btn-recusar" onclick="mudarStatus('${id}', 'pendente')">Recusar</button>
                    `;
                } else {
                    htmlAcao = `<small style='color:orange'>Em análise</small>`;
                }
            } 
            else if (p.status === 'aprovado') {
                 textoBadge = "<span style='color:green; font-weight:bold'>FINALIZADO</span>";
                 htmlAcao = "✔ OK";
            }

            if (roleAtual === 'Admin') {
                btnExcluir = `<button class="btn-excluir" onclick="excluirPendencia('${id}')">🗑</button>`;
            }

            let dataF = p.data ? p.data.split('-').reverse().join('/') : '-';

            const card = `
                <div class="item-pendencia status-${p.status}">
                    <div style="flex: 1; margin-right: 15px;">
                        <div style="margin-bottom:5px">${textoBadge} <span style="color:#999; font-size:0.8em; margin-left:10px;">${protocolo}</span></div>
                        <strong style="font-size:1.1em; display:block;">${displayTitulo}</strong>
                        ${displayDesc}
                        <div style="margin-top:10px; font-size:0.9em; color:#666;">
                            <span>Cliente: ${p.cliente} (Res: ${p.reserva})</span><br>
                            <span style="color:#2563eb; font-weight:bold">Responsável: ${p.gerente}</span> | <span>${dataF}</span>
                        </div>
                        ${areaHistorico}
                    </div>
                    <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                        ${htmlAcao} ${btnExcluir}
                    </div>
                </div>`;
            lista.innerHTML += card;
        });

        if (itensVisiveis === 0) lista.innerHTML = "<p style='text-align:center; color:#999; margin-top:20px;'>Nenhuma pendência encontrada para você neste mês/filtro.</p>";
    });
}

function mudarStatus(id, st) {
    let msg = "";
    let dados = { status: st };
    let textoLog = "";

    if (st === 'analise') { 
        msg = "Confirma resolução?"; 
        dados.dataResolucao = new Date().toLocaleString('pt-BR');
        textoLog = "Gerente marcou como Resolvido";
    }
    if (st === 'aprovado') {
        msg = "Aprovar finalização?";
        textoLog = "Admin Aprovou a resolução";
    }
    if (st === 'pendente') {
        msg = "Recusar e devolver?"; 
        dados.dataResolucao = ""; 
        textoLog = "Admin Recusou a resolução";
    }

    const novoLog = {
        data: new Date().toLocaleString('pt-BR'),
        acao: textoLog,
        usuario: auth.currentUser.email
    };

    dados.historico = firebase.firestore.FieldValue.arrayUnion(novoLog);

    if(confirm(msg)) db.collection("pendencias").doc(id).update(dados);
}

function excluirPendencia(id) {
    if(confirm("Excluir permanentemente?")) db.collection("pendencias").doc(id).delete();
}

function exportarExcel() {
    db.collection("pendencias").orderBy("timestamp", "desc").get().then((snap) => {
        let dados = [];
        snap.forEach((doc) => {
            let p = doc.data();
            dados.push({
                "ID": p.numero || "S/N",
                "Status": p.status.toUpperCase(),
                "Título": p.titulo || p.nome,
                "Descrição": p.descricao || "",
                "Gerente": p.gerente,
                "Data Ocorrência": p.data ? p.data.split('-').reverse().join('/') : '-',
                "Cliente": p.cliente,
                "Reserva": p.reserva,
                "Resolvido em": p.dataResolucao || ""
            });
        });
        if (dados.length === 0) { alert("Sem dados."); return; }
        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pendencias");
        XLSX.writeFile(wb, "Relatorio_Pendencias.xlsx");
    });
}
        roleAtual = (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? 'Admin' : 'Gerente';
        
        if (roleAtual === 'Gerente') {
            meuGerenteID = identificarGerentePorEmail(user.email);
        }

        document.getElementById('user-display').innerText = user.email;
        document.getElementById('role-badge').innerText = roleAtual;

        if (roleAtual === 'Admin') {
            document.getElementById('area-cadastro').classList.remove('hidden');
            document.getElementById('btn-relatorio').classList.remove('hidden');
            document.getElementById('area-agendamento-form').classList.add('hidden');
        } else {
            document.getElementById('area-cadastro').classList.add('hidden');
            document.getElementById('btn-relatorio').classList.add('hidden');
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

// === AUXILIAR: HISTÓRICO VISUAL ===
function toggleHistorico(id) {
    const el = document.getElementById(`hist-${id}`);
    if (el) el.classList.toggle('hidden');
}

// === AUXILIAR: GERAR LINK GOOGLE CALENDAR ===
function gerarLinkGoogleCalendar(dataStr, horaStr, titulo, descricao) {
    // dataStr: YYYY-MM-DD, horaStr: HH:MM
    // Formato Google: YYYYMMDDTHHMMSS
    const start = dataStr.replace(/-/g, '') + 'T' + horaStr.replace(':', '') + '00';
    
    // Calcula fim (adiciona 1 hora por padrão)
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
// 5. FUNÇÕES DE AGENDAMENTO
// ==========================================

function salvarAgendamento() {
    const gerenteKey = document.getElementById('ag-gerente').value;
    const data = document.getElementById('ag-data').value;
    const hora = document.getElementById('ag-hora').value;
    const motivo = document.getElementById('ag-motivo').value;

    if(!gerenteKey || !data || !hora || !motivo) {
        alert("Preencha todos os campos do agendamento.");
        return;
    }

    const nomeGerente = CADASTRO_GERENTES[gerenteKey] ? CADASTRO_GERENTES[gerenteKey].nome : "Gerente";

    db.collection("agendamentos").add({
        gerente: nomeGerente,
        gerenteID: gerenteKey,
        data: data,
        hora: hora,
        motivo: motivo,
        status: 'pendente',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        const templateParams = {
            to_email: DADOS_ADMIN.email,
            nome_gerente: "Sistema Agenda",
            nome_pendencia: "AGENDAMENTO: " + motivo, 
            cliente: "Solicitante: " + nomeGerente,
            reserva: data.split('-').reverse().join('/') + " às " + hora
        };
        emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams);

        const msgZap = `Olá Admin, sou ${nomeGerente}. Solicitei presença dia ${data.split('-').reverse().join('/')} às ${hora}.\nMotivo: ${motivo}`;
        const linkZap = `https://wa.me/${DADOS_ADMIN.whatsapp}?text=${encodeURIComponent(msgZap)}`;

        if(confirm("Solicitação salva! Deseja avisar o Admin no WhatsApp?")) window.open(linkZap, '_blank');
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
            
            let classeTag = "tag-pendente";
            let textoTag = "Aguardando";
            if(a.status === 'aceito') { classeTag = "tag-aceito"; textoTag = "Confirmado"; }
            if(a.status === 'recusado') { classeTag = "tag-recusado"; textoTag = "Recusado"; }

            let dataF = a.data.split('-').reverse().join('/');
            
            // Gera o link do Google Calendar
            const linkCalendar = gerarLinkGoogleCalendar(
                a.data, 
                a.hora, 
                `Reunião com ${a.gerente} (T3 Imóveis)`, 
                `Motivo: ${a.motivo}\nSolicitado via Sistema de Pendências.`
            );

            // Botão de Agenda (Visível para Admin e para o Dono do agendamento)
            const btnAgenda = `
                <a href="${linkCalendar}" target="_blank" style="text-decoration:none;">
                    <button style="background:#4285F4; color:white; border:none; border-radius:4px; padding:5px 10px; font-size:0.8em; margin-top:5px; width:100%; cursor:pointer;">
                        📅 Adicionar ao Google Agenda
                    </button>
                </a>
            `;

            let areaBotoes = "";
            let btnExcluirAgenda = "";

            if (roleAtual === 'Admin') {
                btnExcluirAgenda = `<button class="btn-excluir" style="margin-top:5px;" onclick="excluirAgendamento('${id}')" title="Apagar Agendamento">🗑</button>`;
                
                if (a.status === 'pendente') {
                    areaBotoes = `
                        <div style="display:flex; gap:5px; margin-top:5px;">
                            <button class="btn-agenda-aceitar" style="flex:1;" onclick="responderAgendamento('${id}', 'aceito')">✔ Aceitar</button>
                            <button class="btn-agenda-recusar" style="flex:1;" onclick="responderAgendamento('${id}', 'recusado')">✖ Recusar</button>
                        </div>
                    `;
                }
            }

            const card = `
                <div class="card-agenda">
                    <span class="tag-agenda ${classeTag}">${textoTag}</span>
                    <h4>${a.gerente}</h4>
                    <p style="margin:5px 0; font-size:0.9em">📅 ${dataF} às ${a.hora}</p>
                    <p style="margin:5px 0; color:#666; font-size:0.9em">"${a.motivo}"</p>
                    
                    ${btnAgenda} <div style="border-top:1px solid #eee; margin-top:10px; padding-top:5px;">
                        ${areaBotoes}
                        <div style="text-align:right;">${btnExcluirAgenda}</div>
                    </div>
                </div>`;
            div.innerHTML += card;
        });
    });
}

function responderAgendamento(id, resposta) {
    if(confirm(`Deseja marcar como ${resposta}?`)) db.collection("agendamentos").doc(id).update({ status: resposta });
}

function excluirAgendamento(id) {
    if(confirm("Tem certeza que deseja apagar este agendamento?")) db.collection("agendamentos").doc(id).delete();
}

// ==========================================
// 6. FUNÇÕES DE PENDÊNCIAS
// ==========================================

function salvarPendencia() {
    const gerenteKey = document.getElementById('p-responsavel').value;
    const titulo = document.getElementById('p-titulo').value;
    const descricao = document.getElementById('p-descricao').value;
    const cliente = document.getElementById('p-cliente').value;
    const reserva = document.getElementById('p-reserva').value;
    const dataOcorr = document.getElementById('p-data').value;

    if (!titulo || !gerenteKey || !dataOcorr) {
        alert("Preencha Título, Gerente e Data.");
        return;
    }

    const numeroProtocolo = Math.floor(10000 + Math.random() * 90000);
    const dadosGerente = CADASTRO_GERENTES[gerenteKey];
    const user = auth.currentUser;

    const logInicial = {
        data: new Date().toLocaleString('pt-BR'),
        acao: "Pendência Criada",
        usuario: user.email
    };

    db.collection("pendencias").add({
        numero: numeroProtocolo,
        titulo: titulo,
        descricao: descricao,
        nome: titulo, 
        cliente: cliente,
        reserva: reserva,
        data: dataOcorr, 
        gerente: dadosGerente.nome,
        gerenteID: gerenteKey,
        status: "pendente",
        dataResolucao: "",
        historico: [logInicial],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        const templateParams = {
            to_email: dadosGerente.email,
            nome_gerente: dadosGerente.nome,
            nome_pendencia: `#${numeroProtocolo} - ${titulo}`,
            cliente: cliente,
            reserva: reserva
        };
        emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams);

        const msgZap = `Olá ${dadosGerente.nome}, Pendência #${numeroProtocolo}\n\n*Título:* ${titulo}\n*Cliente:* ${cliente}\n\n*Detalhes:* ${descricao}`;
        const linkZap = `https://wa.me/${dadosGerente.whatsapp}?text=${encodeURIComponent(msgZap)}`;

        if(confirm(`Pendência #${numeroProtocolo} Salva! Abrir WhatsApp?`)) window.open(linkZap, '_blank');
        
        document.querySelectorAll('#area-cadastro input, #area-cadastro textarea').forEach(i => i.value = '');
        document.getElementById('p-responsavel').value = "";
        definirMesAtual();

    }).catch(err => alert("Erro ao salvar: " + err.message));
}

function carregarPendencias() {
    db.collection("pendencias").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        const lista = document.getElementById('lista-pendencias');
        lista.innerHTML = "";
        const mesFiltro = document.getElementById('filtro-mes').value;

        if (snapshot.empty) { lista.innerHTML = "<p style='text-align:center'>Nenhuma pendência.</p>"; return; }

        let itensVisiveis = 0;

        snapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;
            
            const protocolo = p.numero ? `#${p.numero}` : "S/N";

            if (p.data && !p.data.startsWith(mesFiltro)) return;
            if (filtroAtual === 'abertos' && p.status === 'aprovado') return;
            if (filtroAtual === 'finalizados' && p.status !== 'aprovado') return;

            if (roleAtual === 'Gerente') {
                if (p.gerenteID !== meuGerenteID) return;
            }

            itensVisiveis++;

            const displayTitulo = p.titulo || p.nome;
            const displayDesc = p.descricao ? `<p style="margin-top:8px; color:#555; white-space: pre-wrap;">${p.descricao}</p>` : "";

            let htmlAcao = "";
            let textoBadge = "";
            let btnExcluir = "";
            let areaHistorico = "";

            if (roleAtual === 'Admin') {
                let logsHtml = "";
                if (p.historico && p.historico.length > 0) {
                    p.historico.forEach(log => {
                        logsHtml += `<div class="hist-item"><span class="hist-data">${log.data}</span> ${log.acao} <small>(${log.usuario})</small></div>`;
                    });
                } else {
                    logsHtml = "<div class='hist-item'>Sem histórico registrado.</div>";
                }

                areaHistorico = `
                    <button class="btn-historico" onclick="toggleHistorico('${id}')">📜 Histórico de Alterações</button>
                    <div id="hist-${id}" class="historico-box hidden">
                        ${logsHtml}
                    </div>
                `;
            }

            if (p.status === 'pendente') {
                textoBadge = "<span style='color:red; font-weight:bold'>PENDENTE</span>";
                htmlAcao = (roleAtual === 'Gerente') 
                    ? `<button class="btn-resolver" onclick="mudarStatus('${id}', 'analise')">✅ Resolvi</button>` 
                    : `<small style='color:#666'>A aguardar...</small>`;
            } 
            else if (p.status === 'analise') {
                textoBadge = "<span style='color:orange; font-weight:bold'>EM APROVAÇÃO</span>";
                if (roleAtual === 'Admin') {
                    htmlAcao = `
                        <button class="btn-aprovar" onclick="mudarStatus('${id}', 'aprovado')">Aprovar</button>
                        <button class="btn-recusar" onclick="mudarStatus('${id}', 'pendente')">Recusar</button>
                    `;
                } else {
                    htmlAcao = `<small style='color:orange'>Em análise</small>`;
                }
            } 
            else if (p.status === 'aprovado') {
                 textoBadge = "<span style='color:green; font-weight:bold'>FINALIZADO</span>";
                 htmlAcao = "✔ OK";
            }

            if (roleAtual === 'Admin') {
                btnExcluir = `<button class="btn-excluir" onclick="excluirPendencia('${id}')">🗑</button>`;
            }

            let dataF = p.data ? p.data.split('-').reverse().join('/') : '-';

            const card = `
                <div class="item-pendencia status-${p.status}">
                    <div style="flex: 1; margin-right: 15px;">
                        <div style="margin-bottom:5px">${textoBadge} <span style="color:#999; font-size:0.8em; margin-left:10px;">${protocolo}</span></div>
                        <strong style="font-size:1.1em; display:block;">${displayTitulo}</strong>
                        ${displayDesc}
                        <div style="margin-top:10px; font-size:0.9em; color:#666;">
                            <span>Cliente: ${p.cliente} (Res: ${p.reserva})</span><br>
                            <span style="color:#2563eb; font-weight:bold">Responsável: ${p.gerente}</span> | <span>${dataF}</span>
                        </div>
                        ${areaHistorico}
                    </div>
                    <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                        ${htmlAcao} ${btnExcluir}
                    </div>
                </div>`;
            lista.innerHTML += card;
        });

        if (itensVisiveis === 0) lista.innerHTML = "<p style='text-align:center; color:#999; margin-top:20px;'>Nenhuma pendência encontrada para você neste mês/filtro.</p>";
    });
}

function mudarStatus(id, st) {
    let msg = "";
    let dados = { status: st };
    let textoLog = "";

    if (st === 'analise') { 
        msg = "Confirma resolução?"; 
        dados.dataResolucao = new Date().toLocaleString('pt-BR');
        textoLog = "Gerente marcou como Resolvido";
    }
    if (st === 'aprovado') {
        msg = "Aprovar finalização?";
        textoLog = "Admin Aprovou a resolução";
    }
    if (st === 'pendente') {
        msg = "Recusar e devolver?"; 
        dados.dataResolucao = ""; 
        textoLog = "Admin Recusou a resolução";
    }

    const novoLog = {
        data: new Date().toLocaleString('pt-BR'),
        acao: textoLog,
        usuario: auth.currentUser.email
    };

    dados.historico = firebase.firestore.FieldValue.arrayUnion(novoLog);

    if(confirm(msg)) db.collection("pendencias").doc(id).update(dados);
}

function excluirPendencia(id) {
    if(confirm("Excluir permanentemente?")) db.collection("pendencias").doc(id).delete();
}

function exportarExcel() {
    db.collection("pendencias").orderBy("timestamp", "desc").get().then((snap) => {
        let dados = [];
        snap.forEach((doc) => {
            let p = doc.data();
            dados.push({
                "ID": p.numero || "S/N",
                "Status": p.status.toUpperCase(),
                "Título": p.titulo || p.nome,
                "Descrição": p.descricao || "",
                "Gerente": p.gerente,
                "Data Ocorrência": p.data ? p.data.split('-').reverse().join('/') : '-',
                "Cliente": p.cliente,
                "Reserva": p.reserva,
                "Resolvido em": p.dataResolucao || ""
            });
        });
        if (dados.length === 0) { alert("Sem dados."); return; }
        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pendencias");
        XLSX.writeFile(wb, "Relatorio_Pendencias.xlsx");
    });
}