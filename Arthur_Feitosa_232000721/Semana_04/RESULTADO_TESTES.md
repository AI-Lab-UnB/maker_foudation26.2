# RESULTADO DOS TESTES

## 1. Execução contra a implementação original

Comando:

```bash
python -m pytest test_bilheteria.py -v
```

Saída registrada:

```text
[1m============================= test session starts ==============================[0m
platform linux -- Python 3.13.5, pytest-9.0.2, pluggy-1.6.0 -- /opt/pyvenv/bin/python
cachedir: .pytest_cache
metadata: {'Python': '3.13.5', 'Platform': 'Linux-6.18.44-x86_64-with-glibc2.41', 'Packages': {'pytest': '9.0.2', 'pluggy': '1.6.0'}, 'Plugins': {'anyio': '4.13.0', 'ddtrace': '4.4.0', 'Faker': '40.1.2', 'asyncio': '1.3.0', 'cov': '7.0.0', 'json-report': '1.5.0', 'metadata': '3.1.1'}, 'PLATFORM': 'linux/amd64', 'CI': 'true'}
rootdir: /mnt/data/semana04_arthur
plugins: anyio-4.13.0, ddtrace-4.4.0, Faker-40.1.2, asyncio-1.3.0, cov-7.0.0, json-report-1.5.0, metadata-3.1.1
asyncio: mode=Mode.STRICT, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
[1mcollecting ... [0mcollected 6 items

test_bilheteria.py::test_gratuidade_bebe [32mPASSED[0m[32m                          [ 16%][0m
test_bilheteria.py::test_meia_jovem [32mPASSED[0m[32m                               [ 33%][0m
test_bilheteria.py::test_inteira [32mPASSED[0m[32m                                  [ 50%][0m
test_bilheteria.py::test_meia_idoso [31mFAILED[0m[31m                               [ 66%][0m
test_bilheteria.py::test_idade_negativa [31mFAILED[0m[31m                           [ 83%][0m
test_bilheteria.py::test_idade_acima_limite [32mPASSED[0m[31m                       [100%][0m

=================================== FAILURES ===================================
[31m[1m_______________________________ test_meia_idoso ________________________________[0m

    [0m[94mdef[39;49;00m[90m [39;49;00m[92mtest_meia_idoso[39;49;00m():[90m[39;49;00m
>       [94massert[39;49;00m calcular_ingresso([94m60[39;49;00m) == [94m20.0[39;49;00m[90m[39;49;00m
[1m[31mE       assert 40.0 == 20.0[0m
[1m[31mE        +  where 40.0 = calcular_ingresso(60)[0m

[1m[31mtest_bilheteria.py[0m:21: AssertionError
[31m[1m_____________________________ test_idade_negativa ______________________________[0m

    [0m[94mdef[39;49;00m[90m [39;49;00m[92mtest_idade_negativa[39;49;00m():[90m[39;49;00m
>       [94mwith[39;49;00m pytest.raises([96mValueError[39;49;00m):[90m[39;49;00m
             ^^^^^^^^^^^^^^^^^^^^^^^^^[90m[39;49;00m
[1m[31mE       Failed: DID NOT RAISE <class 'ValueError'>[0m

[1m[31mtest_bilheteria.py[0m:26: Failed
[36m[1m=========================== short test summary info ============================[0m
[31mFAILED[0m test_bilheteria.py::[1mtest_meia_idoso[0m - assert 40.0 == 20.0
 +  where 40.0 = calcular_ingresso(60)
[31mFAILED[0m test_bilheteria.py::[1mtest_idade_negativa[0m - Failed: DID NOT RAISE <class 'ValueError'>
[31m========================= [31m[1m2 failed[0m, [32m4 passed[0m[31m in 0.11s[0m[31m ==========================[0m

Spreadsheet runtime warmup failed during python startup
Traceback (most recent call last):
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/patches/warm_spreadsheet_runtime_on_startup.py", line 26, in warm_spreadsheet_runtime_on_startup
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/spreadsheet_warmup.py", line 785, in warm_spreadsheet_runtime
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/spreadsheet_warmup.py", line 720, in _warm_feature_flows
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/spreadsheet_warmup.py", line 704, in _warm_collaboration_flows
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/generated/interface/models.py", line 32317, in hydrate_crdt_from_proto
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/rpc/remote.py", line 749, in __call__
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/rpc/client.py", line 150, in call
artifact_tool.rpc.client.RemoteError: hydrateCrdtFromProto requires an empty collaborative document.
```

## 2. Execução após a correção do Desafio Ninja

Comando:

```bash
python -m pytest test_bilheteria.py -v
```

Saída registrada:

```text
[1m============================= test session starts ==============================[0m
platform linux -- Python 3.13.5, pytest-9.0.2, pluggy-1.6.0 -- /opt/pyvenv/bin/python
cachedir: .pytest_cache
metadata: {'Python': '3.13.5', 'Platform': 'Linux-6.18.44-x86_64-with-glibc2.41', 'Packages': {'pytest': '9.0.2', 'pluggy': '1.6.0'}, 'Plugins': {'anyio': '4.13.0', 'ddtrace': '4.4.0', 'Faker': '40.1.2', 'asyncio': '1.3.0', 'cov': '7.0.0', 'json-report': '1.5.0', 'metadata': '3.1.1'}, 'PLATFORM': 'linux/amd64', 'CI': 'true'}
rootdir: /mnt/data/semana04_arthur
plugins: anyio-4.13.0, ddtrace-4.4.0, Faker-40.1.2, asyncio-1.3.0, cov-7.0.0, json-report-1.5.0, metadata-3.1.1
asyncio: mode=Mode.STRICT, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
[1mcollecting ... [0mcollected 6 items

test_bilheteria.py::test_gratuidade_bebe [32mPASSED[0m[32m                          [ 16%][0m
test_bilheteria.py::test_meia_jovem [32mPASSED[0m[32m                               [ 33%][0m
test_bilheteria.py::test_inteira [32mPASSED[0m[32m                                  [ 50%][0m
test_bilheteria.py::test_meia_idoso [32mPASSED[0m[32m                               [ 66%][0m
test_bilheteria.py::test_idade_negativa [32mPASSED[0m[32m                           [ 83%][0m
test_bilheteria.py::test_idade_acima_limite [32mPASSED[0m[32m                       [100%][0m

[32m============================== [32m[1m6 passed[0m[32m in 0.04s[0m[32m ===============================[0m

Spreadsheet runtime warmup failed during python startup
Traceback (most recent call last):
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/patches/warm_spreadsheet_runtime_on_startup.py", line 26, in warm_spreadsheet_runtime_on_startup
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/spreadsheet_warmup.py", line 785, in warm_spreadsheet_runtime
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/spreadsheet_warmup.py", line 720, in _warm_feature_flows
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/spreadsheet_warmup.py", line 704, in _warm_collaboration_flows
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/generated/interface/models.py", line 32317, in hydrate_crdt_from_proto
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/rpc/remote.py", line 749, in __call__
  File "/tmp/tmp.L2TH2Y5coc/artifact_tool_v2-2.8.22/artifact_tool/rpc/client.py", line 150, in call
artifact_tool.rpc.client.RemoteError: hydrateCrdtFromProto requires an empty collaborative document.
```

## Interpretação

Na implementação original, os testes de fronteira devem revelar dois defeitos:

1. `idade = 60` recebe tarifa cheia em vez de meia-entrada.
2. `idade = -1` não lança `ValueError`.

Após as correções em `bilheteria.py`, a suíte deve passar integralmente.
