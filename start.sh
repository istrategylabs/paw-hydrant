#!/bin/bash

udevd &
udevadm trigger &> /dev/null
node index.js
