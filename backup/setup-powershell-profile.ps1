# Script pour configurer le profil PowerShell afin que Node.js soit toujours disponible
# Exécutez ce script une seule fois pour configurer votre profil PowerShell

Write-Host "Configuration du profil PowerShell..." -ForegroundColor Cyan
Write-Host ""

$profilePath = $PROFILE.CurrentUserAllHosts
$profileDir = Split-Path $profilePath -Parent

# Créer le répertoire du profil s'il n'existe pas
if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    Write-Host "✓ Répertoire du profil créé: $profileDir" -ForegroundColor Green
}

# Vérifier si Node.js est déjà dans le profil
$nodePath = "C:\Program Files\nodejs"
$profileContent = ""
if (Test-Path $profilePath) {
    $profileContent = Get-Content $profilePath -Raw
}

if ($profileContent -notlike "*$nodePath*") {
    # Ajouter Node.js au PATH dans le profil
    $addPathCommand = @"

# Ajout de Node.js au PATH (ajouté automatiquement)
`$env:Path = "C:\Program Files\nodejs;" + `$env:Path

"@
    
    Add-Content -Path $profilePath -Value $addPathCommand
    Write-Host "✓ Node.js ajouté au profil PowerShell" -ForegroundColor Green
    Write-Host "  Profil: $profilePath" -ForegroundColor Gray
} else {
    Write-Host "✓ Node.js est déjà configuré dans le profil" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pour appliquer les changements, exécutez:" -ForegroundColor Cyan
Write-Host "  . `$PROFILE" -ForegroundColor White
Write-Host ""
Write-Host "Ou redémarrez votre terminal PowerShell" -ForegroundColor Gray
