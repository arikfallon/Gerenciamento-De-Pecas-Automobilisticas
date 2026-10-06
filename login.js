const USERS_KEY = "melMotoUsers";

function getUsers() {
    const saved = localStorage.getItem(USERS_KEY);

    if (saved) {
        return JSON.parse(saved);
    }

    // Usuários de demonstração.
    // Em um sistema real, usuários e senhas devem ficar no backend.
    const defaultUsers = [
        { username: "joao", password: "1234", name: "João" },
        { username: "maria", password: "1234", name: "Maria" }
    ];

    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
}

document.querySelector("#loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.querySelector("#loginUser").value.trim().toLowerCase();
    const password = document.querySelector("#loginPassword").value;
    const message = document.querySelector("#loginMessage");

    const user = getUsers().find(
        item => item.username.toLowerCase() === username &&
                item.password === password
    );

    if (!user) {
        message.textContent = "Usuário ou senha incorretos.";
        message.className = "form-message error";
        return;
    }

    localStorage.setItem("melMotoLoggedUser", user.username);
    window.location.href = "./index.html";
});
