# Resumo Aprendizados da Semana 1

## Git e GitHub

### Conceitos

1. **Branch:** Uma ramificação. Permite desenvolver novas funcionalidades ou fazer testes com segurança, sem alterar ou quebrar o código da versão principal (main)

2. **Merge:** O processo de unir o trabalho finalizado. Ele pega as alterações de uma branch paralela e as integra de volta à branch principal, mantendo o histórico de onde vieram.

3. **Rebase:** Uma forma alternativa de juntar branches que reescreve o histórico de forma linear (colocando suas alterações no topo da fila). Deve ser evitado em branches públicas.

4. **Commit:** Um "ponto de salvamento" do seu trabalho. Ele registra o estado exato dos arquivos naquele momento, sempre acompanhado de uma mensagem descritiva sobre o que foi feito.

5. **Pull Request:** Uma solicitação formal no GitHub para que a equipe revise o seu código. É o momento de receber feedbacks e garantir que está tudo certo antes do merge final.

6. **Repositório:** É a pasta raiz do projeto. Ele armazena todos os arquivos, códigos e mantém o registro completo de todas as alterações feitas ao longo do tempo.

---

### Comandos Essenciais

#### 1. Trabalhando com Branches
* Criar uma nova branch e mudar para ela: `git switch -c nome-da-branch`
* Mudar para uma branch existente: `git switch nome-da-branch`
* Listar branches: `git branch`

#### 2. Salvando Alterações
* Preparar arquivos: `git add .`
* Salvar o estado: `git commit -m "sua mensagem"`

#### 3. Unindo e Atualizando
* Fazer o merge: `git merge nome-da-branch`
* Fazer o push pela primeira vez: `git push -u origin nome-da-sua-branch`


#### 4. Iniciando e Inspecionando
* Baixar um repositório inteiro da nuvem: `git clone [URL]`
* Mostrar o estado atual do projeto e arquivos modificados: `git status`
* Ver histórico de atualizações: `git log`
* Puxar atualizações do GitHub para seu PC: `git pull`

---

### Fluxo de Trabalho do Projeto
1. Criar branch: `git switch -c minha-branch`
2. Fazer alterações nos arquivos.
3. Preparar e salvar: `git add .` e `git commit -m "mensagem"`
4. Enviar para a nuvem: `git push -u origin minha-branch`
5. Abrir o Pull Request direto no site do GitHub.