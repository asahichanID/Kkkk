#!/usr/bin/env bash

# ==============================================================================
#  OGURICAP PTERODACTYL BOOTSTRAPPER & MODE SELECTOR
#  Skrip khusus untuk Pterodactyl Panel / VPS dengan prompt interaktif Console.
# ==============================================================================

# Warna ANSI untuk Terminal Console Pterodactyl
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[1;35m'
BOLD='\033[1m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OGURI_DIR="$ROOT_DIR/OguriCap"
MODE_FILE="$ROOT_DIR/.deploy-mode"

echo -e "${CYAN}================================================================${NC}"
echo -e "${MAGENTA}${BOLD}       🌸 OGURICAP DEPLOYMENT WIZARD (PTERODACTYL) 🌸           ${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "Silakan tentukan sistem yang ingin Anda aktifkan:"
echo -e ""
echo -e "  ${GREEN}${BOLD}[1] Web App${NC} (Dashboard Web Port 3000 + WhatsApp Bot Manager)"
echo -e "      - UI Kontrol Web modern, Realtime Logs, Auto-Sholat Reminder"
echo -e "      - Menggunakan port 3000"
echo -e ""
echo -e "  ${YELLOW}${BOLD}[2] Bot WA Saja${NC} (Standalone OguriCap di folder OguriCap/)"
echo -e "      - Sistem seutuhnya berpindah ke dalam folder OguriCap/"
echo -e "      - node_modules fleksibel terpasang/dipindahkan ke OguriCap/"
echo -e "      - Sangat hemat RAM & CPU di Pterodactyl Panel"
echo -e ""
echo -e "${CYAN}----------------------------------------------------------------${NC}"

# Cek apakah mode sudah diset via Environment Variable
CHOSEN_MODE=""

if [ -n "$DEPLOY_MODE" ]; then
    echo -e "${YELLOW}[ENV] Mendeteksi variabel DEPLOY_MODE: ${DEPLOY_MODE}${NC}"
    CHOSEN_MODE="$DEPLOY_MODE"
fi

# Jika belum ada dari env, beri prompt interaktif dengan timeout 15 detik
if [ -z "$CHOSEN_MODE" ]; then
    # Jika sudah pernah disimpan sebelumnya
    SAVED_MODE=""
    if [ -f "$MODE_FILE" ]; then
        SAVED_MODE=$(cat "$MODE_FILE" | tr -d '[:space:]')
        echo -e "${YELLOW}⚡ Mode sebelumnya: ${BOLD}${SAVED_MODE}${NC} (Tekan 1/2 untuk ubah, atau tunggu 15s)"
    fi

    echo -ne "${MAGENTA}${BOLD}Ketik pilihan Anda [1 / 2]: ${NC}"
    # Read dengan timeout 15 detik
    if read -t 15 USER_INPUT; then
        echo ""
        USER_INPUT=$(echo "$USER_INPUT" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')
        if [ "$USER_INPUT" = "2" ] || [ "$USER_INPUT" = "bot" ] || [ "$USER_INPUT" = "botwa" ] || [ "$USER_INPUT" = "oguri" ]; then
            CHOSEN_MODE="bot"
        elif [ "$USER_INPUT" = "1" ] || [ "$USER_INPUT" = "web" ] || [ "$USER_INPUT" = "webapp" ]; then
            CHOSEN_MODE="webapp"
        else
            echo -e "${YELLOW}[INFO] Input tidak valid, menggunakan default.${NC}"
            if [ -n "$SAVED_MODE" ]; then
                CHOSEN_MODE="$SAVED_MODE"
            else
                CHOSEN_MODE="webapp"
            fi
        fi
    else
        echo -e "\n${YELLOW}[AUTO-SELECT] Waktu habis / non-interaktif. Menggunakan mode default.${NC}"
        if [ -n "$SAVED_MODE" ]; then
            CHOSEN_MODE="$SAVED_MODE"
        else
            CHOSEN_MODE="webapp"
        fi
    fi
fi

# Simpan pilihan
echo "$CHOSEN_MODE" > "$MODE_FILE"

# ==============================================================================
# EKSEKUSI BERDASARKAN PILIHAN
# ==============================================================================

if [ "$CHOSEN_MODE" = "bot" ]; then
    echo -e "${GREEN}${BOLD}====================================================${NC}"
    echo -e "${GREEN}${BOLD}🚀 MENJALANKAN MODE: BOT WA SAJA (FOLDER OGURICAP/)  ${NC}"
    echo -e "${GREEN}${BOLD}====================================================${NC}"

    # Pastikan dependensi krusial (axios, baileys) terpasang di OguriCap/node_modules
    NEED_INSTALL=0
    if [ ! -d "$OGURI_DIR/node_modules/axios" ] || [ ! -d "$OGURI_DIR/node_modules/@sairidev" ]; then
        NEED_INSTALL=1
    fi

    if [ "$NEED_INSTALL" -eq 1 ]; then
        if [ -d "$ROOT_DIR/node_modules/axios" ]; then
            echo -e "${YELLOW}[OGURI] Sinkronisasi dependensi dari root ke OguriCap/node_modules...${NC}"
            mkdir -p "$OGURI_DIR/node_modules"
            cp -rn "$ROOT_DIR/node_modules"/* "$OGURI_DIR/node_modules/" 2>/dev/null || true
            echo -e "${GREEN}[OGURI] Sinkronisasi dependensi root selesai.${NC}"
        fi

        # Jika setelah disalin masih belum ada axios atau baileys, jalankan npm install di OguriCap
        if [ ! -d "$OGURI_DIR/node_modules/axios" ]; then
            echo -e "${CYAN}[OGURI] Menginstal dependensi langsung di dalam folder OguriCap/...${NC}"
            cd "$OGURI_DIR"
            npm install
        fi
    fi

    # Masuk ke folder OguriCap
    cd "$OGURI_DIR"

    # Jalankan proteksi anti-ban saluran sairidev
    if [ -f "$OGURI_DIR/scripts/clean-sairidev.js" ]; then
        echo -e "${CYAN}[BAN-GUARD] Menjalankan pembersihan auto-follow Baileys...${NC}"
        node scripts/clean-sairidev.js || true
    fi

    # Set NODE_PATH agar modul selalu dapat diakses
    export NODE_PATH="$OGURI_DIR/node_modules:$ROOT_DIR/node_modules:$NODE_PATH"

    echo -e "${GREEN}[START] Memulai bot WhatsApp dari OguriCap/start.js...${NC}"
    exec node start.js

else
    echo -e "${CYAN}${BOLD}====================================================${NC}"
    echo -e "${CYAN}${BOLD}🌐 MENJALANKAN MODE: WEB APP (DASHBOARD & BOT)      ${NC}"
    echo -e "${CYAN}${BOLD}====================================================${NC}"

    cd "$ROOT_DIR"

    if [ ! -d "$ROOT_DIR/node_modules/express" ] || [ ! -d "$ROOT_DIR/node_modules/axios" ]; then
        echo -e "${CYAN}[WEB] Menginstal dependensi di root...${NC}"
        npm install
    fi

    if [ -f "$ROOT_DIR/scripts/clean-sairidev.js" ]; then
        echo -e "${CYAN}[BAN-GUARD] Menjalankan pembersihan auto-follow Baileys...${NC}"
        node scripts/clean-sairidev.js || true
    fi

    export NODE_PATH="$ROOT_DIR/node_modules:$OGURI_DIR/node_modules:$NODE_PATH"

    echo -e "${GREEN}[START] Memulai Web App di port 3000...${NC}"
    if [ -f "$ROOT_DIR/dist/server.cjs" ] && [ "$NODE_ENV" = "production" ]; then
        exec node dist/server.cjs
    else
        exec npx tsx server.ts
    fi
fi
