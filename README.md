# Sistema de Controle de Pendências e Agendamentos - LYX/T3

Este é um sistema Web (Single Page Application) desenvolvido para gerenciar pendências operacionais entre Gerentes e Administrador, além de permitir o agendamento de reuniões presenciais.

## 🚀 Funcionalidades

### Perfil: Administrador
* **Gestão de Pendências:** Cadastra novas pendências (Título + Descrição Detalhada) atribuindo a um gerente específico.
* **Aprovação:** Aprova ou Recusa a resolução de problemas enviada pelos gerentes.
* **Visão Geral:** Visualiza todas as pendências de todos os gerentes.
* **Relatórios:** Exporta relatório completo em Excel (.xlsx) contendo Título, Descrição e ID.
* **Agenda:** Recebe solicitações de agendamento, podendo aceitar, recusar ou excluir.
* **Notificações:** Recebe alertas via E-mail e WhatsApp quando um gerente solicita agendamento.

### Perfil: Gerente
* **Privacidade:** Visualiza **apenas** as pendências atribuídas a ele.
* **Resolução:** Marca pendências como "Resolvidas" (envia para aprovação do Admin).
* **Agendamento:** Solicita presença do Admin escolhendo data e hora.

## 🛠 Tecnologias Utilizadas
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Banco de Dados:** Google Firebase (Firestore).
* **Autenticação:** Google Firebase Auth (Email/Senha).
* **E-mails:** EmailJS (Envio automático de notificações).
* **Relatórios:** SheetJS (Exportação para Excel).

## ⚙️ Configuração Necessária

Para o sistema funcionar, é necessário configurar as chaves de API no arquivo `app.js`:

1.  **Firebase:** Substitua `const firebaseConfig` com as chaves do seu projeto no console do Firebase.
2.  **EmailJS:** Substitua `emailjs.init("SUA_PUBLIC_KEY")` e os IDs de Serviço/Template nas funções de envio.
3.  **Cadastro de Gerentes:** Atualize a constante `CADASTRO_GERENTES` com os e-mails reais de login dos gerentes para que o sistema de privacidade funcione.

## 📱 Utilização

1.  Acesse o link hospedado.
2.  Faça login com e-mail e senha cadastrados no Firebase Authentication.
3.  O sistema detectará automaticamente se você é Admin ou Gerente e ajustará a interface.