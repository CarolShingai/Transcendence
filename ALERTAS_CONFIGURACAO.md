# Configuração de Alertas - Grafana + Prometheus

## 📋 Resumo

Foram configurados alertas de exemplo para monitorar o host rodando a aplicação Transcendence, com foco em:

- **Consumo de Memória** (Warning > 80%, Critical > 95%)
- **Uso de CPU** (Warning > 80%)
- **Espaço em Disco** (Warning < 15%)

## 📁 Arquivos Criados/Modificados

### 1. Prometheus - Arquivo de Regras
**Arquivo:** `prometheus-rules.yml`

Contém as regras de alerta do Prometheus que são avaliadas a cada 15 segundos:

```yaml
- alert: HighMemoryUsage
  expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 80
  for: 5m  # Alerta acionado se a condição persistir por 5 minutos
  labels:
    severity: warning
```

### 2. Grafana - Provisionamento de Alertas
**Arquivo:** `monitoring/grafana/provisioning/alerting/alert-config.yaml`

Configura como o Grafana carrega as alertas e em qual pasta organizá-las.

### 3. Dashboard de Exemplo
**Arquivo:** `monitoring/grafana/provisioning/dashboards/dashboard-alerts-example.json`

Dashboard que exibe:
- 📈 Gráfico de consumo de memória ao longo do tempo
- 📊 Gauge com o uso atual de memória
- 🍰 Distribuição de memória (Disponível, Livre, Buffers, Cached)
- 🚨 Tabela de alertas ativos

### 4. Prometheus - Configuração Atualizada
**Arquivo:** `prometheus.yml`

Adicionada seção `rule_files` para carregar as regras:
```yaml
rule_files:
  - 'prometheus-rules.yml'
```

## 🚀 Como Usar

### 1. Reiniciar os Containers
```bash
docker-compose down
docker-compose up -d
```

### 2. Acessar o Grafana
- URL: `http://localhost:3000`
- Dashboard: "Host Metrics & Alerts"

### 3. Acessar Prometheus
- URL: `http://localhost:9090`
- Alertas: Acesse "Alerts" para ver o status das regras

## 📊 Métricas Disponíveis

As métricas vêm do **Node Exporter** (port 9100):

| Métrica | Descrição |
|---------|-----------|
| `node_memory_MemTotal_bytes` | Memória total disponível |
| `node_memory_MemAvailable_bytes` | Memória disponível |
| `node_memory_MemFree_bytes` | Memória livre |
| `node_memory_Buffers_bytes` | Memória em buffers |
| `node_memory_Cached_bytes` | Memória em cache |
| `node_cpu_seconds_total` | Tempo em diferentes modos de CPU |

## 🔔 Alertas Configurados

### ⚠️ `HighMemoryUsage` (Warning)
- **Condição:** Consumo > 80%
- **Duração:** 5 minutos
- **Mensagem:** "Alto uso de memória detectado"

### 🔴 `CriticalMemoryUsage` (Critical)
- **Condição:** Consumo > 95%
- **Duração:** 2 minutos
- **Mensagem:** "Uso crítico de memória detectado"

### ⚠️ `HighCPUUsage` (Warning)
- **Condição:** Uso > 80%
- **Duração:** 5 minutos

### ⚠️ `DiskSpaceLow` (Warning)
- **Condição:** Espaço disponível < 15%
- **Duração:** 5 minutos

## 🎯 Próximos Passos

Para integrar completamente os alertas, você pode:

1. **Configurar notificações:**
   - Email
   - Slack
   - PagerDuty
   - Webhook customizado

2. **Personalizar as regras:**
   - Editar limites em `prometheus-rules.yml`
   - Adicionar novas métricas
   - Ajustar durações (`for:` fielding)

3. **Criar mais dashboards:**
   - Adicionar novos panels ao dashboard
   - Criar dashboards específicos por serviço

## 📝 Notas Importantes

- As regras são avaliadas a cada `15s` (definido em `prometheus.yml`)
- Os alertas só disparão após a condição persistir pelo tempo especificado (`for:`)
- O dashboard é atualizado em tempo real conforme as métricas são coletadas
- Node Exporter coleta métricas do host a cada 15 segundos

## 🔧 Troubleshooting

### Alertas não aparecem
1. Verifique se o Node Exporter está rodando: `docker ps | grep node-exporter`
2. Verifique logs: `docker logs prometheus` e `docker logs grafana`
3. Acesse Prometheus em `http://localhost:9090/alerts` para verificar o status

### Métricas não aparecem
1. Aguarde 1-2 minutos após iniciar os containers
2. Verifique se o Prometheus consegue scratchear o Node Exporter:
   - Acesse `http://localhost:9090/targets`

