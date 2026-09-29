# Docker
## Container 
Um container é um pacote de Software que agrupa todos os elementos necessários para fazer uma aplicação rodar, sem que ela dependa do sistema operacional da qual ela foi gerada, podendo incluir bibliotecas de software, arquivos de configuração e até binário executáveis. 
### Vantagens 
- Portabilidade (é possível mudar a aplicação de um sistema operacional para o outro sem se preocupar com compatibilidade). Isso resolve o problema de "só funciona na minha máquina".
- Praticidade

**ATENÇÃO**:
Docker não é uma máquina virtual, ele utiliza os próprios recursos operacionais do qual ele está rodando para subir os containers como se fosse simples "apps"

### Conceitos importantes

**Imagens**: São pacotes de imagens que são feitas para serem utilizadas com o docker.

**Container**: São as imagens em execução.

**DockerHub**: é o local onde é possível encontrar essas imagens.

### Comandos

**docker ps**: Serve para ver o status do seu container

CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

**docker pull hello-world**: puxa uma imagem do registro

**docker images**: o Docker mostra as imagens que já estão baixadas no computador

**docker rmi nome_imagem/id**: remove a imagem 

**docker run nome_imagem**: comando de execução

**docker stats**: conferir se o comando está rodando e os recursos que estão sendo utilizados.

**docker system prune**: apaga o que não está sem utilizado, é necessário tomar cuidado com a utilização desse comando.

### Mapeamento de portas com -p.
**-O Conceito Central**: Como os contêineres rodam em um ambiente de rede totalmente isolado, você precisa criar uma "ponte" entre o seu computador (host) e o contêiner. O -p faz exatamente esse redirecionamento de tráfego.

**-A Sintaxe**: A ordem dos valores é sempre -p [porta-do-seu-computador]:[porta-interna-do-contêiner].

**- O Exemplo Prático**: Para rodar o servidor web Nginx, que por padrão escuta na porta interna 80, o comando ideal seria -p 80:80. Isso significa: "redirecione qualquer acesso da porta 80 do meu computador para a porta 80 de dentro do contêiner".

**- Resolução de Conflitos**: O vídeo mostra uma situação real onde a porta 80 do computador do apresentador já estava ocupada por outro programa. Para resolver, ele simplesmente trocou a porta do host, executando -p 89:80. A porta interna do contêiner (80) permanece intacta, pois o Nginx continua funcionando nela.

**-Validação**: Após fazer o mapeamento para a porta 89, ele abre o navegador de internet do próprio computador e digita localhost:89 (ou o IP padrão 127.0.0.1:89), conseguindo acessar a página de boas-vindas do Nginx que está rodando isolada no Docker.

# Fundamentos de CI/CD e Pipelines

**CI - CONTINUOUS INTEGRATION (Integração Contínua)** [00:00:06]
É o processo de integrar continuamente código novo para dentro da *Code Base* principal (geralmente a branch `main`). 
A principal função da CI é garantir a qualidade do código antes que ele seja aceito. Isso é feito através de barreiras automáticas (pipelines) que rodam:
1. **LINT:** Verifica se o código segue os padrões de formatação e regras (ex: Prettier, ESLint).
2. **BUILD:** Garante que o código compila corretamente sem erros de sintaxe.
3. **TESTES:** Executa testes unitários ou *end-to-end* para garantir que a nova funcionalidade não quebrou o sistema.

**CD - CONTINUOUS DELIVERY (Entrega Contínua)** 
O código, após passar pela CI, fica pronto e empacotado para ser lançado em produção a qualquer momento. No entanto, o envio para o servidor/usuário não é automático; exige a aprovação manual de um humano (como um teste final de Q.A. ou um botão de "Aprovar Deploy").

**CD - CONTINUOUS DEPLOYMENT (Deploy Contínuo)** 
A versão mais avançada da automação. Assim que o código é mergeado na `main` e passa pela CI, ele é automaticamente enviado para a nuvem/servidor e fica imediatamente disponível para os clientes, sem intervenção humana .

---

### Conceitos Extras e Dicas do Vídeo

* **Deploy vs Release :**
  - **Deploy:** É o ato de colocar o código no servidor.
  - **Release:** É o ato de liberar essa funcionalidade para o público usar. (Grandes empresas, como a Meta, fazem o deploy do código, mas liberam a *release* aos poucos: 2% dos usuários, depois 10%, etc.).

* **GitHub Actions :**
  - É a ferramenta mais popular para criar essas esteiras de automação.
  - O arquivo fica dentro do seu projeto na pasta `.github/workflows/`.
  - Você pode configurar a ordem de execução usando dependências (ex: o *deploy* só roda se os *testes* passarem). No desafio da Semana 5, isso é chamado de *Fail-Fast* através do comando `needs`.

* **Segurança e Secrets :**
  - Para o servidor fazer o deploy, ele precisa de credenciais (senhas de banco de dados, tokens, chaves SSH).
  - **NUNCA** coloque isso no código-fonte. O GitHub oferece uma aba chamada *Secrets* onde você salva as senhas de forma criptografada. O arquivo do workflow puxa as senhas usando `${{ secrets.NOME_DO_SECRET }}` de forma segura[cite: 2].

* **Fluxo Completo na Prática:**
  - O apresentador mostra na prática: Ele altera as cores de um site no código local.
  - Ao rodar `git push`, o GitHub Actions é ativado.
  - Primeiro o sistema roda os testes e o build (CI)[cite: 2].
  - Em seguida, aprovado nos testes, ele conecta na VPS (Servidor) e envia o código automaticamente (Continuous Deployment)[cite: 2].
  - Em minutos, as novas cores estão no site em produção sem ele ter tocado no servidor manualmente[cite: 2].
