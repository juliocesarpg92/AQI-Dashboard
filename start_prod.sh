#!/bin/bash
docker compose -f compose.yml up -d
# --force-recreate use it for config changes
# --build use it for code changes