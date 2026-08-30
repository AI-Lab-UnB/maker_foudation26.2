## AI LAB - SEMANA 1

### Parte 1

**Git branching** é um site que explora simulações com Git e oferece ao usuário
uma forma mais visual e interativa de aprender Git, com diferentes níveis.

<img src="assets/commit-sequencial.png" align="right" width="280">

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
