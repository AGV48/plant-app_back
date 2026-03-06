# Integración con Servicios de Monitoreo

Esta guía muestra cómo integrar los endpoints de health check de PlantApp con servicios populares de monitoreo.

## 🌐 Servicios de Monitoreo Gratuitos

### 1. UptimeRobot (Recomendado)
**URL:** https://uptimerobot.com  
**Plan Gratuito:** 50 monitores, checks cada 5 minutos

**Configuración:**
1. Crear cuenta en UptimeRobot
2. Click en "Add New Monitor"
3. Configurar:
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `PlantApp Backend`
   - URL: `http://tu-dominio.com/api/ping`
   - Monitoring Interval: `5 minutes`
   - Monitor Timeout: `10 seconds`
4. Agregar alertas (email, SMS, Slack, etc.)

---

### 2. Healthchecks.io
**URL:** https://healthchecks.io  
**Plan Gratuito:** 20 checks

**Configuración:**
1. Crear cuenta y obtener tu Check URL
2. Configurar cronjob que haga ping:

**Linux/Mac:**
```bash
*/5 * * * * curl -fsS --retry 3 https://hc-ping.com/tu-check-uuid > /dev/null
```

**Windows (PowerShell):**
```powershell
$action = New-ScheduledTaskAction -Execute "curl" -Argument "https://hc-ping.com/tu-check-uuid"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName "HealthChecks.io Ping" -Action $action -Trigger $trigger
```

---

### 3. StatusCake
**URL:** https://www.statuscake.com  
**Plan Gratuito:** Monitoreo ilimitado, checks cada 5 minutos

**Configuración:**
1. Crear cuenta en StatusCake
2. Go to "Uptime" → "Add Test"
3. Configurar:
   - Test Name: `PlantApp Backend`
   - Test Type: `HTTP`
   - Website URL: `http://tu-dominio.com/api/ping`
   - Check Rate: `5 Minutes`
   - Test Timeout: `10 seconds`
   - Status Codes: `200`

---

### 4. Pingdom (Freemium)
**URL:** https://www.pingdom.com  
**Trial:** 30 días gratis

**Configuración:**
1. Crear cuenta Pingdom
2. "Add New" → "Uptime Check"
3. Configurar:
   - Name: `PlantApp Backend`
   - URL: `http://tu-dominio.com/api/ping`
   - Check Interval: `1 minute` (plan pagado) o `5 minutes` (gratis)

---

## 📊 Monitoreo Avanzado con Prometheus + Grafana

### Endpoint Prometheus (Futuro)
Para integración con Prometheus, puedes crear un endpoint `/metrics`:

```typescript
// health.controller.ts
@Get('metrics')
@Header('Content-Type', 'text/plain')
metrics(): string {
  return `
# HELP plantapp_uptime_seconds Application uptime in seconds
# TYPE plantapp_uptime_seconds gauge
plantapp_uptime_seconds ${process.uptime()}

# HELP plantapp_memory_used_bytes Memory usage in bytes
# TYPE plantapp_memory_used_bytes gauge
plantapp_memory_used_bytes ${process.memoryUsage().heapUsed}
  `.trim();
}
```

---

## 🔔 Configuración de Alertas

### Email Simple (SMTP)
Ver archivo `ping-plantapp.ps1` para configuración SMTP.

### Slack Webhook
```bash
#!/bin/bash
BACKEND_URL="http://localhost:3000/api/ping"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL")

if [ "$response" != "200" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"⚠️ PlantApp Backend DOWN"}' \
        "$SLACK_WEBHOOK"
fi
```

### Discord Webhook
```powershell
$backendUrl = "http://localhost:3000/api/ping"
$discordWebhook = "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID"

try {
    $response = Invoke-RestMethod -Uri $backendUrl -Method Get -TimeoutSec 10
} catch {
    $body = @{
        content = "⚠️ **PlantApp Backend DOWN**"
        username = "PlantApp Monitor"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri $discordWebhook -Method Post -Body $body -ContentType "application/json"
}
```

### Telegram Bot
```bash
#!/bin/bash
BACKEND_URL="http://localhost:3000/api/ping"
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_CHAT_ID"

response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL")

if [ "$response" != "200" ]; then
    curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d chat_id="$TELEGRAM_CHAT_ID" \
        -d text="⚠️ PlantApp Backend DOWN (HTTP $response)"
fi
```

---

## 🚀 Monitoreo en Cloud

### Render.com
Si despliegas en Render, agrega Health Check:
```yaml
# render.yaml
services:
  - type: web
    name: plantapp-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    healthCheckPath: /api/ping
```

### Heroku
```bash
# Configurar health check
heroku config:set HEALTH_CHECK_URL=/api/ping
```

### Railway
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "healthcheckPath": "/api/ping",
    "healthcheckTimeout": 10
  }
}
```

### AWS Elastic Beanstalk
```yaml
# .ebextensions/healthcheck.config
option_settings:
  aws:elasticbeanstalk:application:
    Application Healthcheck URL: /api/ping
```

---

## 📱 Apps de Monitoreo Móvil

### iOS/Android
- **Uptime Robot App** (iOS/Android) - Notificaciones push
- **StatusCake App** (iOS/Android)
- **Pingdom App** (iOS/Android)
- **Simple Server Monitor** (Android)

---

## 🔐 Mejores Prácticas

1. **Redundancia**: Usa al menos 2 servicios de monitoreo diferentes
2. **Intervalos**: 5 minutos es ideal (balance entre costo y detección rápida)
3. **Alertas**: Configura múltiples canales (email + Slack/Discord)
4. **Logs**: Mantén logs locales además del monitoreo externo
5. **Timeout**: Configura timeout de 10 segundos máximo
6. **Status Page**: Considera usar https://statuspage.io para página pública de status

---

## ✅ Checklist de Configuración

- [ ] Health check endpoint configurado (`/api/ping`)
- [ ] Servicio de monitoreo externo configurado (UptimeRobot, etc.)
- [ ] Alertas por email configuradas
- [ ] Alertas en Slack/Discord configuradas (opcional)
- [ ] Cronjob local configurado como backup
- [ ] Logs de health check funcionando
- [ ] Status page pública (opcional)
- [ ] Documentación actualizada con URLs de producción

---

## 🆘 Troubleshooting

**Problema**: "Cannot GET /api/ping"
- **Solución**: Verificar que el backend esté corriendo y que app.setGlobalPrefix('api') esté configurado

**Problema**: Timeout en el health check
- **Solución**: Aumentar timeout a 30 segundos o verificar que el backend no esté sobrecargado

**Problema**: Falsos positivos (alertas cuando todo está bien)
- **Solución**: Aumentar el número de intentos fallidos antes de alertar (retry count)

**Problema**: El cronjob no se ejecuta
- **Solución**: Verificar permisos, logs del cron (`/var/log/cron.log`) o Task Scheduler

---

Para más información, consulta:
- [HEALTH_CHECK.md](./HEALTH_CHECK.md) - Documentación de endpoints
- [ping-plantapp.ps1](./ping-plantapp.ps1) - Script de Windows
- [plantapp-health-check.sh](./plantapp-health-check.sh) - Script de Linux/Mac
