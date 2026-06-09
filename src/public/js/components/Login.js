const Login = {
    template: `
    <div class="login-container">
        <h2 style="text-align: center; margin-top: 0">Login do Professor</h2>
        <input v-model="email" type="email" placeholder="E-mail profissional" />
        <input v-model="senha" type="password" placeholder="Senha" />
        <button @click="entrar">Entrar no Sistema</button>
        <p v-if="erro" class="erro">{{ erro }}</p>
    </div>`,
    data() { return { email: "", senha: "", erro: "" }; },
    methods: {
        async entrar() {
            this.erro = "";
            try {
                const dados = await POST("/login", { email: this.email, senha: this.senha });
                if (dados?.token) this.$emit("login-sucesso", dados.token);
                else this.erro = "E-mail ou senha incorretos.";
            } catch (e) { this.erro = "Erro ao conectar com o servidor."; }
        }
    }
};

const loginStyle = document.createElement('style');
loginStyle.textContent = `
    .login-container { display: flex; flex-direction: column; gap: 15px; }
    .login-container input { padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
    .login-container button { padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
    .login-container button:hover { background-color: #0056b3; }
    .erro { color: red; font-size: 14px; }
`;
document.head.appendChild(loginStyle);
