/* =========================================================================
   Semana Bonus - Fase 3: O Portao de Entrada
   Validacao de login simulado no frontend (sem envio a servidor).
   ========================================================================= */

const SENHA_MINIMA = 8;

const form = document.getElementById("login-form");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const erroEl = document.getElementById("form-erro");
const sucessoEl = document.getElementById("form-sucesso");
const botaoToggleSenha = document.getElementById("toggle-senha");

function mostrarErro(mensagem) {
  sucessoEl.hidden = true;
  erroEl.textContent = mensagem;
  erroEl.hidden = false;
}

function mostrarSucesso(mensagem) {
  erroEl.hidden = true;
  sucessoEl.textContent = mensagem;
  sucessoEl.hidden = false;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const email = campoEmail.value.trim();
  const senha = campoSenha.value;

  if (!email || !senha) {
    mostrarErro("Preencha e-mail e senha para continuar.");
    return;
  }

  if (!emailValido(email)) {
    mostrarErro("Digite um e-mail válido.");
    return;
  }

  if (senha.length < SENHA_MINIMA) {
    mostrarErro(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
    return;
  }

  mostrarSucesso("Login simulado com sucesso! Nenhum dado foi enviado a um servidor.");
  form.reset();
  campoSenha.type = "password";
  botaoToggleSenha.textContent = "Mostrar";
  botaoToggleSenha.setAttribute("aria-pressed", "false");
});

botaoToggleSenha.addEventListener("click", () => {
  const senhaVisivel = campoSenha.type === "text";
  campoSenha.type = senhaVisivel ? "password" : "text";
  botaoToggleSenha.textContent = senhaVisivel ? "Mostrar" : "Ocultar";
  botaoToggleSenha.setAttribute("aria-pressed", String(!senhaVisivel));
});
