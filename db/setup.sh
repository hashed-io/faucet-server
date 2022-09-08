#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username postgres -d postgres < /faucet-server-db/faucet-server-db.sql
