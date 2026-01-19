# Script de démarrage pour le projet La Dalle
# Ce script met à jour le PATH et lance le serveur Expo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Démarrage du projet La Dalle" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Mettre à jour le PATH pour inclure Node.js
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
    if ($env:Path -notlike "*$nodePath*") {
        $env:Path = "$nodePath;$env:Path"
        Write-Host "✓ PATH mis à jour avec Node.js" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ Node.js non trouvé dans $nodePath" -ForegroundColor Yellow
    Write-Host "Vérification du PATH système..." -ForegroundColor Yellow
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Vérifier Node.js et npm
Write-Host "Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js ou npm non disponible" -ForegroundColor Red
    Write-Host "Veuillez redémarrer votre terminal PowerShell" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Démarrage du serveur Expo..." -ForegroundColor Yellow
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Gray
Write-Host ""

# Vérifier si les dépendances sont installées
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Échec de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Démarrage du serveur Expo..." -ForegroundColor Yellow
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Gray
Write-Host ""

# Lancer Expo
npm start
