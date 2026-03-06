$baseUrl = "https://themejunction.net/html/solvior/demo"
$rootDest = "C:\Users\supri\Documents\Conneto-Internship-portal_new\Conneto-Internship-portal\public\solvior\images"

$files = @(
  "slider/slider-1.webp", "slider/slider-2.webp", "slider/slider-3.webp",
  "about/h2-about-1.webp", "about/signature.png",
  "service/h1-service-1.webp", "service/h1-service-2.webp", "service/h1-service-3.webp",
  "team/team-1.webp", "team/team-2.webp", "team/team-3.webp", "team/team-4.webp",
  "testimonial/testi-author-1.webp", "testimonial/testi-author-2.webp", "testimonial/testi-author-3.webp",
  "icons/slider-award.svg",
  "shapes/slider-shapes.png", "shapes/carrow.png", "shapes/widget-cta-icon.png",
  "progress/h2-progress-1.webp", "progress/h2-progress-2.webp",
  "logos/white-logo.png", "logos/primary-logo.png",
  "fav.png"
)

foreach ($file in $files) {
  $url = "$baseUrl/assets/images/$file"
  $localPath = Join-Path $rootDest $file
  $localDir = Split-Path $localPath -Parent
  if (!(Test-Path $localDir)) { New-Item -ItemType Directory -Force -Path $localDir | Out-Null }
  try {
    Invoke-WebRequest -Uri $url -OutFile $localPath -ErrorAction Stop
    Write-Host "OK: $file"
  } catch {
    Write-Host "FAIL: $file - $_"
  }
}

# Additional JS files
$jsBase = "https://themejunction.net/html/solvior/demo/assets/js"
$jsDest = "C:\Users\supri\Documents\Conneto-Internship-portal_new\Conneto-Internship-portal\public\solvior\js"
$jsFiles = @("jquery-knob.js", "counterup.min.js")
foreach ($jf in $jsFiles) {
  $url = "$jsBase/$jf"
  $localPath = Join-Path $jsDest $jf
  try {
    Invoke-WebRequest -Uri $url -OutFile $localPath -ErrorAction Stop
    Write-Host "OK JS: $jf"
  } catch {
    Write-Host "FAIL JS: $jf"
  }
}

Write-Host "Image download complete!"
