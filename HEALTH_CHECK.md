# Health Check Endpoints - PlantApp Backend

Endpoints disponibles para monitoreo y cronjobs.

## 📍 Endpoints

### 1. `/api/ping` - Ping Simple
Endpoint minimalista para verificación rápida. Ideal para cronjobs.

**URL:** `http://localhost:3000/api/ping`  
**Método:** GET  
**Respuesta:** `OK` (texto plano)  
**Status Code:** 200

**Ejemplo con curl:**
```bash
curl http://localhost:3000/api/ping
```

**Ejemplo con PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/ping" -Method Get
```

---

### 2. `/api/health` - Health Check Completo
Información detallada del estado de la aplicación.

**URL:** `http://localhost:3000/api/health`  
**Método:** GET  
**Respuesta:** JSON  
**Status Code:** 200

**Respuesta ejemplo:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-06T06:21:16.584Z",
  "uptime": 12,
  "service": "PlantApp Backend",
  "version": "1.0.0",
  "memory": {
    "used": 17,
    "total": 20,
    "unit": "MB"
  }
}
```

**Ejemplo con curl:**
```bash
curl http://localhost:3000/api/health
```

**Ejemplo con PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get | ConvertTo-Json
```

---

### 3. `/api/status` - Status con Timestamp
Verificación rápida con fecha/hora.

**URL:** `http://localhost:3000/api/status`  
**Método:** GET  
**Respuesta:** `ONLINE - 2026-03-06T06:21:16.629Z` (texto plano)  
**Status Code:** 200

**Ejemplo con curl:**
```bash
curl http://localhost:3000/api/status
```

---

## 🤖 Configuración de Cronjobs

### Linux/Unix (crontab)

Editar crontab:
```bash
crontab -e
```

**Ping cada 5 minutos:**
```bash
*/5 * * * * curl -s http://localhost:3000/api/ping > /dev/null 2>&1
```

**Health check cada 15 minutos y guardar log:**
```bash
*/15 * * * * curl -s http://localhost:3000/api/health >> /var/log/plantapp-health.log 2>&1
```

**Notificación si el servicio está caído:**
```bash
*/5 * * * * curl -f -s http://localhost:3000/api/ping || echo "PlantApp Backend DOWN" | mail -s "Alert: PlantApp Backend" admin@example.com
```

---

### Windows (Task Scheduler con PowerShell)

**Script PowerShell para Cronjob** (`ping-plantapp.ps1`):
```powershell
# Configuración
$url = "http://localhost:3000/api/ping"
$logFile = "C:\logs\plantapp-ping.log"

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
    if ($response -eq "OK") {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -Path $logFile -Value "$timestamp - OK"
    }
} catch {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logFile -Value "$timestamp - ERROR: $_"
    # Opcional: enviar alerta por email
}
```

**Crear Tarea Programada:**
```powershell
# Crear tarea que ejecute el ping cada 5 minutos
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File C:\scripts\ping-plantapp.ps1"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 365)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "PlantApp Health Check" -Action $action -Trigger $trigger -Settings $settings -User "SYSTEM"
```

---

## 🌐 Servicios de Monitoreo Externos

Estos endpoints son compatibles con servicios de uptime monitoring:

- **UptimeRobot** (https://uptimerobot.com)
- **Pingdom** (https://pingdom.com)
- **StatusCake** (https://statuscake.com)
- **BetterUptime** (https://betteruptime.com)
- **Healthchecks.io** (https://healthchecks.io)

**Recomendación:** Usar `/api/ping` para checks simples y `/api/health` para monitoring avanzado.

---

## 🔒 Producción

Si tu aplicación está desplegada en producción, reemplaza `localhost:3000` con tu dominio:

```bash
# Ejemplo con dominio de producción
curl https://api.plantapp.com/api/ping
curl https://api.plantapp.com/api/health
curl https://api.plantapp.com/api/status
```

---

## 📊 Interpretación de Respuestas

| Endpoint | Respuesta OK | Indica |
|----------|-------------|--------|
| `/api/ping` | `OK` | Servidor respondiendo |
| `/api/health` | `{"status": "OK", ...}` | Servidor healthy con métricas |
| `/api/status` | `ONLINE - <timestamp>` | Servidor activo con fecha |

**Cualquier status code diferente a 200 indica que el servicio NO está disponible.**

---

## ⚡ Características

- ✅ Sin autenticación requerida (diseñado para monitoreo público)
- ✅ Respuestas rápidas (< 10ms)
- ✅ Headers `no-cache` para evitar cacheo
- ✅ Compatible con todos los monitores de uptime
- ✅ Formato de respuesta consistente
