const USERS_KEY = "melMotoUsers";
function getUsers() {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) return JSON.parse(savedUsers);
    const initialUsers = [{
        username: "priscila", password: "1234", name: "Priscila"
    }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
}
document.querySelector("#loginForm").addEventListener("submit", event => {
    event.preventDefault();
    const username = document.querySelector("#loginUser").value.trim().toLowerCase();
    const password = document.querySelector("#loginPassword").value;
    const message = document.querySelector("#loginMessage");
    const user = getUsers().find(item => item.username.toLowerCase() === username && item.password === password);
    if (!user) {
        message.textContent = "Usuário ou senha incorretos.";
        message.className = "form-message error";
        showToast("Usuário ou senha incorretos.", "error");
        return;
    }
    localStorage.setItem("melMotoLoggedUser", user.username);
    window.location.href = "./gerenciamento.html";
}
);
const recoveryLink = document.createElement("button");
recoveryLink.type = "button";
recoveryLink.className = "recover-password-link";
recoveryLink.textContent = "Esqueci minha senha";
document.querySelector("#loginForm").appendChild(recoveryLink);
recoveryLink.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.className = "mel-dialog-overlay";
    overlay.innerHTML = `
        <section class="mel-dialog mel-recovery-dialog" role="dialog" aria-modal="true" aria-labelledby="recoveryTitle">
            <button type="button" class="mel-recovery-close" aria-label="Fechar">×</button>
            <div class="mel-dialog-symbol">↻</div>
            <h2 id="recoveryTitle">Recuperar senha</h2>
            <p class="mel-dialog-message">Informe seu nome de usuário e crie uma nova senha.</p>
            <form class="mel-recovery-form">
                <label>Usuário<input name="username" required autocomplete="username" placeholder="Seu usuário"></label>
                <label>Nova senha<input name="password" type="password" required minlength="4" placeholder="Mínimo de 4 caracteres"></label>
                <label>Confirmar senha<input name="confirmPassword" type="password" required minlength="4" placeholder="Repita a senha"></label>
                <p class="mel-recovery-warning">Como esta versão guarda os dados no navegador, a recuperação é apenas demonstrativa e não confirma sua identidade.</p>
                <div class="mel-dialog-actions"><button type="button" class="mel-dialog-cancel">Cancelar</button><button type="submit" class="mel-dialog-confirm">Redefinir senha</button></div>
            </form>
        </section>`;
    const close = () => {
        overlay.remove();
        document.body.classList.remove("modal-open");
    }
    ;
    overlay.querySelector(".mel-recovery-close").addEventListener("click", close);
    overlay.querySelector(".mel-dialog-cancel").addEventListener("click", close);
    overlay.addEventListener("click", event => {
        if (event.target === overlay) close();
    }
    );
    overlay.querySelector(".mel-recovery-form").addEventListener("submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const username = form.elements.username.value.trim().toLowerCase();
        const password = form.elements.password.value;
        const confirmPassword = form.elements.confirmPassword.value;
        const userList = getUsers();
        const account = userList.find(item => item.username.toLowerCase() === username);
        if (!account) {
            showToast("Usuário não encontrado.", "error");
            return;
        }
        if (password !== confirmPassword) {
            showToast("As senhas não coincidem.", "error");
            return;
        }
        if (password.length < 4) {
            showToast("A senha precisa ter pelo menos 4 caracteres.", "warning");
            return;
        }
        account.password = password;
        localStorage.setItem(USERS_KEY, JSON.stringify(userList));
        close();
        showToast("Senha redefinida com sucesso!", "success");
    }
    );
    document.body.appendChild(overlay);
    document.body.classList.add("modal-open");
    overlay.querySelector("input[name=username]").focus();
}
);
