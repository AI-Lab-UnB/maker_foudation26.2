# Checkout — Semana 4

## Entrega 1: Mentalidade de Testes e Caixa-Preta

- Vídeo "O Guia Definitivo de Qualidade de Software para Iniciantes" assistido (importância da qualidade, esperado vs. obtido, testes manuais vs. automatizados e ciclo de reporte).
- Pílula de Arquitetura "Melhores e piores tipos de teste" assistida (pirâmide de testes e foco em regras de negócio críticas).
- The Password Game jogado até a Regra 9.
- Code Defenders Puzzles (nível beginner) concluídos, alternando entre os papéis de Defender e Attacker.
- Matriz de testes criada (`MATRIZ_TESTES.md`) com os 10 casos (CT-01 a CT-10), saídas esperadas e técnica (BVA) preenchidas, aplicando Particionamento de Equivalência e Análise de Valor Limite na regra de tarifação da bilheteria do museu.
- Código versionado e enviado (commit e push) para a pasta no repositório do laboratório.

## Entrega 2: Diagnóstico de Código e Bug Report

- Estudo sobre o que é um bug report e os níveis de severidade (Crítica, Alta, Média, Baixa) concluído.
- Pytest instalado e suíte de testes de fronteira criada (`test_bilheteria.py`), executada contra `bilheteria.py` com `pytest test_bilheteria.py -v`.
- Dois defeitos encontrados e documentados em `BUG_REPORT.md`:
  - **BUG-001 (Média):** idade negativa (`-1`) não lança exceção e retorna R$ 0,00.
  - **BUG-002 (Alta):** idade `60` retorna tarifa cheia (R$ 40,00) em vez de meia-entrada (R$ 20,00).
- Desafio Ninja concluído: `bilheteria.py` corrigido (`idade < 0 or idade > 120` e `idade < 60`), com 100% dos testes passando.
- Código versionado e enviado (commit e push) para a pasta no repositório do laboratório.

---

## Checklist Final

### Entrega 1
- [x] Assistir trecho [00:00:25] — Por que a qualidade de software é crucial
- [x] Assistir trecho [00:03:45] — O que é testar na prática (Esperado vs. Obtido)
- [x] Assistir trecho [00:10:54] — Testes manuais vs. Automatizados e ciclo de reporte
- [x] Assistir Pílula de Arquitetura "Melhores e piores tipos de teste" ([00:03:27] a [00:13:30])
- [x] Jogar The Password Game até a Regra 9
- [x] Completar os puzzles beginner do Code Defenders (Defender e Attacker)
- [x] Criar o arquivo `MATRIZ_TESTES.md`
- [x] Preencher Saída Esperada dos casos CT-02 a CT-10
- [x] Preencher Técnica (EP/BVA) dos casos CT-02 a CT-10
- [x] Commit e push da matriz de testes
- [x] Conquista — Caçador de Fronteiras (sem consultar gabarito externo)

### Entrega 2
- [x] Estudar o que é um bug report e os níveis de severidade
- [x] Instalar o pytest (`pip install pytest`)
- [x] Criar o arquivo `bilheteria.py`
- [x] Criar o arquivo `test_bilheteria.py`
- [x] Executar `pytest test_bilheteria.py -v` e analisar as falhas
- [x] Preencher `BUG_REPORT.md` com o BUG-001
- [x] Preencher `BUG_REPORT.md` com o BUG-002
- [x] Desafio Ninja: corrigir `bilheteria.py` até 100% dos testes passarem
- [x] Commit e push do bug report
- [x] Conquista — Debugger Novato (1 defeito documentado)
- [x] Conquista Bônus — Debugger Mestre (2 defeitos + Desafio Ninja)