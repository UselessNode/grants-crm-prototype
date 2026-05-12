#!/bin/bash

echo "Running migrations..."

for file in $(ls scripts/migrations/*.sql | sort); do
    echo "$(basename $file)"
    docker exec -i app_postgres psql -U postgres -d grants_crm < "$file" 2>&1 | grep -v "NOTICE"
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "Done"
    else
        echo "Failed"
        exit 1
    fi
done

echo "Migration complete"
docker exec app_postgres psql -U postgres -d grants_crm -c "\dt" | grep -E "public|rows"
