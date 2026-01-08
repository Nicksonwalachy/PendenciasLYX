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
    "gerente8": { nome: "Pedro", email: "Pedro@t3imoveis.com.br", whatsapp: "5541996916905" }
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
            let areaBotoes = "";
            let btnExcluirAgenda = "";

            if (roleAtual === 'Admin') {
                btnExcluirAgenda = `<button class="btn-excluir" style="margin-top:5px;" onclick="excluirAgendamento('${id}')" title="Apagar Agendamento">🗑</button>`;
                if (a.status === 'pendente') {
                    areaBotoes = `
                        <button class="btn-agenda-aceitar" onclick="responderAgendamento('${id}', 'aceito')">✔ Aceitar</button>
                        <button class="btn-agenda-recusar" onclick="responderAgendamento('${id}', 'recusado')">✖ Recusar</button>
                    `;
                }
            }

            const card = `
                <div class="card-agenda">
                    <span class="tag-agenda ${classeTag}">${textoTag}</span>
                    <h4>${a.gerente}</h4>
                    <p style="margin:5px 0; font-size:0.9em">📅 ${dataF} às ${a.hora}</p>
                    <p style="margin:5px 0; color:#666; font-size:0.9em">"${a.motivo}"</p>
                    <div style="border-top:1px solid #eee; margin-top:10px; padding-top:5px; display:flex; justify-content:space-between; align-items:center;">
                        <div>${areaBotoes}</div>
                        <div>${btnExcluirAgenda}</div>
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
    const descPendencia = document.getElementById('p-nome').value;
    const cliente = document.getElementById('p-cliente').value;
    const reserva = document.getElementById('p-reserva').value;
    const dataOcorr = document.getElementById('p-data').value;

    if (!descPendencia || !gerenteKey || !dataOcorr) {
        alert("Preencha todos os campos.");
        return;
    }

    // GERA O NÚMERO DE PROTOCOLO (5 DIGITOS)
    const numeroProtocolo = Math.floor(10000 + Math.random() * 90000);

    const dadosGerente = CADASTRO_GERENTES[gerenteKey];

    db.collection("pendencias").add({
        numero: numeroProtocolo, // Salva o numero
        nome: descPendencia,
        cliente: cliente,
        reserva: reserva,
        data: dataOcorr, 
        gerente: dadosGerente.nome,
        gerenteID: gerenteKey,
        status: "pendente",
        dataResolucao: "",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        const templateParams = {
            to_email: dadosGerente.email,
            nome_gerente: dadosGerente.nome,
            nome_pendencia: "#" + numeroProtocolo + " - " + descPendencia, // Envia no email
            cliente: cliente,
            reserva: reserva
        };
        emailjs.send('service_ywnbbqr', 'template_7ago0v7', templateParams);

        const msgZap = `Olá ${dadosGerente.nome}, Pendência #${numeroProtocolo}\n\nCliente: ${cliente}\nProblema: ${descPendencia}`;
        const linkZap = `https://wa.me/${dadosGerente.whatsapp}?text=${encodeURIComponent(msgZap)}`;

        if(confirm(`Pendência #${numeroProtocolo} Salva! Abrir WhatsApp?`)) window.open(linkZap, '_blank');
        document.querySelectorAll('#area-cadastro input').forEach(i => i.value = '');
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
            
            // Garante que existe numero (para registros antigos)
            const protocolo = p.numero ? `#${p.numero}` : "S/N";

            if (p.data && !p.data.startsWith(mesFiltro)) return;
            if (filtroAtual === 'abertos' && p.status === 'aprovado') return;
            if (filtroAtual === 'finalizados' && p.status !== 'aprovado') return;

            // Filtro de Privacidade
            if (roleAtual === 'Gerente') {
                if (p.gerenteID !== meuGerenteID) return;
            }

            itensVisiveis++;

            let htmlAcao = "";
            let textoBadge = "";
            let btnExcluir = "";

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
                    <div>
                        <div style="margin-bottom:5px">${textoBadge} <span style="color:#999; font-size:0.8em; margin-left:10px;">${protocolo}</span></div>
                        <strong>${p.nome}</strong> <br>
                        <span style="color:#555">Cliente: ${p.cliente} (Res: ${p.reserva})</span><br>
                        <small style="color:#2563eb; font-weight:bold">Responsável: ${p.gerente}</small> | <small>${dataF}</small>
                    </div>
                    <div style="text-align:right; display:flex; align-items:center; justify-content:flex-end;">
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
    if (st === 'analise') { msg = "Confirma resolução?"; dados.dataResolucao = new Date().toLocaleString('pt-BR'); }
    if (st === 'aprovado') msg = "Aprovar finalização?";
    if (st === 'pendente') { msg = "Recusar e devolver?"; dados.dataResolucao = ""; }
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
                "ID": p.numero || "S/N", // Nova coluna ID
                "Status": p.status.toUpperCase(),
                "Pendência": p.nome,
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