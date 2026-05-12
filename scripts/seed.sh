#!/bin/bash

echo "Seeding database..."
docker exec app_node_backend node scripts/seed.js
