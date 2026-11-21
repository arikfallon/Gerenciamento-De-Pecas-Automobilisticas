const USER_KEY = "melMotoLoggedUser",
USERS_KEY = "melMotoUsers";
const username = localStorage.getItem(USER_KEY);
const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const user = users.find(u => u.username === username);
if (!username || !user) {
    location.href = "./login.html";
}
else {
    document.querySelector("#currentUserName").textContent = user.name;
}
document.querySelector("#logoutButton").addEventListener("click", () => {
    localStorage.removeItem(USER_KEY);
    location.href = "./login.html";
}
);
const sales = JSON.parse(localStorage.getItem(`melMotoSales_${username}`) || "[]");
const money = n => Number(n || 0).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL"
}
);
let period = "today";
function dateOnly(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function matches(s) {
    const d = new Date(s.createdAt || `${s.date}T12:00:00`);
    const now = new Date();
    if (period === "all") return true;
    if (period === "today") return d.toDateString() === now.toDateString();
    if (period === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    const monday = dateOnly(now);
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    return dateOnly(d) >= monday && dateOnly(d) <= dateOnly(now);
}
function render() {
    const rows = sales.filter(matches).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    document.querySelector("#periodRevenue").textContent = money(rows.reduce((t, s) => t + Number(s.total || 0), 0));
    document.querySelector("#periodUnits").textContent = rows.reduce((t, s) => t + Number(s.quantity || 0), 0);
    document.querySelector("#periodCount").textContent = rows.length;
    document.querySelector("#salesHeading").textContent = {
        today: "Vendas de hoje",
        week: "Vendas desta semana",
        month: "Vendas deste mês",
        all: "Todas as vendas"
    }
    [period];
    const table = document.querySelector("#salesTable");
    table.innerHTML = "";
    if (!rows.length) {
        table.innerHTML = '<tr><td colspan="5" class="empty-table">Nenhuma venda encontrada neste período.</td></tr>';
        return;
    }
    rows.forEach(s => {
        const tr = document.createElement("tr");
        const dt = new Date(s.createdAt || `${s.date}T12:00:00`);
        tr.innerHTML = `<td>${dt.toLocaleDateString("pt-BR")} ${dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td><td><strong>${String(s.productName || "").replaceAll("<", "&lt;")}</strong></td><td>${s.quantity}</td><td>${money(s.unitPrice)}</td><td><strong>${money(s.total)}</strong></td>`;
        table.appendChild(tr);
    }
    );
}
document.querySelectorAll(".period-button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".period-button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    period = b.dataset.period;
    render();
}
));
render();
