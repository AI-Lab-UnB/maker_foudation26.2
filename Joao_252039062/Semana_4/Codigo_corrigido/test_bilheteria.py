# pyright: ignore [missing-import]
import pytest
from bilheteria import calcular_ingresso 

def	test_gratuidade_bebe():
    assert	calcular_ingresso(0)	==	0.0 
    assert	calcular_ingresso(5)	==	0.0 

def	test_meia_jovem(): 
    assert	calcular_ingresso(6)	==	20.0 
    assert	calcular_ingresso(17)	==	20.0 
        
def	test_inteira(): 
    assert	calcular_ingresso(18)	==	40.0 
    assert	calcular_ingresso(59)	==	40.0 
    
def	test_meia_idoso(): 
    assert	calcular_ingresso(60)	==	20.0 
    assert	calcular_ingresso(120)	==	20.0 
                
def	test_idade_negativa(): 
    with	pytest.raises(ValueError): 
        calcular_ingresso(-1) 
        
def	test_idade_acima_limite(): 
    with	pytest.raises(ValueError): 
        calcular_ingresso(121)
    