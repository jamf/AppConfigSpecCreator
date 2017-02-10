#!/bin/bash
r.js -o assets/js/lib/build.js
sed -i.bak 's/main.js/main-built.js/' index.html
