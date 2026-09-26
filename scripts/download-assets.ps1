$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$DownloadDir = Join-Path $Root "downloads"
$PublicDir = Join-Path $Root "public"

New-Item -ItemType Directory -Force -Path $DownloadDir | Out-Null
New-Item -ItemType Directory -Force -Path $PublicDir | Out-Null

function Download-File($Url, $Dest) {
  Write-Host "  URL: $Url"
  & curl.exe -L --retry 3 --retry-delay 3 --connect-timeout 30 --max-time 600 -o $Dest $Url
  if ($LASTEXITCODE -ne 0) { throw "curl failed for $Url" }
  $size = (Get-Item $Dest).Length
  if ($size -lt 50000) {
    throw "Download too small ($size bytes) - likely not a real archive: $Url"
  }
  Write-Host "  Saved $size bytes to $Dest"
}

$Assets = @(
  @{
    Name = "kenney-characters"
    Urls = @(
      "https://opengameart.org/sites/default/files/Kenney_characterPack_1.zip",
      "https://lpc.opengameart.org/sites/default/files/Kenney_characterPack_1.zip"
    )
    File = "Kenney_characterPack_1.zip"
  },
  @{
    Name = "kenney-backgrounds"
    Urls = @(
      "https://opengameart.org/sites/default/files/background%20mountains%20-%20parallax.zip",
      "https://opengameart.org/sites/default/files/topdown%20backgrounds.zip"
    )
    File = "backgrounds_pack.zip"
    Optional = $true
  }
)

foreach ($asset in $Assets) {
  $dest = Join-Path $DownloadDir $asset.File
  if (Test-Path $dest) {
    $size = (Get-Item $dest).Length
    if ($size -ge 50000) {
      Write-Host "Already downloaded: $($asset.File) ($size bytes)"
      continue
    }
    Remove-Item $dest -Force
  }

  Write-Host "Downloading $($asset.Name)..."
  $ok = $false
  foreach ($url in $asset.Urls) {
    try {
      Download-File $url $dest
      $ok = $true
      break
    } catch {
      Write-Host "  Failed: $_"
    }
  }
  if (-not $ok) {
    if ($asset.Optional) {
      Write-Host "  Skipping optional asset $($asset.Name)"
    } else {
      throw "All download URLs failed for $($asset.Name)"
    }
  }
}

Write-Host ""
Write-Host "Downloads complete. Running asset preparation..."
node (Join-Path $Root "scripts/prepare-assets.mjs")
