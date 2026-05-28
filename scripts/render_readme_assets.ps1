# SPDX-License-Identifier: AGPL-3.0-or-later

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$screenshots = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $screenshots | Out-Null

function New-ProofImage {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle,
        [string[]]$Bullets
    )

    $bitmap = New-Object System.Drawing.Bitmap 1440, 900
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        ([System.Drawing.Point]::new(0, 0)),
        ([System.Drawing.Point]::new(1440, 900)),
        ([System.Drawing.Color]::FromArgb(255, 5, 7, 12)),
        ([System.Drawing.Color]::FromArgb(255, 7, 10, 15))
    )
    $graphics.FillRectangle($background, 0, 0, 1440, 900)

    $panelBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 11, 18, 32))
    $panelRect = [System.Drawing.Rectangle]::new(70, 70, 1300, 760)
    $graphics.FillRectangle($panelBrush, $panelRect)

    $outlinePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 55, 255, 139), 2)
    $graphics.DrawRectangle($outlinePen, $panelRect)

    $titleFont = New-Object System.Drawing.Font("Segoe UI", 34, [System.Drawing.FontStyle]::Bold)
    $eyebrowFont = New-Object System.Drawing.Font("Consolas", 16, [System.Drawing.FontStyle]::Regular)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)

    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 233, 243, 255))
    $mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 233, 243, 255))
    $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 25, 199, 255))

    $graphics.DrawString("TABLEAU PERMISSION AUDIT LAB", $eyebrowFont, $accentBrush, 92, 92)
    $graphics.DrawString($Title, $titleFont, $textBrush, 92, 138)
    $graphics.DrawString($Subtitle, $bodyFont, $mutedBrush, [System.Drawing.RectangleF]::new(92, 220, 1120, 90))

    $y = 340
    foreach ($bullet in $Bullets) {
        $graphics.DrawString("• " + $bullet, $bodyFont, $mutedBrush, [System.Drawing.RectangleF]::new(110, $y, 1120, 44))
        $y += 56
    }

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-ProofImage -Path (Join-Path $screenshots "01-overview-proof.png") `
    -Title "Permission-safe analytics administration posture" `
    -Subtitle "Operator-readable proof for workbook access, group sync, certification trust, and audit continuity." `
    -Bullets @(
        "Surface the same permission packets platform, reporting, and identity teams argue over.",
        "Keep stale access and expired shares visible before they become audit findings.",
        "Show recruiter-readable Tableau, BI admin, and analytics-governance depth."
    )

New-ProofImage -Path (Join-Path $screenshots "02-permission-lane-proof.png") `
    -Title "Lane ownership and access routing" `
    -Subtitle "Each lane maps to a real Tableau governance responsibility instead of generic BI copy." `
    -Bullets @(
        "Permissions, group sync, certification, and sharing lanes stay separated and accountable.",
        "Owner mapping keeps BI platform, identity operations, and reporting operations explicit.",
        "Findings roll up into review-safe next actions."
    )

New-ProofImage -Path (Join-Path $screenshots "03-audit-gaps-proof.png") `
    -Title "Audit gaps before access drift spreads" `
    -Subtitle "Gap tables show where Tableau trust, external exposure, and certification posture are drifting." `
    -Bullets @(
        "Permission sprawl and group-sync gaps stay visible in one surface.",
        "External sharing drift and stale certification do not hide in email threads.",
        "The same primitive can ladder into paid templates, hosted preview, or embedded delivery."
    )

New-ProofImage -Path (Join-Path $screenshots "04-certification-posture-proof.png") `
    -Title "Certification posture before sign-off" `
    -Subtitle "Decision packets show which Tableau review lanes can move and which should stop." `
    -Bullets @(
        "Completeness score, blocker, and review window stay in one view.",
        "High-severity access debt is visible before sensitive content is recertified.",
        "Owner-safe remediation becomes part of the governance rhythm."
    )
