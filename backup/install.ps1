# Script d'installation pour le projet La Dalle
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation du projet La Dalle" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
Write-Host "Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js trouvé : $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Node.js n'est pas installé" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation de Node.js..." -ForegroundColor Yellow
    
    # Essayer d'installer via winget si disponible
    try {
        $wingetCheck = winget --version 2>$null
        if ($wingetCheck) {
            Write-Host "Installation via winget..." -ForegroundColor Yellow
            winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
            Write-Host "✓ Node.js installé via winget" -ForegroundColor Green
            Write-Host "Veuillez redémarrer le terminal et relancer ce script." -ForegroundColor Yellow
            exit
        }
    } catch {
        Write-Host ""
        Write-Host "⚠ winget n'est pas disponible" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ACTION REQUISE : Installation Node.js" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez installer Node.js manuellement :" -ForegroundColor Yellow
    Write-Host "1. Allez sur https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Téléchargez la version LTS" -ForegroundColor White
    Write-Host "3. Installez en cochant 'Add to PATH'" -ForegroundColor White
    Write-Host "4. Redémarrez le terminal" -ForegroundColor White
    Write-Host "5. Relancez ce script" -ForegroundColor White
    Write-Host ""
    
    # Ouvrir le navigateur sur le site de Node.js
    Start-Process "https://nodejs.org/"
    exit
}

# Vérifier npm
Write-Host "Vérification de npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✓ npm trouvé : $npmVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ npm n'est pas disponible" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Installation des dépendances npm..." -ForegroundColor Yellow
Write-Host "Cela peut prendre plusieurs minutes..." -ForegroundColor Gray
Write-Host ""

# Installer les dépendances
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Installation terminée avec succès!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour lancer le projet, utilisez :" -ForegroundColor Cyan
    Write-Host "  npm start" -ForegroundColor White
    Write-Host "ou" -ForegroundColor Gray
    Write-Host "  npx expo start" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Erreur lors de l'installation" -ForegroundColor Red
    Write-Host "Vérifiez les messages d'erreur ci-dessus" -ForegroundColor Yellow
}
