const KEY = "melMotoUsers";
function users() {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
    const first = [{
        username: "priscila", password: "1234", name: "Priscila"
    }
    ];
    localStorage.setItem(KEY, JSON.stringify(first));
    return first;
}
document.querySelector("#registerForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = document.querySelector("#registerName").value.trim();
    const username = document.querySelector("#registerUsername").value.trim().toLowerCase();
    const password = document.querySelector("#registerPassword").value;
    const confirm = document.querySelector("#confirmPassword").value;
    const message = document.querySelector("#registerMessage");
    const list = users();
    if (password !== confirm) {
        message.textContent = "As senhas não coincidem.";
        message.className = "form-message error";
        return;
    }
    if (list.some(u => u.username.toLowerCase() === username)) {
        message.textContent = "Este usuário já está cadastrado.";
        message.className = "form-message error";
        return;
    }
    list.push({
        username, password, name
    }
    );
    localStorage.setItem(KEY, JSON.stringify(list));
    localStorage.setItem("melMotoLoggedUser", username);
    message.textContent = "Cadastro realizado com sucesso!";
    message.className = "form-message";
    window.location.href = "./gerenciamento.html";
}
);
