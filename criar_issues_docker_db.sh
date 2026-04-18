#!/bin/bash

set -e

MILESTONE="M10 - Dockerização do Projeto"
USER1="RafaelTeixeira1"
USER2="jhannyfer"

# =========================
# CRIAR LABELS SE NÃO EXISTIREM
# =========================
echo "🔖 Verificando labels..."

criar_label() {
  LABEL_NAME="$1"
  COLOR="$2"
  DESC="$3"

  if ! gh label list --limit 200 | awk '{print $1}' | grep -qx "$LABEL_NAME"; then
    echo "Criando label: $LABEL_NAME"
    gh label create "$LABEL_NAME" --color "$COLOR" --description "$DESC"
  else
    echo "Label já existe: $LABEL_NAME"
  fi
}

criar_label "devops" "5319e7" "Infraestrutura, Docker e ambiente de desenvolvimento"
criar_label "database" "1d76db" "Relacionado a banco de dados"

echo "🚀 Criando issues de Docker + Banco..."

# =========================
# DOCKER-COMPOSE
# =========================
gh issue create \
  --title "chore: criar docker-compose.yml" \
  --body "Criar o arquivo docker-compose.yml para orquestrar os serviços do sistema (frontend, backend e banco de dados), permitindo subir toda a aplicação com um único comando." \
  --label "chore" \
  --label "devops" \
  --milestone "$MILESTONE" \
  --assignee "$USER1"

# =========================
# BACKEND DOCKER
# =========================
gh issue create \
  --title "chore: configurar ambiente de desenvolvimento do backend no docker" \
  --body "Configurar o container do backend para ambiente de desenvolvimento, incluindo volumes para hot reload, execução com nodemon e variáveis de ambiente." \
  --label "chore" \
  --label "backend" \
  --label "devops" \
  --milestone "$MILESTONE" \
  --assignee "$USER1"

# =========================
# FRONTEND DOCKER
# =========================
gh issue create \
  --title "chore: configurar ambiente de desenvolvimento do frontend no docker" \
  --body "Configurar o container do frontend para ambiente de desenvolvimento com Vue/Vite, incluindo volumes, execução com npm run dev e liberação de acesso externo (--host)." \
  --label "chore" \
  --label "frontend" \
  --label "devops" \
  --milestone "$MILESTONE" \
  --assignee "$USER2"

# =========================
# INTEGRAÇÃO FRONT/BACK
# =========================
gh issue create \
  --title "feat: integrar comunicação entre frontend e backend no docker" \
  --body "Configurar a comunicação entre frontend e backend utilizando o nome do serviço no docker-compose, garantindo que as requisições HTTP funcionem corretamente dentro da rede Docker." \
  --label "feature" \
  --label "frontend" \
  --label "backend" \
  --milestone "$MILESTONE" \
  --assignee "$USER2"

# =========================
# BANCO MYSQL
# =========================
gh issue create \
  --title "chore: adicionar serviço mysql no docker-compose" \
  --body "Adicionar o serviço do MySQL ao docker-compose, incluindo imagem, variáveis de ambiente, portas e rede para integração com o backend." \
  --label "chore" \
  --label "backend" \
  --label "database" \
  --label "devops" \
  --milestone "$MILESTONE" \
  --assignee "$USER1"

gh issue create \
  --title "chore: configurar volume de persistência do mysql" \
  --body "Configurar volume no Docker para garantir persistência dos dados do MySQL mesmo após reinicialização dos containers." \
  --label "chore" \
  --label "database" \
  --label "devops" \
  --milestone "$MILESTONE" \
  --assignee "$USER1"

gh issue create \
  --title "chore: configurar variáveis de ambiente do banco no docker" \
  --body "Definir variáveis de ambiente do banco de dados no docker-compose (host, porta, usuário, senha e nome do banco) e integrá-las ao backend." \
  --label "chore" \
  --label "backend" \
  --label "database" \
  --label "devops" \
  --milestone "$MILESTONE" \
  --assignee "$USER2"

gh issue create \
  --title "test: validar conexão do backend com mysql no docker" \
  --body "Testar se o backend consegue se conectar corretamente ao MySQL dentro do ambiente Docker, validando queries simples e conexão estável." \
  --label "test" \
  --label "backend" \
  --label "database" \
  --milestone "$MILESTONE" \
  --assignee "$USER2"

echo "✅ Issues criadas com sucesso!"
