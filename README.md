# 🚀 Sistema de Gestão de Pendências & BI - T3 Imóveis (v2.3)

Sistema Web completo para gestão operacional de pendências, controle de SLA e **Business Intelligence (BI)** financeiro e estratégico. Focado em reduzir o tempo de resolução de problemas contratuais e financeiros.

---

## 🔥 Novas Funcionalidades de BI (Business Intelligence)

A versão 2.3 transforma o sistema em uma ferramenta de decisão estratégica. Abaixo, o detalhamento de cada Dashboard:

### 1. 💰 KPI: VGV Travado (Valor Geral de Vendas)
* **O que mostra:** A soma monetária (R$) de todos os contratos/imóveis que estão parados devido a pendências em aberto.
* **Objetivo:** Gerar senso de urgência. Mostra quanto dinheiro a imobiliária está deixando de faturar (ou atrasando o recebimento) por questões burocráticas.

### 2. 🔄 KPI: Taxa de Retrabalho
* **O que mostra:** A porcentagem de tarefas que foram enviadas para análise, mas foram **recusadas** pelo Admin e voltaram para o Gerente.
* **Objetivo:** Medir a qualidade da resolução. Uma taxa alta indica que a equipe está "tentando se livrar" da pendência sem resolver o problema real, gerando gargalo administrativo.

### 3. 📈 Evolução e Tendência (Linha do Tempo)
* **O que mostra:** Um gráfico de linha comparando, mês a mês:
    * **Linha Vermelha:** Volume de novas pendências criadas.
    * **Linha Verde:** Volume de pendências resolvidas.
* **Análise:**
    * *Linhas se cruzando ou Verde acima:* Operação saudável.
    * *Vermelha constantemente acima:* Acúmulo de backlog (risco de colapso operacional).

### 4. ⏳ Aging de Pendências (Envelhecimento)
* **O que mostra:** Um gráfico de barras que categoriza as pendências abertas pelo tempo que estão travadas:
    * *1-3 Dias (Normal)*
    * *4-7 Dias (Atenção)*
    * *+7 Dias ou +15 Dias (Crítico)*
* **Objetivo:** Identificar casos "esquecidos" ou complexos que exigem intervenção imediata da diretoria, evitando que processos de financiamento expirem.

### 5. 📊 Pareto de Motivos (80/20)
* **O que mostra:** Gráfico de barras horizontais indicando quais **Tipos** de pendência (Ex: Documentação, Processo Caixa, Ato) causam mais atrasos.
* **Objetivo:** Identificar a causa raiz. Se 80% dos atrasos vêm de "Documentação", a empresa deve investir em treinamento sobre checklist de documentos.

### 6. 🎯 Tabela de Risco & Drill-Down (Por Gerente)
* **O que mostra:** Uma tabela interativa com a performance individual de cada gerente:
    * **Em Dia vs. Atrasados:** Quantidade atual.
    * **Risco (%):** Probabilidade histórica de atraso baseada no comportamento passado.
* **Funcionalidade Drill-Down:** Ao clicar no nome de um gerente, abre-se um modal detalhando a **Média de Dias Úteis** que aquele gerente específico leva para resolver cada tipo de problema.

---

## 🛠️ Funcionalidades Operacionais

* **Controle de SLA Automático:**
    * *Urgente:* 1 dia útil.
    * *Alta:* 2 dias úteis.
    * *Média:* 3 dias úteis.
    * *Baixa:* 7 dias úteis.
    * *(Cálculo inteligente que ignora domingos)*.
* **Agenda Administrativa:**
    * Gerentes solicitam reuniões/atendimentos.
    * Integração com **Google Calendar** (Gera link direto para adicionar ao calendário).
    * Status visual (Pendente, Confirmado, Recusado).
* **Segurança de Dados:**
    * **Admin:** Vê tudo, exporta relatórios, gerencia equipe.
    * **Gerente:** Vê apenas suas próprias pendências, métricas e agenda. Não tem acesso a dados sensíveis de colegas ou exportação global.
* **Notificações:**
    * Sistema de "Sininho" visual no app.
    * Integração com **EmailJS** para disparos de e-mail.
    * Integração nativa via Link para **WhatsApp Web**.

---

## 💻 Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (Variáveis CSS, Flexbox, Grid), JavaScript (ES6+).
* **Backend (Serverless):** Google Firebase (Firestore Database & Authentication).
* **Visualização de Dados:** Chart.js (Gráficos interativos).
* **Relatórios:** SheetJS (Exportação para Excel/XLSX).
* **Comunicação:** EmailJS API.

---

## ⚙️ Instalação e Configuração

1.  Clone o repositório.
2.  No arquivo `app.js`, substitua o objeto `firebaseConfig` pelas credenciais do seu projeto Firebase.
3.  Atualize a chave pública do `emailjs.init`.
4.  Abra o `index.html` (ou faça deploy no Firebase Hosting/Vercel).
5.  **Primeiro Login:** O sistema reconhecerá automaticamente o e-mail definido na constante `DADOS_ADMIN` como Administrador.

---

> **Nota:** Este sistema foi desenvolvido para alta performance e não requer servidor dedicado (Node/PHP), rodando inteiramente no navegador com backend em nuvem (BaaS).
