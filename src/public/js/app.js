const { createApp } = Vue;
const nomesDisciplinas = new PouchDB("lista");
const COUCHDB_URL = "http://admin:123@localhost:5984";

createApp({
    components: { Login, Dashboard, Chamada },
    data() {
        return {
            autenticado: !!localStorage.getItem("token"),
            listaDisciplinasNomes: [],
            isOnline: navigator.onLine,
            disciplinaSelecionada: null,
            sincronizacaoPendente: false,
            syncIntervalId: null
        };
    },
    async mounted() {
        if (this.autenticado) {
            token = localStorage.getItem("token");
            await this.atualizarListaLocal();
            await this.verificarPendencias();
        }
        window.addEventListener("online", () => {
            this.isOnline = true;
            this.sincronizar().then(s => { if (!s) this.iniciarTimer(); });
        });
        window.addEventListener("offline", () => this.isOnline = false);
    },
    methods: {
        onLogin(t) {
            token = t;
            localStorage.setItem("token", t);
            this.autenticado = true;
            this.atualizarListaLocal().then(() => this.verificarPendencias());
        },
        logout() {
            localStorage.removeItem("token");
            token = "";
            this.autenticado = false;
            this.disciplinaSelecionada = null;
        },
        async configurar() {
            const lista = await GET("/disciplinas");
            if (!lista) return;
            const doc = { _id: "0", lista };
            try { const ex = await nomesDisciplinas.get("0"); doc._rev = ex._rev; } catch(e){}
            await nomesDisciplinas.put(doc);
            for (const d of lista) { new PouchDB(d); }
            await this.atualizarListaLocal();
            await this.verificarPendencias();
        },
        async atualizarListaLocal() {
            try {
                const res = await nomesDisciplinas.get("0");
                this.listaDisciplinasNomes = res.lista;
            } catch(e) { this.listaDisciplinasNomes = []; }
        },
        async sincronizar() {
            if (!this.isOnline) return false;
            let tudoOk = true;
            for (const nome of this.listaDisciplinasNomes) {
                const localDB = new PouchDB(nome);
                const remoteDB = new PouchDB(`${COUCHDB_URL}/${nome}`);
                
                try {
                    // Replicação nativa do PouchDB para o CouchDB
                    await localDB.replicate.to(remoteDB);
                    
                    // Após a replicação, marcamos os documentos locais como sincronizados
                    // para manter a lógica da UI (opcional, mas mantém compatibilidade)
                    const res = await localDB.allDocs({ include_docs: true });
                    const pendentes = res.rows.map(r => r.doc).filter(d => d.tipo === "chamada" && !d.sincronizado);
                    for (const d of pendentes) {
                        d.sincronizado = true;
                        await localDB.put(d);
                    }
                } catch(e) { 
                    console.error(`Erro ao sincronizar ${nome}:`, e);
                    tudoOk = false; 
                }
            }
            if (tudoOk) {
                this.sincronizacaoPendente = false;
                if (this.syncIntervalId) { clearInterval(this.syncIntervalId); this.syncIntervalId = null; }
            }
            return tudoOk;
        },
        iniciarTimer() {
            if (this.syncIntervalId) return;
            this.syncIntervalId = setInterval(() => this.sincronizar(), 20000);
        },
        async verificarPendencias() {
            let tem = false;
            for (const nome of this.listaDisciplinasNomes) {
                const db = new PouchDB(nome);
                const res = await db.allDocs({ include_docs: true });
                if (res.rows.some(r => r.doc.tipo === 'chamada' && !r.doc.sincronizado)) { tem = true; break; }
            }
            this.sincronizacaoPendente = tem;
            if (tem) this.iniciarTimer();
        },
        async onSalvo() {
            this.sincronizacaoPendente = true;
            if (!(await this.sincronizar())) this.iniciarTimer();
        }
    }
}).mount("#app");

const appStyle = document.createElement('style');
appStyle.textContent = `
    body { font-family: sans-serif; margin: 0; background-color: #f0f2f5; display: flex; justify-content: center; padding-top: 50px; }
    #app { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); width: 100%; max-width: 600px; }
    .header-dash { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
    .btn-logout { background-color: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
    .status-conexao { margin-top: 30px; font-size: 0.85em; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
`;
document.head.appendChild(appStyle);
