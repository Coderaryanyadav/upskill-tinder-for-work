#!/bin/bash

# Create src/components directory
mkdir -p src/components

# Copy all component files
cp components/*.tsx src/components/

# Copy UI components
mkdir -p src/components/ui
cp components/ui/*.tsx src/components/ui/
cp components/ui/*.ts src/components/ui/

echo "All components copied to src/ directory"