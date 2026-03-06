$baseUrl = "https://themejunction.net/html/solvior/demo"
$destBase = "C:\Users\supri\Documents\Conneto-Internship-portal_new\Conneto-Internship-portal\public\solvior"

# Create folder structure
$folders = @("css", "js", "images/logos", "images/hero", "images/about", "images/bg", "webfonts")
foreach ($f in $folders) {
    New-Item -ItemType Directory -Force -Path "$destBase\$f" | Out-Null
}

function Download($url, $dest) {
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop
        Write-Host "OK: $url"
    } catch {
        Write-Host "FAIL: $url - $_"
    }
}

# CSS files
Download "$baseUrl/assets/css/bootstrap.min.css" "$destBase\css\bootstrap.min.css"
Download "$baseUrl/assets/css/animate.css" "$destBase\css\animate.css"
Download "$baseUrl/assets/css/main.css" "$destBase\css\main.css"
Download "$baseUrl/assets/css/font-awesome-pro.min.css" "$destBase\css\font-awesome-pro.min.css"
Download "$baseUrl/assets/css/swiper.min.css" "$destBase\css\swiper.min.css"
Download "$baseUrl/assets/css/meanmenu.css" "$destBase\css\meanmenu.css"
Download "$baseUrl/assets/css/odometer-theme-default.css" "$destBase\css\odometer-theme-default.css"
Download "$baseUrl/assets/css/nice-select.css" "$destBase\css\nice-select.css"
Download "$baseUrl/assets/css/venobox.min.css" "$destBase\css\venobox.min.css"
Download "$baseUrl/assets/css/solvior-icons.css" "$destBase\css\solvior-icons.css"

# JS files
Download "$baseUrl/assets/js/jquery-3.7.1.min.js" "$destBase\js\jquery-3.7.1.min.js"
Download "$baseUrl/assets/js/bootstrap.bundle.min.js" "$destBase\js\bootstrap.bundle.min.js"
Download "$baseUrl/assets/js/swiper.min.js" "$destBase\js\swiper.min.js"
Download "$baseUrl/assets/js/wow.min.js" "$destBase\js\wow.min.js"
Download "$baseUrl/assets/js/odometer.min.js" "$destBase\js\odometer.min.js"
Download "$baseUrl/assets/js/waypoints.min.js" "$destBase\js\waypoints.min.js"
Download "$baseUrl/assets/js/meanmenu.min.js" "$destBase\js\meanmenu.min.js"
Download "$baseUrl/assets/js/nice-select.min.js" "$destBase\js\nice-select.min.js"
Download "$baseUrl/assets/js/venobox.min.js" "$destBase\js\venobox.min.js"
Download "$baseUrl/assets/js/lenis.min.js" "$destBase\js\lenis.min.js"
Download "$baseUrl/assets/js/gsap.min.js" "$destBase\js\gsap.min.js"
Download "$baseUrl/assets/js/ScrollTrigger.min.js" "$destBase\js\ScrollTrigger.min.js"
Download "$baseUrl/assets/js/main.js" "$destBase\js\main.js"

# Logos
Download "$baseUrl/assets/images/logos/primary-logo.png" "$destBase\images\logos\primary-logo.png"
Download "$baseUrl/assets/images/logos/white-logo.png" "$destBase\images\logos\white-logo.png"

# Hero images
Download "$baseUrl/assets/images/hero/h2-hero-thumb-1.webp" "$destBase\images\hero\h2-hero-thumb-1.webp"
Download "$baseUrl/assets/images/hero/h2-hero-thumb-2.webp" "$destBase\images\hero\h2-hero-thumb-2.webp"
Download "$baseUrl/assets/images/hero/h2-hero-thumb-3.webp" "$destBase\images\hero\h2-hero-thumb-3.webp"
Download "$baseUrl/assets/images/hero/h2-hero-shape-1.svg" "$destBase\images\hero\h2-hero-shape-1.svg"
Download "$baseUrl/assets/images/hero/h2-hero-shape-2.png" "$destBase\images\hero\h2-hero-shape-2.png"
Download "$baseUrl/assets/images/hero/h2-hero-bg.webp" "$destBase\images\hero\h2-hero-bg.webp"

# About images
Download "$baseUrl/assets/images/about/about-thumb-1.webp" "$destBase\images\about\about-thumb-1.webp"
Download "$baseUrl/assets/images/about/about-thumb-2.webp" "$destBase\images\about\about-thumb-2.webp"

# Background/shape images
Download "$baseUrl/assets/images/bg/hero-bg.webp" "$destBase\images\bg\hero-bg.webp"
Download "$baseUrl/assets/images/shapes/carrow.png" "$destBase\images\shapes\carrow.png"

Write-Host "Done!"
