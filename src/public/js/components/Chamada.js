const Chamada = {
  props: ["disciplina"],
  template: `
    <div class="area-chamada">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>Chamada: {{ disciplina.toUpperCase() }}</h3>
            <button @click="$emit('voltar')" style="padding: 5px 10px">Voltar</button>
        </div>
        <p><strong>Data:</strong> {{ dataAtual }}</p>
        <table>
            <thead><tr><th>Aluno</th><th>Status</th></tr></thead>
            <tbody>
                <tr v-for="aluno in alunos" :key="aluno.nome">
                    <td>{{ aluno.nome }}</td>
                    <td>
                        <button class="btn-presenca" :class="{ 'presente': aluno.presente === true, 'ausente': aluno.presente === false }" @click="marcar(aluno)">
                            {{ aluno.presente === true ? 'Presente' : (aluno.presente === false ? 'Ausente' : 'Marcar') }}
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="alunos.length > 0" style="margin-top: 20px">
            <button @click="salvar" class="btn-salvar">Salvar no Dispositivo</button>
            <span v-if="feedback" class="feedback">{{ feedback }}</span>
        </div>
    </div>`,

  data() {
    return {
      alunos: [],
      dataAtual: new Date().toLocaleDateString("pt-BR"),
      feedback: "",
    };
  },

  async mounted() {
    const dados = await GET("/disciplinas/" + this.disciplina);
    this.alunos = dados.map((a) => ({ nome: a.aluno, presente: null }));
  },
  methods: {
    marcar(aluno) {
      aluno.presente = aluno.presente === true ? false : true;
    },
    async salvar() {
      const db = new PouchDB(this.disciplina);
      const docs = this.alunos.map((aluno) => ({
        _id: `${this.dataAtual}_${aluno.nome}`,
        aluno: aluno.nome,
        data: this.dataAtual,
        presente: aluno.presente,
        tipo: "chamada",
        sincronizado: false,
      }));
      try {
        for (const doc of docs) {
          try {
            const ex = await db.get(doc._id);
            doc._rev = ex._rev;
          } catch (e) {}
          await db.put(doc);
        }
        this.feedback = "Salvo localmente!";
        this.$emit("salvo");
        setTimeout(() => (this.feedback = ""), 3000);
      } catch (e) {
        this.feedback = "Erro ao salvar.";
      }
    },
  },
};

const chamadaStyle = document.createElement("style");

chamadaStyle.textContent = `
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    .btn-presenca { padding: 5px 10px; cursor: pointer; border: 1px solid #ccc; border-radius: 3px; }
    .presente { background-color: #d4edda; color: #155724; }
    .ausente { background-color: #f8d7da; color: #721c24; }
    .btn-salvar { background-color: #333; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    .feedback { margin-left: 15px; font-weight: bold; color: #28a745; }
`;
document.head.appendChild(chamadaStyle);
