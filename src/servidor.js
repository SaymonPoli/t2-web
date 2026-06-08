const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nano = require("nano")("http://admin:123@localhost:5984");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use("/scripts/vue", express.static(__dirname + "/node_modules/vue/dist/"));
app.use(
  "/scripts/pouchdb",
  express.static(__dirname + "/node_modules/pouchdb/dist/"),
);

const SECRET = "segredo";
const PORT = 7000;

// Dados iniciais do sistema
const professores = [
  {
    id: "fabio",
    email: "fabio@ufsc.br",
    senha: "123",
    disciplinas: ["dec0007", "dec0020", "dec0040"],
  },
  {
    id: "joao",
    email: "joao@ufsc.br",
    senha: "123",
    disciplinas: ["dec0001", "dec0002", "dec0003"],
  },
];

const dec0007 = [
  { aluno: "Ana maria", aulas: [] },
  { aluno: "pedro", aulas: [] },
  { aluno: "cintia", aulas: [] },
];
const dec0020 = [
  { aluno: "Ana maria", aulas: [] },
  { aluno: "pedro", aulas: [] },
  { aluno: "cintua", aulas: [] },
];
const semestre = [
  { disciplina: "dec0007", dados: dec0007 },
  { disciplina: "dec0020", dados: dec0020 },
];

// --- Auxiliares do Banco de Dados ---
async function inicializarBancos() {
  try {
    const listaBancos = await nano.db.list();
    const obrigatorios = ["_users", "_replicator", "_global_changes"];

    for (const db of obrigatorios) {
      if (!listaBancos.includes(db)) await nano.db.create(db);
    }

    for (const prof of professores) {
      for (const disc of prof.disciplinas) {
        if (!listaBancos.includes(disc)) await nano.db.create(disc);
      }
    }
  } catch (e) {
    // Silencioso em produção, ou logar apenas erro fatal
  }
}

// --- Middleware e Autenticação ---
function autenticar(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send("Sem token");
  try {
    const decoded = jwt.verify(auth.split(" ")[1], SECRET);
    req.usuario = decoded.id;
    next();
  } catch {
    res.status(401).send("Token inválido");
  }
}

// --- Rotas API ---
app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const prof = professores.find((p) => p.email === email && p.senha === senha);
  if (!prof) return res.status(401).send("Login inválido");
  res.json({ token: jwt.sign({ id: prof.id }, SECRET) });
});

app.get("/init", async (req, res) => {
  await inicializarBancos();
  res.send("OK");
});

app.get("/disciplinas", autenticar, (req, res) => {
  const prof = professores.find((p) => p.id === req.usuario);
  res.send(prof ? prof.disciplinas : []);
});

app.get("/disciplinas/:disciplina", autenticar, (req, res) => {
  const d = semestre.find((s) => s.disciplina === req.params.disciplina);
  res.send(d ? d.dados : []);
});

app.get("/admin", async (req, res) => {
  try {
    const list = await nano.db.list();
    const dbNames = list.filter((name) => name.startsWith("dec"));
    let allPresences = [];

    for (const dbName of dbNames) {
      const db = nano.use(dbName);
      const result = await db.list({ include_docs: true });
      allPresences = allPresences.concat(
        result.rows.map((row) => ({ ...row.doc, disciplina: dbName })),
      );
    }
    res.json(allPresences);
  } catch (err) {
    res.status(500).send("Erro");
  }
});

app.post("/sync/:disciplina", autenticar, async (req, res) => {
  const { disciplina } = req.params;
  const prof = professores.find((p) => p.id === req.usuario);

  if (!prof || !prof.disciplinas.includes(disciplina))
    return res.status(403).send("Acesso Negado");

  try {
    const db = nano.use(disciplina);
    const docs = req.body.docs;

    const docsComRev = await Promise.all(
      docs.map(async (doc) => {
        try {
          const existente = await db.get(doc._id);
          return { ...doc, _rev: existente._rev };
        } catch (e) {
          return doc;
        }
      }),
    );

    const response = await db.bulk({ docs: docsComRev });
    res.json({ message: "OK", details: response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`),
);
