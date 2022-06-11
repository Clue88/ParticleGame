#!/usr/bin/env bash
git clone https://github.com/Clue88/ParticleGame.git
cd ParticleGame
open "http://localhost:8000"
python3 -m http.server
