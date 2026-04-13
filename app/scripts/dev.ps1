param(
    [switch]$TypecheckOnly
)

$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Push-Location $projectRoot
try {
    if ($TypecheckOnly) {
        npm run typecheck
    } else {
        npm run dev
    }
} finally {
    Pop-Location
}
