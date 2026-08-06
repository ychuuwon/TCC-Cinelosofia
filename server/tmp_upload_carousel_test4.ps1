$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:7777/api/users/login' -Body (@{ nome_usuario='admin'; senha='admin123' } | ConvertTo-Json) -ContentType 'application/json'
$token = $login.token
Write-Host "Token: $token"
$output = Join-Path $PSScriptRoot 'upload_output.txt'
Start-Process -FilePath 'curl.exe' -ArgumentList '-s','-X','POST','-H","Authorization: Bearer '+$token+'"','-F','slot=home','-F','image=@C:\\Users\\juuhp\\OneDrive\\Documentos\\TCC\\CINELOSOFIA\\TCC-Cinelosofia-com-novo-c-digo\\client\\public\\imagens\\encontro.png','http://localhost:7777/api/carousel' -NoNewWindow -Wait -RedirectStandardOutput $output
Get-Content $output | Write-Host
