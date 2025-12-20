@echo off
echo ===================================================
echo      INSTALLING PROJECT DEPENDENCIES
echo ===================================================

echo [1/5] Installing Root dependencies...
call npm install
if %errorlevel% neq 0 echo Warning: Root install failed or no package.json

echo [2/5] Installing Backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 echo Warning: Backend install failed
cd ..

echo [3/5] Installing Frontend dependencies...
cd Frontend\nft-viewer
call npm install
if %errorlevel% neq 0 echo Warning: Frontend install failed
cd ..\..

echo [4/5] Installing OCR Prototype dependencies...
cd ocr-prototype
call npm install
if %errorlevel% neq 0 echo Warning: OCR install failed
cd ..

echo [5/5] Installing Hardhat Project dependencies...
cd my-hardhat-project
call npm install
if %errorlevel% neq 0 echo Warning: Hardhat install failed
cd ..

echo ===================================================
echo      SETUP COMPLETE!
echo ===================================================
pause
