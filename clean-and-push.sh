#!/bin/bash
# Este script limpa um repositório Git corrompido e inicia um novo processo de push.

echo "--- Removendo estado do Git corrompido... ---"
rm -rf .git
echo "Repositório Git local removido."
echo ""

echo "--- Iniciando um novo repositório Git limpo... ---"
git init -b main
echo ""

echo "--- Adicionando todos os arquivos... ---"
git add .
echo ""

echo "--- Criando o commit inicial... ---"
git commit -m "Commit inicial limpo do projeto"
echo ""

echo "--- PRÓXIMOS PASSOS ---"
echo "Agora, você precisa conectar este repositório ao seu GitHub e enviar o código."
echo "Execute os dois comandos abaixo, substituindo a URL pela URL do SEU repositório no GitHub:"
echo ""
echo "1. Conecte ao GitHub:"
echo "   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git"
echo ""
echo "2. Envie o código:"
echo "   git push -u origin main"
echo ""
echo "Se você receber um erro 'remote origin already exists', ignore-o e execute o comando push mesmo assim."
echo ""
