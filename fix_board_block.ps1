$content = Get-Content -Path src\components\BoardBlock.tsx -Raw

# Remove the createTestTask function
$content = $content -replace '(?s)  // Create a test task for debugging.*?  // Handle column deletion', '  // Handle column deletion'

# Save the modified content back to the file
$content | Set-Content -Path src\components\BoardBlock.tsx

Write-Host "File has been fixed!" 