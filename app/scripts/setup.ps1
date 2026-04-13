param(
    [switch]$Recreate,
    [switch]$SkipPython,
    [switch]$SkipNode
)

$ErrorActionPreference = "Stop"

$appRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$workspaceRoot = Resolve-Path (Join-Path $appRoot "..")
$venvPath = Join-Path $workspaceRoot ".venv"
$requirementsPath = Join-Path $workspaceRoot "requirements-dev.txt"
$packageJsonPath = Join-Path $appRoot "package.json"

if (-not $SkipNode) {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw "Node.js is required but was not found in PATH."
    }
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        throw "npm is required but was not found in PATH."
    }

    if (Test-Path $packageJsonPath) {
        Push-Location $appRoot
        try {
            npm install
        } finally {
            Pop-Location
        }
    }
}

if (-not $SkipPython) {
    if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
        throw "Python launcher (py) is required but was not found in PATH."
    }

    if ($Recreate -and (Test-Path $venvPath)) {
        Remove-Item -LiteralPath $venvPath -Recurse -Force
    }

    if (-not (Test-Path $venvPath)) {
        py -3 -m venv $venvPath
    }

    $pythonPath = Join-Path $venvPath "Scripts\\python.exe"

    & $pythonPath -m pip install --upgrade pip

    if (Test-Path $requirementsPath) {
        & $pythonPath -m pip install -r $requirementsPath
    }

    if (Test-Path (Join-Path $workspaceRoot ".git")) {
        Push-Location $workspaceRoot
        try {
            & $pythonPath -m pre_commit install
        } finally {
            Pop-Location
        }
    }
}

Write-Host ""
Write-Host "[OK] Development environment is ready."
if (-not $SkipPython) {
    Write-Host "Python activate: .\\.venv\\Scripts\\Activate.ps1"
}
if (-not $SkipNode) {
    Write-Host "Electron dev run:"
    Write-Host "  cd .\\app"
    Write-Host "  npm run dev"
}
