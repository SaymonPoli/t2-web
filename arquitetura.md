# Arquitetura e Plano de Implementação - T2 (Sistema de Controle de Presença)

Este documento detalha a arquitetura do sistema e a estrutura de arquivos do Trabalho 2 (T2) da disciplina de Programação para Web.

## 1. Arquitetura do Sistema

O sistema segue o modelo Cliente/Servidor, com suporte a funcionamento offline (Offline-First) utilizando PouchDB no cliente e CouchDB no servidor.

### 1.1 Frontend (Aplicação Cliente)
A aplicação foi modularizada em componentes Vue.js para melhor organização, sem a necessidade de ferramentas de build complexas.

- **Tecnologias:** Vue.js 3, PouchDB, HTML5, CSS (encapsulado nos componentes).
- **Estrutura de Arquivos e Responsabilidades:**
    - `src/public/index.html`: Ponto de entrada que carrega as bibliotecas e monta a aplicação.
    - `src/public/js/app.js`: Instância raiz do Vue, gerenciamento de estado global (autenticação, conectividade), lógica de sincronização automática e estilos globais.
    - `src/public/js/components/Login.js`: Componente de autenticação e estilos da tela de login.
    - `src/public/js/components/Dashboard.js`: Lista de disciplinas e botões de configuração inicial.
    - `src/public/js/components/Chamada.js`: Lógica de registro de presença, salvamento local no PouchDB e estilos da tabela de chamada.
    - `src/public/rede.js`: Funções auxiliares para requisições Fetch (GET/POST) com `BASE_URL` configurado para permitir execução independente do servidor.

- **Sincronização Automática:**
    - **Imediata:** Tentativa de envio ao servidor logo após o salvamento local.
    - **Temporizada:** Caso falhe ou esteja offline, um timer em `app.js` tenta sincronizar a cada 20 segundos.
    - **Status:** Indicadores visuais de "Sincronizado" ou "Pendente" baseados na flag `sincronizacaoPendente`.

### 1.2 Backend (Servidor Node.js)
- **Localização:** `src/servidor.js`
- **Tecnologias:** Node.js, Express, jsonwebtoken (JWT), Nano (CouchDB driver).
- **Funcionalidades:**
    - Autenticação via JWT (Rota `/login`).
    - API de Sincronização (Rota `/sync/:disciplina`).
    - Listagem de Disciplinas e Alunos (Rotas `/disciplinas`).
    - Interface Administrativa (Rota `/admin`): Retorna o consolidado de presenças para a coordenação.

### 1.3 Banco de Dados
- **Local:** PouchDB (no navegador do professor).
- **Remoto:** CouchDB rodando via Docker (`src/docker-compose.yml`).
- **Persistência:** Documentos no formato `{ aluno, data, presente, tipo: "chamada", sincronizado: boolean }`.

## 2. Instruções de Execução

1.  **Banco de Dados:** `cd src && docker compose up -d`
2.  **Backend:** `cd src && npm run dev` (roda na porta 7000)
3.  **Frontend:** Pode ser servido pelo Node (http://localhost:7000) ou de forma independente via Live Server/http-server para testes de desconexão.
4.  **Inicialização:** Acesse `http://localhost:7000/init` uma única vez para criar os bancos no CouchDB.

## 3. Modificações no .gitignore

```gitignore
node_modules/
.env
*.log
.DS_Store
```
