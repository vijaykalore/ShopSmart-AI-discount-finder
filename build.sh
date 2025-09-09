#!/bin/bash
# Vercel build script
cd frontend
npm install
npm run build
cp -r build/* ../public/
