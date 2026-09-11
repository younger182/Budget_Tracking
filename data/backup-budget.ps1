$source = ".\data\budget.sqlite"
$backupDir = ".\backups"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

Copy-Item $source "$backupDir\budget-$timestamp.sqlite"
Write-Host "Backup created: $backupDir\budget-$timestamp.sqlite"