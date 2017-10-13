#!/bin/sh

echo "=================================="
echo "Martin Docking Gateway version 2.0"
echo "=================================="

node file_watcher.js & node martin_docking.js
