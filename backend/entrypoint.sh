#!/bin/sh
set -e

echo ">> Waiting for MySQL to be ready..."

# Extract host from SQLALCHEMY_DATABASE_URL
# Format: mysql+mysqlconnector://user:pass@host:port/db
DB_HOST=$(echo "$SQLALCHEMY_DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$SQLALCHEMY_DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')

if [ -z "$DB_HOST" ]; then
  DB_HOST="mysql"
fi
if [ -z "$DB_PORT" ]; then
  DB_PORT="3306"
fi

echo ">> DB host: $DB_HOST:$DB_PORT"

# Wait loop — max 60 detik
ATTEMPTS=0
MAX_ATTEMPTS=30
until python -c "
import mysql.connector, os, re
url = os.getenv('SQLALCHEMY_DATABASE_URL', '')
m = re.search(r'@([^:]+):(\d+)/', url)
host = m.group(1) if m else 'mysql'
port = int(m.group(2)) if m else 3306
cnx = mysql.connector.connect(host=host, port=port, user='root', password='root', connect_timeout=5)
cnx.close()
" 2>/dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "!! MySQL not ready after ${MAX_ATTEMPTS} attempts. Exiting."
    exit 1
  fi
  echo "   waiting... ($ATTEMPTS/$MAX_ATTEMPTS)"
  sleep 2
done

echo ">> MySQL is ready."

echo ">> Running migrations..."
alembic upgrade head

echo ">> Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
