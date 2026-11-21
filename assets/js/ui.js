(function() {
    let toastTimer;
    function ensureToast() {
        let toast = document.querySelector("#melToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "melToast";
            toast.className = "mel-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }
        return toast;
    }
    window.showToast = function(message, type = "success", duration = 3600) {
        const toast = ensureToast();
        const icons = {
            success: "✓", error: "×", warning: "!", info: "i"
        }
        ;
        toast.className = `mel-toast mel-toast-${type}`;
        toast.innerHTML = `<span class="mel-toast-icon">${icons[type] || "✓"}</span><span class="mel-toast-message"></span><button class="mel-toast-close" aria-label="Fechar">×</button>`;
        toast.querySelector(".mel-toast-message").textContent = message;
        toast.classList.add("is-visible");
        toast.querySelector(".mel-toast-close").onclick = () => toast.classList.remove("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("is-visible"), duration);
    }
    ;
    window.showConfirmDialog = function(options = {
    }
    ) {
        const {
            title = "Confirmar ação", message = "Deseja continuar?", confirmText = "Continuar", cancelText = "Cancelar", danger = false
        }
        = options;
        return new Promise(resolve => {
            const overlay = document.createElement("div");
            overlay.className = "mel-dialog-overlay";
            overlay.innerHTML = `<section class="mel-dialog" role="dialog" aria-modal="true" aria-labelledby="melDialogTitle"><div class="mel-dialog-symbol ${danger ? "is-danger": ""}">${danger ? "!": "?"}</div><h2 id="melDialogTitle"></h2><p class="mel-dialog-message"></p><div class="mel-dialog-actions"><button type="button" class="mel-dialog-cancel"></button><button type="button" class="mel-dialog-confirm ${danger ? "is-danger": ""}"></button></div></section>`;
            overlay.querySelector("#melDialogTitle").textContent = title;
            overlay.querySelector(".mel-dialog-message").textContent = message;
            overlay.querySelector(".mel-dialog-cancel").textContent = cancelText;
            overlay.querySelector(".mel-dialog-confirm").textContent = confirmText;
            const hadModalOpen = document.body.classList.contains("modal-open");
            const finish = (value) => {
                overlay.remove();
                if (!hadModalOpen) document.body.classList.remove("modal-open");
                resolve(value);
            }
            ;
            overlay.querySelector(".mel-dialog-cancel").onclick = () => finish(false);
            overlay.querySelector(".mel-dialog-confirm").onclick = () => finish(true);
            overlay.addEventListener("click", event => {
                if (event.target === overlay) finish(false);
            }
            );
            document.addEventListener("keydown", function esc(event) {
                if (event.key === "Escape" && document.body.contains(overlay)) {
                    finish(false);
                    document.removeEventListener("keydown", esc);
                }
            }
            );
            document.body.appendChild(overlay);
            document.body.classList.add("modal-open");
            overlay.querySelector(".mel-dialog-cancel").focus();
        }
        );
    }
    ;
}
) ();
