$ErrorActionPreference = 'Stop'
$workDir = 'd:\sweeted\sweeted-backend'
$outLog = 'C:\Users\ACER\AppData\Local\Temp\opencode\sweeted-server.out'
$errLog = 'C:\Users\ACER\AppData\Local\Temp\opencode\sweeted-server.err'

$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
    Write-Output "ALREADY_RUNNING PID=$($conn.OwningProcess)"
    exit 0
}

Remove-Item $outLog, $errLog -ErrorAction SilentlyContinue
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'cmd.exe'
$psi.Arguments = "/c node src/app.js 1> `"$outLog`" 2> `"$errLog`""
$psi.WorkingDirectory = $workDir
$psi.UseShellExecute = $true
$psi.WindowStyle = 'Hidden'
$p = [System.Diagnostics.Process]::Start($psi)
Write-Output "SERVER_PID=$($p.Id)"