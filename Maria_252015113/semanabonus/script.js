document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const errorDiv = document.getElementById('errorMessage');

    // Validação
    if (!email || !senha) {
        errorDiv.textContent = "Preencha todos os campos.";
        // Efeito de tremor para feedback visual (opcional)
        document.querySelector('.login-container').animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });
        return;
    }

    if (senha.length < 8) {
        errorDiv.textContent = "A senha deve ter pelo menos 8 caracteres.";
        return;
    }

    errorDiv.textContent = "";
    alert("Sessão iniciada com sucesso!");
});

document.getElementById('togglePassword').addEventListener('click', function () {
    const senhaInput = document.getElementById('senha');

    if (senhaInput.type === 'password') {
        // Altera para texto e atualiza o botão
        senhaInput.type = 'text';
        this.textContent = 'OCULTAR';
    } else {
        // Retorna para senha oculta e atualiza o botão
        senhaInput.type = 'password';
        this.textContent = 'MOSTRAR';
    }
});