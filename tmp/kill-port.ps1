$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $pid = $conn.OwningProcess
    Write-Host "Killing PID $pid on port 3000"
    Stop-Process -Id $pid -Force
    Write-Host "Done"
} else {
    Write-Host "No process listening on port 3000"
}
