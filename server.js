const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8000;

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'index.html');
    }
    
    // Extrai extensão do arquivo
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }
    
    // Lê o arquivo
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Erro ao carregar arquivo');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(port, () => {
    console.log(`🚀 Servidor local rodando em: http://localhost:${port}`);
    console.log(`📱 Abra este link no navegador para testar o PWA`);
    console.log(`🔧 Para parar o servidor, pressione Ctrl+C`);
});