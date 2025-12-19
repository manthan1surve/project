@echo off
echo ===================================================
echo      STARTING APPLICATION SUITE (4 TERMINALS)
echo ===================================================

echo [1/4] Starting Hardhat Blockchain Node...
start "Hardhat Local Node" cmd /k "cd my-hardhat-project && npx hardhat node"

echo Waiting 5 seconds for Blockchain to initialize...
timeout /t 5 /nobreak >nul

echo [2/4] Starting Hardhat Contract Deployment & Secondary Server...
@REM This opens a terminal for the user to run deployment scripts
start "Hardhat Ops" cmd /k "cd my-hardhat-project && echo Ready to deploy! Run: npx hardhat run scripts/deploy-nft.js --network localhost && echo. && echo OR Run legacy server: node server.js"

echo [3/4] Starting Main Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd backend && npm start"

echo [4/4] Starting Frontend Client...
start "Frontend Client" cmd /k "cd Frontend\nft-viewer && npm run dev"

echo ===================================================
echo      SYSTEM LAUNCHED
echo ===================================================
echo All 4 terminals are now active.
echo 1. Blockchain Node (Running)
echo 2. Contract Ops (Ready for commands)
echo 3. Backend (Running)
echo 4. Frontend (Running)
pause
