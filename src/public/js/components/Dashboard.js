const Dashboard = {
    props: ["disciplinas"],
    template: `
    <div>
        <div class="area-botoes">
            <button @click="$emit('sincronizar')">Sincronizar Agora</button>
            <button @click="$emit('configurar')" style="background: #28a745">Baixar do servidor</button>
        </div>
        <h3>Minhas Disciplinas</h3>
        <div v-for="nome in disciplinas" :key="nome" class="disciplina-item">
            <span style="font-weight: bold">{{ nome.toUpperCase() }}</span>
            <button @click="$emit('selecionar', nome)" class="btn-chamada">Fazer Chamada</button>
        </div>
        <p v-if="disciplinas.length === 0" style="color: #666">Nenhuma disciplina carregada. Clique em "Iniciar Semestre".</p>
    </div>`,
};

const dashStyle = document.createElement("style");

dashStyle.textContent = `
    .area-botoes { margin-bottom: 20px; }
    .area-botoes button { margin-right: 10px; padding: 8px 12px; cursor: pointer; background: #6c757d; color: white; border: none; border-radius: 4px; }
    .disciplina-item { border: 1px solid #eee; padding: 15px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; }
    .btn-chamada { background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
`;

document.head.appendChild(dashStyle);
