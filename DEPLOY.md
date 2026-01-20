# 🚀 Deploy - Aumigo Pet Admin

## 📋 Informações do Projeto

- **Nome**: Aumigo Pet Admin
- **Tipo**: Frontend (React + Vite)
- **Porta**: 8081
- **Container**: aumigo-pet-admin
- **Network**: app-net-aumigopet

---

## 🔧 Pré-requisitos

- Docker
- Docker Compose
- Network `app-net-aumigopet` criada (o script cria automaticamente se não existir)

---

## 📦 Estrutura de Arquivos

```
aumigo-pet-admin/
├── Dockerfile.prod           # Dockerfile otimizado para produção
├── docker-compose.prod.yml   # Configuração do Docker Compose
├── scripts/
│   └── deploy.sh            # Script de deploy automatizado
└── DEPLOY.md               # Este arquivo
```

---

## 🚀 Deploy

### Opção 1: Script Automatizado (Recomendado)

```bash
cd /home/ubuntu/projetos/aumigo-pet-admin
./scripts/deploy.sh
```

O script executa automaticamente:
1. ✅ Verifica dependências (Docker, Docker Compose)
2. ✅ Verifica/cria a network Docker
3. ✅ Para e remove container antigo (se existir)
4. ✅ Verifica disponibilidade da porta 8081
5. ✅ Faz build da nova imagem
6. ✅ Inicia o novo container
7. ✅ Aguarda health check
8. ✅ Limpa recursos não utilizados

### Opção 2: Manual

```bash
cd /home/ubuntu/projetos/aumigo-pet-admin

# 1. Criar network (se não existir)
docker network create app-net-aumigopet

# 2. Parar container antigo
docker compose -f docker-compose.prod.yml -p aumigo-pet-admin down

# 3. Build
docker compose -f docker-compose.prod.yml -p aumigo-pet-admin build --no-cache

# 4. Iniciar
docker compose -f docker-compose.prod.yml -p aumigo-pet-admin up -d

# 5. Verificar
curl http://localhost:8081/health
```

---

## 🌐 Acesso

### Local (dentro da VPS)
```
http://localhost:8081
```

### Externo (navegador)
```
http://76.13.66.157:8081
```

### Health Check
```bash
curl http://localhost:8081/health
```

---

## 🔍 Comandos Úteis

### Ver logs
```bash
docker logs -f aumigo-pet-admin

# Últimas 100 linhas
docker logs --tail 100 aumigo-pet-admin

# Logs com timestamp
docker logs -f --timestamps aumigo-pet-admin
```

### Status do container
```bash
docker ps | grep aumigo-pet-admin

# Status detalhado
docker inspect aumigo-pet-admin
```

### Parar container
```bash
docker compose -f docker-compose.prod.yml -p aumigo-pet-admin down

# Ou forçar
docker stop aumigo-pet-admin
docker rm aumigo-pet-admin
```

### Reiniciar container
```bash
docker restart aumigo-pet-admin
```

### Acessar container
```bash
docker exec -it aumigo-pet-admin sh
```

### Ver uso de recursos
```bash
docker stats aumigo-pet-admin
```

---

## 🐛 Troubleshooting

### Porta 8081 em uso
```bash
# Ver o que está usando a porta
lsof -i :8081

# Matar processo
fuser -k 8081/tcp
```

### Container não inicia
```bash
# Ver logs
docker logs aumigo-pet-admin

# Verificar health
docker inspect --format='{{json .State.Health}}' aumigo-pet-admin
```

### Build falha
```bash
# Limpar cache do Docker
docker builder prune -a

# Rebuild sem cache
docker compose -f docker-compose.prod.yml -p aumigo-pet-admin build --no-cache
```

### Network não existe
```bash
# Criar network
docker network create app-net-aumigopet

# Listar networks
docker network ls

# Inspecionar network
docker network inspect app-net-aumigopet
```

---

## 🔄 Atualização

Para atualizar a aplicação com novo código:

```bash
cd /home/ubuntu/projetos/aumigo-pet-admin

# 1. Pull das mudanças
git pull

# 2. Deploy (script automaticamente para o antigo e sobe o novo)
./scripts/deploy.sh
```

---

## 🧹 Limpeza

### Remover apenas este projeto
```bash
docker compose -f docker-compose.prod.yml -p aumigo-pet-admin down
docker rmi aumigo-pet-admin-admin
```

### Limpeza geral (cuidado!)
```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -a -f

# Remover volumes não utilizados
docker volume prune -f

# Limpeza completa (CUIDADO!)
docker system prune -a --volumes -f
```

---

## 📊 Otimizações Aplicadas

### Dockerfile
- ✅ Multi-stage build (reduz tamanho final)
- ✅ Nginx Alpine (imagem mínima)
- ✅ Compressão Gzip habilitada
- ✅ Cache de assets estáticos (1 ano)
- ✅ Health check configurado
- ✅ SPA routing configurado

### Docker Compose
- ✅ Restart automático
- ✅ Network externa compartilhada
- ✅ Health check
- ✅ Labels para identificação

### Script de Deploy
- ✅ Verificação de dependências
- ✅ Gerenciamento automático de containers
- ✅ Liberação automática de porta
- ✅ Health check com timeout
- ✅ Limpeza automática
- ✅ Logs coloridos e informativos

---

## 📝 Notas

- O container reinicia automaticamente em caso de falha (`restart: unless-stopped`)
- O build usa `npm ci` para instalação determinística de dependências
- O Nginx está configurado para servir SPAs (sempre retorna `index.html`)
- O health check verifica o endpoint `/health` a cada 30 segundos
- A aplicação usa a network compartilhada `app-net-aumigopet` para comunicação com outros serviços

---

## 🔐 Segurança

- ✅ Container roda como não-root (Nginx Alpine)
- ✅ Apenas porta 80 exposta no container (mapeada para 8081 no host)
- ✅ Network isolada
- ✅ Sem variáveis de ambiente sensíveis

---

## 🎯 Próximos Passos Recomendados

1. **Configurar Nginx Reverse Proxy** (no host) para:
   - SSL/HTTPS com Let's Encrypt
   - Domínio personalizado
   - Rate limiting
   - Proteção contra ataques

2. **Monitoramento**:
   - Adicionar Prometheus + Grafana
   - Configurar alertas
   - Logs centralizados

3. **CI/CD**:
   - GitHub Actions para deploy automático
   - Testes automatizados
   - Rollback automático em caso de falha

---

**Última atualização**: 2026-01-16
