#!/bin/bash

# ============================================
# Deploy Script - Aumigo Pet Admin (Frontend)
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
PROJECT_NAME="aumigo-pet-admin"
CONTAINER_NAME="aumigo-pet-admin"
PORT=8081
NETWORK_NAME="app-net-aumigopet"

# Funções de log
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================
# Verificar dependências
# ============================================
check_dependencies() {
    log_info "Verificando dependências..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado!"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado!"
        exit 1
    fi
    
    log_success "Dependências OK"
}

# ============================================
# Verificar e criar network
# ============================================
check_network() {
    log_info "Verificando network Docker..."
    
    if ! docker network ls | grep -q "$NETWORK_NAME"; then
        log_warning "Network $NETWORK_NAME não existe. Criando..."
        docker network create "$NETWORK_NAME"
        log_success "Network $NETWORK_NAME criada!"
    else
        log_success "Network $NETWORK_NAME já existe"
    fi
}

# ============================================
# Parar e remover container antigo
# ============================================
stop_old_container() {
    log_info "Verificando container existente..."
    
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_warning "Container $CONTAINER_NAME encontrado. Removendo..."
        
        # Parar com docker compose
        docker compose -f docker-compose.prod.yml -p "$PROJECT_NAME" down 2>/dev/null || true
        
        # Garantir remoção forçada se ainda existir
        if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
        fi
        
        # Aguardar liberação da porta
        log_info "Aguardando liberação da porta $PORT..."
        sleep 2
        
        log_success "Container antigo removido"
    else
        log_info "Nenhum container antigo encontrado"
    fi
}

# ============================================
# Verificar disponibilidade da porta
# ============================================
check_port() {
    log_info "Verificando disponibilidade da porta $PORT..."
    
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_error "Porta $PORT ainda está em uso!"
        log_info "Processos usando a porta:"
        lsof -i :$PORT
        
        log_warning "Tentando liberar a porta..."
        fuser -k $PORT/tcp 2>/dev/null || true
        sleep 2
        
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_error "Não foi possível liberar a porta $PORT"
            exit 1
        fi
    fi
    
    log_success "Porta $PORT disponível"
}

# ============================================
# Build da imagem
# ============================================
build_image() {
    log_info "Construindo imagem Docker..."
    
    docker compose -f docker-compose.prod.yml -p "$PROJECT_NAME" build --no-cache
    
    if [ $? -eq 0 ]; then
        log_success "Imagem construída com sucesso!"
    else
        log_error "Falha ao construir imagem"
        exit 1
    fi
}

# ============================================
# Iniciar container
# ============================================
start_container() {
    log_info "Iniciando container..."
    
    docker compose -f docker-compose.prod.yml -p "$PROJECT_NAME" up -d
    
    if [ $? -eq 0 ]; then
        log_success "Container iniciado!"
    else
        log_error "Falha ao iniciar container"
        exit 1
    fi
}

# ============================================
# Aguardar health check
# ============================================
wait_for_health() {
    log_info "Aguardando aplicação ficar saudável..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:$PORT/health >/dev/null 2>&1; then
            log_success "Aplicação está saudável!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    echo ""
    log_error "Timeout aguardando health check"
    log_warning "Verificando logs do container:"
    docker logs "$CONTAINER_NAME" --tail 50
    return 1
}

# ============================================
# Limpeza de recursos não utilizados
# ============================================
cleanup() {
    log_info "Limpando recursos não utilizados..."
    
    docker image prune -f >/dev/null 2>&1 || true
    
    log_success "Limpeza concluída"
}

# ============================================
# Main
# ============================================
main() {
    echo ""
    log_info "=========================================="
    log_info "  Deploy - Aumigo Pet Admin (Frontend)"
    log_info "=========================================="
    echo ""
    
    check_dependencies
    check_network
    stop_old_container
    check_port
    build_image
    start_container
    wait_for_health
    cleanup
    
    echo ""
    log_success "=========================================="
    log_success "  Deploy concluído com sucesso! 🎉"
    log_success "=========================================="
    echo ""
    log_info "📱 Aplicação disponível em:"
    log_info "   - Local: http://localhost:$PORT"
    log_info "   - Externo: http://76.13.66.157:$PORT"
    echo ""
    log_info "🔍 Comandos úteis:"
    log_info "   - Ver logs: docker logs -f $CONTAINER_NAME"
    log_info "   - Status: docker ps | grep $CONTAINER_NAME"
    log_info "   - Parar: docker compose -f docker-compose.prod.yml -p $PROJECT_NAME down"
    echo ""
}

# Executar
main
