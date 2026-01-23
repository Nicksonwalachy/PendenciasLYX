# 🚀 Sistema de Controle de Pendências T3 - Versão Pro

Sistema Web completo para gestão de pendências operacionais, controle de SLA e agendamento de reuniões entre Gerentes e a Diretoria/Administração da T3 Imóveis.

![Dashboard Preview](https://via.placeholder.com/800x400.png?text=Dashboard+Visão+Geral)
*(Substitua este link por um print real da sua tela de Dashboard)*

---

## 🔥 Novas Funcionalidades (Versão 2.0)

Esta versão traz melhorias significativas de usabilidade, design e gestão:

### 1. 📋 Gestão Visual (Kanban & Lista)
* **Kanban Drag & Drop:** Arraste os cartões para mover pendências de *Pendente* → *Em Análise* → *Finalizado*.
* **Modo Lista:** Visualização detalhada para leitura e histórico.
* **Filtros Inteligentes:** Pesquisa em tempo real por nome, título ou número da pendência.

### 2. ⚙️ Gestão de Equipe Dinâmica
* **Painel de Usuários:** O Admin pode adicionar ou remover gerentes diretamente pelo sistema, sem mexer no código.
* **Banco de Dados:** Os usuários ficam salvos no Firebase Firestore.

### 3. 💬 Comunicação & SLA
* **Chat Interno:** Histórico de conversas dentro de cada pendência (estilo WhatsApp).
* **Controle de SLA:** O sistema avisa visualmente se uma pendência está **"No Prazo"** (Verde) ou **"ATRASADO"** (Vermelho).
* **Notificações:** "Sino" de alerta no topo para avisar sobre devoluções ou novas resoluções.

### 4. 📎 Arquivos e Links
* **Link Inteligente:** Cole links do Google Drive, Dropbox ou imagens diretas.
* **Preview de Imagem:** Se o link for uma imagem, ela aparece automaticamente dentro do cartão.

### 5. 🎨 Design Moderno (Clean UI)
* **Modo Escuro (Dark Mode):** Alternância entre tema Dia/Noite com persistência (salva a preferência do usuário).
* **Interface Limpa:** Histórico oculto por padrão (expansível) e maior espaçamento para facilitar a leitura.

---

## 🛠 Perfis de Acesso

### 👑 Administrador
* **Dashboard:** Gráficos de pizza (Status) e barras (Diretoria) em tempo real.
* **Aprovação:** Pode aprovar resoluções ou devolver pendências com motivo obrigatório.
* **Gestão Total:** Vê todas as pendências, gerencia equipe e exporta relatórios.
* **Relatórios:** Exportação separada para **Excel Roque** e **Excel Cesar**.

### 💼 Gerente
* **Foco:** Vê apenas suas próprias pendências.
* **Resolução:** Marca pendências como resolvidas e anexa provas (links).
* **Agenda:** Solicita agendamento presencial com integração ao Google Calendar.

---

## 💻 Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (Variáveis CSS), JavaScript (Vanilla ES6+).
* **Backend (Serverless):** Google Firebase Firestore.
* **Autenticação:** Firebase Auth.
* **Gráficos:** Chart.js.
* **Relatórios:** SheetJS (XLSX).
* **Notificações:** EmailJS.

---

## ⚙️ Configuração e Instalação

1.  **Clone ou Baixe** os arquivos do projeto.
2.  **Configure o `app.js`**:
    * Substitua as chaves do `firebaseConfig` pelo seu projeto.
    * Atualize a chave pública do `emailjs.init`.
3.  **Configure o Firebase (Console):**
    * Habilite o **Authentication** (Email/Senha).
    * Crie o banco **Firestore Database**.
    * **Regras de Segurança (Rules):**
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
    * Ao rodar pela primeira vez, o sistema irá criar automaticamente a coleção de usuários baseada na lista `GERENTES_PADRAO` dentro do `app.js`.

---

## 📸 Galeria

| Modo Kanban | Modo Lista |
| :---: | :---: |
| ![Kanban](https://via.placeholder.com/400x250.png?text=Kanban+Drag+Drop) | ![Lista](https://via.placeholder.com/400x250.png?text=Lista+Clean+UI) |

| Chat Interno | Modo Escuro |
| :---: | :---: |
| ![Chat](https://via.placeholder.com/400x250.png?text=Chat+e+Historico) | ![Dark Mode](https://via.placeholder.com/400x250.png?text=Dark+Mode+Verde) |

---

*Desenvolvido para T3 Imóveis - 2026*