#!/bin/bash
# DB backup script — run daily via cron
# Usage: ./backup.sh [db_name]

DB_NAME="${1:-smart_banking_powered_by_ai}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

if command -v mysqldump &> /dev/null; then
  mysqldump -h "${DB_HOST:-localhost}" -u "${DB_USER:-root}" \
    -p"${DB_PASSWORD}" "$DB_NAME" > "$FILENAME" 2>/dev/null
  gzip "$FILENAME"
  echo "Backup saved: ${FILENAME}.gz"
else
  echo "mysqldump not found — install mysql-client"
  exit 1
fi

# Keep last 7 daily backups, remove older
find "$BACKUP_DIR" -name "${DB_NAME}_*.gz" -mtime +7 -delete
