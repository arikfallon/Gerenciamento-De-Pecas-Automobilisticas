const EMAIL_DESTINO_CONTATO = "email-do-proprietario@exemplo.com";
const contactModal = document.querySelector("#contactModal");
const openContact = () => {
    contactModal.classList.add("is-open");
    contactModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.querySelector("#contactName").focus();
}
;
const closeContact = () => {
    contactModal.classList.remove("is-open");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}
;
document.querySelectorAll("[data-contact-open]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    openContact();
}
));
document.querySelectorAll("[data-contact-close]").forEach(button => button.addEventListener("click", closeContact));
contactModal.addEventListener("click", event => {
    if (event.target === contactModal) closeContact();
}
);
document.querySelector("#contactForm").addEventListener("submit", event => {
    event.preventDefault();
    if (!EMAIL_DESTINO_CONTATO.trim()) {
        showToast("O contato ainda precisa ser configurado com o e-mail do proprietário.", "warning", 5000);
        return;
    }
    const name = document.querySelector("#contactName").value.trim();
    const email = document.querySelector("#contactEmail").value.trim();
    const message = document.querySelector("#contactMessage").value.trim();
    const subject = encodeURIComponent(`Contato do site Mel Moto Peças — ${name}`);
    const body = encodeURIComponent(`Nome: ${name}
E-mail: ${email}

Mensagem:
${message}`);
    window.location.href = `mailto:${EMAIL_DESTINO_CONTATO}?subject=${subject}&body=${body}`;
    closeContact();
}
);
