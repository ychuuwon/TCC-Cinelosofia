$login = curl.exe -s -X POST -H "Content-Type: application/json" -d '{"nome_usuario":"admin","senha":"admin123"}' http://localhost:7777/api/users/login | ConvertFrom-Json
$token = $login.token
Write-Host "Token: $token"
$upload = curl.exe -s -X POST -H "Authorization: Bearer $token" -F "slot=home" -F "image=@C:\\Users\\juuhp\\OneDrive\\Documentos\\TCC\\CINELOSOFIA\\TCC-Cinelosofia-com-novo-c-digo\\client\\public\\imagens\\encontro.png" http://localhost:7777/api/carousel
Write-Host $upload
