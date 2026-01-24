# 🚀 Sistema de Controle de Pendências T3 - Versão Pro 2.1

Sistema Web completo para gestão de pendências operacionais, controle rigoroso de SLA (Service Level Agreement) e métricas de performance para a T3 Imóveis.

![Dashboard Preview](https://via.placeholder.com/800x400.png?text=Dashboard+SLA+e+Metricas)
*(Substitua este link por um print real da sua tela de Dashboard)*

---

## 🔥 Novas Funcionalidades (Versão 2.1)

Esta versão foca na metrificação precisa e automação de prazos:

### 1. ⏱️ SLA Inteligente e Automático
O sistema agora calcula o prazo limite automaticamente no momento do cadastro, baseado na prioridade escolhida:
* **🔥 Urgente:** 1 Dia
* **🔴 Alta:** 2 Dias
* **🟡 Média:** 3 Dias
* **🟢 Baixa:** 7 Dias

**Regra de Negócio:** O cálculo considera dias úteis (Sábado conta, **Domingo é pulado**). Se um prazo cair no domingo, ele é jogado para a segunda-feira.

### 2. 📊 Dashboard de Performance (Drill-Down)
Novo relatório "Tempo de Resolução" disponível para o Administrador:
* **Visão Geral:** Gráfico de barras mostrando a média de *dias úteis* que cada gerente leva para resolver pendências.
* **Detalhamento (Drill-Down):** Ao clicar na barra de um gerente, o gráfico muda para mostrar a performance dele dividida por **Tipo de Documento** (Ex: Quanto tempo leva para Documentação vs. Processo Caixa).

### 3. 📋 Gestão Visual e Prioridades
* Nova prioridade **Urgente** com destaque visual pulsante.
* Indicadores visuais claros de **"NO PRAZO"** ou **"ATRASADO"** nos cartões.

---

## 🛠 Funcionalidades Principais

### ✅ Gestão de Tarefas
* **Kanban Drag & Drop:** Arraste cartões entre *Pendente*, *Em Análise* e *Finalizado*.
* **Modo Lista:** Visualização compacta para leitura rápida.
* **Chat Interno:** Histórico de conversas e logs de alteração dentro de cada pendência.

### 👥 Gestão de Equipe
* **Painel de Usuários:** Adicione ou remova gerentes sem tocar no código.
* **Agenda:** Solicitação de presença do Admin integrada ao Google Calendar.

### 📈 Relatórios e Exportação
* Exportação de dados para Excel separada por Diretoria (Roque/Cesar).
* Gráficos em tempo real de Status, Volumetria por Diretoria e Tipos de Pendência.

---

## 🔐 Perfis de Acesso

### 👑 Administrador
* **Visão Total:** Acesso a todas as pendências e todos os dashboards.
* **Aprovação:** Poder de aprovar ou recusar (devolver) resoluções.
* **Métricas:** Acesso exclusivo ao botão "⏱️ Tempo Resolução".
* **Gestão:** Adiciona/Remove usuários e edita qualquer pendência.

### 💼 Gerente
* **Foco Individual:** Visualiza apenas suas próprias pendências.
* **Execução:** Pode marcar pendências como "Em Análise" (Resolvido).
* **Agenda:** Solicita reuniões com a administração.

---

## 💻 Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (Variáveis CSS e Dark Mode), JavaScript (ES6+).
* **Backend (Serverless):** Google Firebase Firestore.
* **Autenticação:** Firebase Auth.
* **Gráficos:** Chart.js (Interativos com eventos de clique).
* **Relatórios:** SheetJS (XLSX).
* **Notificações:** EmailJS.

---

## ⚙️ Configuração e Instalação

1.  **Clone ou Baixe** os arquivos do projeto.
2.  **Configure o `app.js`**:
    * Insira suas chaves do `firebaseConfig`.
    * Atualize a chave pública do `emailjs.init`.
3.  **Regras do Firestore:**
    Certifique-se de que suas regras no Firebase permitem leitura/escrita para usuários autenticados:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```
4.  **Primeiro Acesso:**
    * O sistema criará automaticamente a coleção de usuários baseada na constante `GERENTES_PADRAO` no primeiro carregamento.

---

## 📸 Galeria

| Dashboard SLA | Kanban |
| :---: | :---: |
| ![SLA](https://via.placeholder.com/400x250.png?text=Grafico+Barras+SLA) | ![Kanban](https://via.placeholder.com/400x250.png?text=Kanban+Board) |

| Cadastro Inteligente | Modo Escuro |
| :---: | :---: |
| ![Cadastro](https://via.placeholder.com/400x250.png?text=Calculo+Automatico+Prazo) | ![Dark Mode](https://via.placeholder.com/400x250.png?text=Dark+Mode+Verde) |

---

*Desenvolvido para T3 Imóveis - 2026*