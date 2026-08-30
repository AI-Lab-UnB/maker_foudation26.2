## AI LAB - SEMANA 1

### Parte 1

**Git branching** é um site que explora simulações com Git e oferece ao usuário
uma forma mais visual e interativa de aprender Git, com diferentes níveis. É a ferramenta base para esse estudo

## Commit

- **commit:** "snapshot" do repositório, muito leve
- Git objetiva manter os commits o mais leves possíveis; a compressão do commit
  é o registro das mudanças entre versões do repositório
- Git registra as datas de ocorrência do commit
- o histórico é **FUNDAMENTAL** para o storytelling de um projeto
- organizar-se com esse recurso aumenta a **VISUALIZAÇÃO DO PROJETO**

**testando:**

- **comando `git commit`:** cria um commit
- **CUIDADO COM HEAD:** indica a posição do commit ativo

```
Estado Inicial          Após git commit com HEAD em C1
   C0                       C0
   ↑                        ↑
   C1                       C1  ← HEAD, main
   ↑                        ↑
   C2                       C2  
   ↑                        ↑
   C3  ← main               C3  
```

## Branch

- **branches:** referências muito leves de commit
- Recomendável ramificar sempre: *"ramifique cedo, ramifique sempre"*
- Não existe sobrecarga de memória
- **o que significa:** *"Vou incluir o trabalho deste e de todos os commits ancestrais."*

**comando:** `git branch [nome]`
- aponta o commit pelo main de referência (ex: C3)

> **Ps.3:** `[nome branch]` usa colchetes para indicar que ali deve ser inserido um valor
> qualquer; os colchetes não fazem parte do comando real.

## Checkout

> **Ps.:** para adicionar progresso na branch, ela precisa estar ativa,
> senão o comando `git commit` vai commitar em uma branch totalmente distinta.
>
> `git checkout [nome branch]` ; `git commit`
> → admite progresso, ativa a branch e sinaliza que é nela que o trabalho está sendo adicionado.
>
> **Ps.1:** a partir do Git 2.23, `git switch` substitui `git checkout` para essa finalidade.
>
> **Ps.1.1:** `checkout` é impreciso, pois executa ações diferentes dependendo do argumento.
> `git switch` ainda é **EXPERIMENTAL**.
> **Ps.2:** comando `git checkout -b [nome branch]`
> → cria e realiza checkout de uma vez.
>
> **Ps.3:** `[nome branch]` usa colchetes para indicar que ali deve ser inserido um valor
> qualquer; os colchetes não fazem parte do comando real.
