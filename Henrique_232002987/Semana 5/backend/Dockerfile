FROM python:3.12-slim

WORKDIR /app

# Instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código-fonte
COPY . .

# Expõe a porta do Django
EXPOSE 8000

# Executa o servidor de desenvolvimento
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]