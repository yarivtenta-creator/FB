#!/bin/bash
DATE=$(date +%Y%m%d_%H%M)
mkdir -p backups
cp data/sdr.db backups/sdr_${DATE}.db
echo "Backup created: backups/sdr_${DATE}.db"
