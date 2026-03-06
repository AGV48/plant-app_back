#!/bin/bash
# ============================================
# PlantApp Backend - Simple Cronjob (Linux/Mac)
# ============================================
# Script minimalista para cronjobs en sistemas Unix
# Compatible con el estilo del código PHP que compartiste

# Configuración
BACKEND_URL="http://localhost:3000/api/ping"
LOG_FILE="/var/log/plantapp-health.log"
MAX_LOG_SIZE=10485760  # 10MB en bytes

# Función para rotar log si es muy grande
rotate_log() {
    if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null) -gt $MAX_LOG_SIZE ]; then
        mv "$LOG_FILE" "$LOG_FILE.old"
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Log rotado" > "$LOG_FILE"
    fi
}

# Realizar health check
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BACKEND_URL")

# Timestamp
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# Verificar respuesta
if [ "$response" = "200" ]; then
    echo "[$timestamp] OK - Backend respondiendo" >> "$LOG_FILE"
    exit 0
else
    echo "[$timestamp] ERROR - Backend no responde (HTTP $response)" >> "$LOG_FILE"
    # Opcional: enviar email de alerta
    # echo "PlantApp Backend DOWN" | mail -s "Alert: PlantApp Backend" admin@example.com
    exit 1
fi

# Rotar log si es necesario
rotate_log

# ============================================
# INSTALACIÓN EN CRONTAB
# ============================================
#
# 1. Guardar este archivo como: /usr/local/bin/plantapp-health-check.sh
# 2. Dar permisos de ejecución:
#    chmod +x /usr/local/bin/plantapp-health-check.sh
#
# 3. Editar crontab:
#    crontab -e
#
# 4. Agregar una de estas líneas:
#
#    # Ejecutar cada 5 minutos
#    */5 * * * * /usr/local/bin/plantapp-health-check.sh
#
#    # Ejecutar cada hora
#    0 * * * * /usr/local/bin/plantapp-health-check.sh
#
#    # Ejecutar cada 10 minutos solo de 8am a 8pm
#    */10 8-20 * * * /usr/local/bin/plantapp-health-check.sh
#
# 5. Verificar que está programado:
#    crontab -l
#
# ============================================
