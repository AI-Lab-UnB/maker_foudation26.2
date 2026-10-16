# Explicação - Escrita negada sem login e aceita com login
Ficou configurado Authentication Emulator do Firebase para se poder enviar o recado na página. A escrita é permitida apenas quando o usuário tem acesso via login (usando o `request.auth != null`.  
Quando o usuário tenta enviar um recado sem estar logado, se é lançado um `permission-denied`. Após o login, o usuário tem a permissão para enviar um recado.  
Ou seja, leitura é para qualquer usuário e envio de recados apenas para usuários logados.
