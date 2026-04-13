param(
    [int]$Port = 5500,
    [string]$Path = "frontend-examples"
)

$ErrorActionPreference = "Stop"

$workspaceRoot = Resolve-Path (Join-Path $PSScriptRoot "..\\..")
$serveRoot = Resolve-Path (Join-Path $workspaceRoot $Path)
$venvPythonPath = Join-Path $workspaceRoot ".venv\\Scripts\\python.exe"

if (Test-Path $venvPythonPath) {
    & $venvPythonPath -m http.server $Port --directory $serveRoot
} else {
    python -m http.server $Port --directory $serveRoot
}
