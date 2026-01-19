@echo off
chcp 65001 >nul
echo ========================================
echo   Démarrage du projet La Dalle
echo ========================================
echo.

REM Mettre à jour le PATH pour cette session
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Vérifier Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé ou n'est pas dans le PATH
    echo Veuillez redémarrer votre terminal après l'installation de Node.js
    pause
    exit /b 1
)

REM Afficher les versions
echo Vérification de l'installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas disponible
    pause
    exit /b 1
)
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] npm n'est pas disponible
    pause
    exit /b 1
)
echo ✓ Node.js et npm sont disponibles
echo.

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo Installation des dépendances...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de l'installation des dépendances
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Démarrage du serveur Expo...
echo ========================================
echo Appuyez sur Ctrl+C pour arrêter
echo.

REM Lancer Expo (sans call pour que le processus reste actif)
npm start
