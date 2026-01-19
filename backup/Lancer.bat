@echo off
REM Script batch amélioré pour lancer le projet
chcp 65001 >nul
title La Dalle - Serveur Expo

echo ========================================
echo   Démarrage du projet La Dalle
echo ========================================
echo.

REM Mettre à jour le PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Vérifier Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas disponible
    echo Veuillez redémarrer votre terminal
    pause
    exit /b 1
)

REM Vérifier les dépendances
if not exist "node_modules" (
    echo Installation des dépendances...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de l'installation
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Serveur Expo en cours de démarrage...
echo ========================================
echo Appuyez sur Ctrl+C pour arrêter
echo.

REM Lancer Expo (sans call pour garder le processus actif)
npm start

REM Si on arrive ici, le processus s'est arrêté
pause
