const form = document.querySelector('form');
const emailInput = document.querySelector('#email');
const senhaInput = document.querySelector('#senha');

form.addEventListener('submit', function(evento) {
    evento.preventDefault();

    if (emailInput.value === "" || senhaInput.value === "") {
        document.querySelector('#erro').textContent = 'Preencha Todos os Campos';
    }
    else if (senhaInput.value.length < 8) {
        document.querySelector('#erro').textContent = 'A Senha precisa ter pelo menos 8 Caracteres';
    }
    else { 
        document.querySelector('#sucesso').textContent = 'Muito Bem!';
    }

});