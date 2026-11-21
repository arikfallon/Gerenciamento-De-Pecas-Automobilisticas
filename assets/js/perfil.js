// ============================================================
// MEL MOTO PEÇAS — Perfil do usuário
// ============================================================

const USERS_KEY = "melMotoUsers";
const LOGGED_USER_KEY = "melMotoLoggedUser";

const username = localStorage.getItem(LOGGED_USER_KEY);
let users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
let user = users.find(item => item.username === username);

if (!user) {
    window.location.href = "./login.html";
} else {
    document.querySelector("#currentUserName").textContent = user.name;
    document.querySelector("#profileName").value = user.name;
    document.querySelector("#profileUsername").value = user.username;
}

// Encerrar sessão
 document.querySelector("#logoutButton").addEventListener("click", () => {
    localStorage.removeItem(LOGGED_USER_KEY);
    window.location.href = "./login.html";
});

// Salvar alterações de nome e senha
 document.querySelector("#profileForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.querySelector("#profileName").value.trim();
    const password = document.querySelector("#profilePassword").value;
    const passwordConfirm = document.querySelector("#profilePasswordConfirm").value;
    const message = document.querySelector("#profileMessage");

    if (password && password !== passwordConfirm) {
        message.textContent = "As senhas não coincidem.";
        message.className = "form-message error";
        showToast("As senhas não coincidem.", "error");
        return;
    }

    if (password && password.length < 4) {
        message.textContent = "A senha deve ter pelo menos 4 caracteres.";
        message.className = "form-message error";
        showToast("A senha deve ter pelo menos 4 caracteres.", "warning");
        return;
    }

    user.name = name;
    if (password) user.password = password;

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    message.textContent = "Perfil atualizado com sucesso.";
    message.className = "form-message";
    document.querySelector("#currentUserName").textContent = name;
    document.querySelector("#profilePassword").value = "";
    document.querySelector("#profilePasswordConfirm").value = "";
    showToast("Perfil atualizado com sucesso!", "success");
});


// Excluir conta após confirmação personalizada
 document.querySelector("#deleteAccount").addEventListener("click", async () => {
    const confirmed = await showConfirmDialog({
        title: "Excluir sua conta?",
        message: "A conta, os produtos e as vendas locais deste usuário serão excluídos. Esta ação não pode ser desfeita.",
        confirmText: "Excluir conta",
        cancelText: "Manter conta",
        danger: true
    });

    if (!confirmed) return;

    localStorage.setItem(USERS_KEY, JSON.stringify(users.filter(item => item.username !== username)));
    localStorage.removeItem(`melMotoProducts_${username}`);
    localStorage.removeItem(`melMotoSales_${username}`);
    localStorage.removeItem(LOGGED_USER_KEY);
    window.location.href = "./index.html";
});
