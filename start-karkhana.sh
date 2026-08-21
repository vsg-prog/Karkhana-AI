#!/bin/bash
cd "/Users/raai/Claude/Projects/Karkhana-AI"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
unset ELECTRON_RUN_AS_NODE
npx electron .
