# ============================================
# PlantApp Backend - Health Check Cronjob
# ============================================
# Este script verifica que el backend esté funcionando
# y registra el resultado en un archivo de log.
#
# USO:
# 1. Configura las variables abajo
# 2. Ejecuta manualmente: .\ping-plantapp.ps1
# 3. Programa en Task Scheduler para ejecución automática
#
# PROGRAMAR EN TASK SCHEDULER:
# Ver instrucciones al final del archivo
# ============================================

# ==================== CONFIGURACIÓN ====================

# URL del backend (cambiar en producción)
$backendUrl = "http://localhost:3000/api/ping"

# Archivo de log (crear carpeta si no existe)
$logDirectory = "C:\logs"
$logFile = "$logDirectory\plantapp-health.log"

# Email para notificaciones (opcional, dejar vacío para deshabilitar)
$notifyEmail = ""  # Ejemplo: "admin@ejemplo.com"

# Número máximo de líneas en el log (limpieza automática)
$maxLogLines = 1000

# ==================== SCRIPT ====================

# Crear directorio de logs si no existe
if (-not (Test-Path $logDirectory)) {
    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
}

# Función para escribir en el log
function Write-Log {
    param([string]$message, [string]$level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$level] $message"
    Add-Content -Path $logFile -Value $logEntry
    Write-Host $logEntry
}

# Función para enviar email (requiere configuración de SMTP)
function Send-AlertEmail {
    param([string]$subject, [string]$body)
    
    if ([string]::IsNullOrEmpty($notifyEmail)) {
        return
    }
    
    # CONFIGURAR TUS DATOS DE SMTP AQUÍ
    $smtpServer = "smtp.gmail.com"
    $smtpPort = 587
    $smtpUser = "tu-email@gmail.com"
    $smtpPassword = "tu-contraseña-de-app"
    
    try {
        $securePassword = ConvertTo-SecureString $smtpPassword -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($smtpUser, $securePassword)
        
        Send-MailMessage `
            -To $notifyEmail `
            -From $smtpUser `
            -Subject $subject `
            -Body $body `
            -SmtpServer $smtpServer `
            -Port $smtpPort `
            -UseSsl `
            -Credential $credential
            
        Write-Log "Email enviado a $notifyEmail" "INFO"
    } catch {
        Write-Log "Error enviando email: $_" "ERROR"
    }
}

# Función para limpiar el log si es muy grande
function Cleanup-Log {
    if (Test-Path $logFile) {
        $lineCount = (Get-Content $logFile | Measure-Object -Line).Lines
        if ($lineCount -gt $maxLogLines) {
            $lastLines = Get-Content $logFile | Select-Object -Last 500
            $lastLines | Set-Content $logFile
            Write-Log "Log limpiado (reducido de $lineCount a 500 líneas)" "INFO"
        }
    }
}

# ==================== HEALTH CHECK ====================

Write-Log "Iniciando health check del backend..." "INFO"

try {
    # Realizar petición al backend
    $response = Invoke-RestMethod -Uri $backendUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
    
    # Verificar respuesta
    if ($response -eq "OK") {
        Write-Log "✅ Backend respondiendo correctamente" "SUCCESS"
        $exitCode = 0
    } else {
        Write-Log "⚠️ Backend respondió pero con valor inesperado: $response" "WARNING"
        $exitCode = 1
    }
    
} catch {
    # Error al conectar con el backend
    $errorMessage = $_.Exception.Message
    Write-Log "❌ Backend NO está respondiendo: $errorMessage" "ERROR"
    
    # Enviar alerta por email si está configurado
    $subject = "⚠️ ALERTA: PlantApp Backend NO responde"
    $body = @"
El backend de PlantApp no está respondiendo.

URL: $backendUrl
Timestamp: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Error: $errorMessage

Por favor, revisa el estado del servidor.
"@
    Send-AlertEmail -subject $subject -body $body
    
    $exitCode = 1
}

# Limpieza del log
Cleanup-Log

# Salir con código apropiado
exit $exitCode

# ==================== INSTRUCCIONES DE USO ====================
#
# OPCIÓN 1: EJECUTAR MANUALMENTE
# -------------------------------
# PowerShell -ExecutionPolicy Bypass -File "C:\scripts\ping-plantapp.ps1"
#
#
# OPCIÓN 2: PROGRAMAR EN TASK SCHEDULER (WINDOWS)
# ------------------------------------------------
# Ejecuta estos comandos en PowerShell como Administrador:
#
# $action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
#     -Argument "-ExecutionPolicy Bypass -File C:\scripts\ping-plantapp.ps1"
# 
# $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
#     -RepetitionInterval (New-TimeSpan -Minutes 5) `
#     -RepetitionDuration (New-TimeSpan -Days 365)
# 
# $settings = New-ScheduledTaskSettingsSet `
#     -AllowStartIfOnBatteries `
#     -DontStopIfGoingOnBatteries `
#     -ExecutionTimeLimit (New-TimeSpan -Minutes 2)
# 
# Register-ScheduledTask `
#     -TaskName "PlantApp Health Check" `
#     -Description "Verifica que el backend de PlantApp esté funcionando cada 5 minutos" `
#     -Action $action `
#     -Trigger $trigger `
#     -Settings $settings `
#     -User "SYSTEM" `
#     -RunLevel Highest
#
# Para verificar que se creó:
# Get-ScheduledTask -TaskName "PlantApp Health Check"
#
# Para deshabilitar:
# Disable-ScheduledTask -TaskName "PlantApp Health Check"
#
# Para eliminar:
# Unregister-ScheduledTask -TaskName "PlantApp Health Check" -Confirm:$false
#
#
# OPCIÓN 3: CRONJOB EN LINUX/MAC
# --------------------------------
# Edita el crontab: crontab -e
# Agrega esta línea (ejecutar cada 5 minutos):
# */5 * * * * curl -f -s http://localhost:3000/api/ping || echo "PlantApp DOWN" | mail -s "Alert" admin@ejemplo.com
#
# =============================================================
