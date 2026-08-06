$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:7777/api/users/login' -Body (@{ nome_usuario='admin'; senha='admin123' } | ConvertTo-Json) -ContentType 'application/json'
$token = $login.token
Write-Host "Token: $token"
$response = Invoke-RestMethod -Method Post -Uri 'http://localhost:7777/api/carousel' -Headers @{ Authorization = "Bearer $token" } -Form @{ slot = 'home'; image = Get-Item 'C:\Users\juuhp\OneDrive\Documentos\TCC\CINELOSOFIA\TCC-Cinelosofia-com-novo-c-digo\client\public\imagens\encontro.png' }
$response | ConvertTo-Json -Depth 5 | Write-Host
