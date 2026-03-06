$baseUrl = "https://themejunction.net/html/solvior/demo/assets/css"
$destCss = "C:\Users\supri\Documents\Conneto-Internship-portal_new\Conneto-Internship-portal\public\solvior\css"

# Try different paths for webfonts
$webfontFiles = @(
  "fa-brands-400.woff2", "fa-brands-400.woff",
  "fa-regular-400.woff2", "fa-regular-400.woff",
  "fa-solid-900.woff2", "fa-solid-900.woff",
  "fa-v4compatibility.woff2"
)

$webfontDest = "C:\Users\supri\Documents\Conneto-Internship-portal_new\Conneto-Internship-portal\public\solvior\webfonts"
New-Item -ItemType Directory -Force -Path $webfontDest | Out-Null

$tries = @("https://use.fontawesome.com/releases/v6.5.0/webfonts", "https://themejunction.net/html/solvior/demo/assets/webfonts")
foreach ($wf in $webfontFiles) {
  $dest = "$webfontDest\$wf"
  $success = $false
  foreach ($base in $tries) {
    try {
      Invoke-WebRequest -Uri "$base/$wf" -OutFile $dest -ErrorAction Stop
      Write-Host "OK: $wf"
      $success = $true
      break
    } catch { }
  }
  if (-not $success) { Write-Host "FAIL: $wf" }
}

# Download solvior icon font files
$iconFontFiles = @("solvior-icons.woff","solvior-icons.woff2","solvior-icons.ttf","solvior-icons.eot")
foreach ($f in $iconFontFiles) {
  $url = "https://themejunction.net/html/solvior/demo/assets/fonts/$f"
  $dest = "$destCss\$f"
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop
    Write-Host "OK font: $f"
  } catch {
    # Try inside css folder
    $url2 = "https://themejunction.net/html/solvior/demo/assets/css/$f"
    try {
      Invoke-WebRequest -Uri $url2 -OutFile $dest -ErrorAction Stop
      Write-Host "OK font (css): $f"
    } catch {
      Write-Host "FAIL font: $f"
    }
  }
}

Write-Host "Webfont download complete!"
