@echo off
title University NFT System Launcher
color 0A

echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║       UNIVERSITY NFT CERTIFICATE SYSTEM - LAUNCHER            ║
echo  ║                  Decentralized DCIVS                          ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Starting all services...
echo.

:: Check if node_modules exist
if not exist "backend\node_modules" (
    echo [WARN] Dependencies not installed! Run 'npm run setup' first.
    echo.
    pause
    exit
)

echo [1/4] Starting Hardhat Blockchain Node...
start "🔗 Hardhat Node" cmd /k "cd my-hardhat-project && npx hardhat node"

echo [INFO] Waiting 5 seconds for blockchain to initialize...
timeout /t 5 /nobreak >nul

echo [2/4] Deploying Smart Contract...
start "📜 Contract Deploy" cmd /k "cd my-hardhat-project && npx hardhat run scripts/deploy-nft.js --network localhost && echo. && echo ✅ Contract deployed! && echo 💡 You can close this window. && pause"

echo [INFO] Waiting 3 seconds for contract deployment...
timeout /t 3 /nobreak >nul

echo [3/4] Starting Backend Server (Port 3001)...
start "🖥️ Backend Server" cmd /k "cd backend && npm start"

echo [4/4] Starting Frontend (Port 5173)...
start "🌐 Frontend" cmd /k "cd Frontend\nft-viewer && npm run dev"

echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                    SYSTEM LAUNCHED!                           ║
echo  ╠═══════════════════════════════════════════════════════════════╣
echo  ║  Frontend:   http://localhost:5173                            ║
echo  ║  Backend:    http://localhost:3001                            ║
echo  ║  Blockchain: http://localhost:8545                            ║
echo  ║                                                               ║
echo  ║  Admin Login: backup_admin@test.com / admin_backup_123        ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Press any key to exit this launcher (services will keep running)...
pause >nul
