let scanning = false;  // Variável para verificar se o QR code foi lido

// Função para iniciar a câmera
function startCamera() {
    if (scanning) return;  // Se já tiver escaneado, não faz nada

    scanning = true;  // Marca que começamos a escanear
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Acesse a câmera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            video.srcObject = stream;
            video.setAttribute('playsinline', true); // Para que funcione no iPhone
            video.play();
            requestAnimationFrame(scanQRCode); // Inicia o processo de leitura do QR code
        })
        .catch(err => {
            console.error("Erro ao acessar a câmera: ", err);
        });

    // Função para escanear o QR code a cada quadro
    function scanQRCode() {
        if (!scanning) return; // Se já leu o QR code, não faz mais nada

        // Definir o tamanho do canvas para o tamanho do vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Desenhar o vídeo no canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Obter a imagem do canvas como dados
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
            // QR code foi encontrado
            handleQRCode(code);
        } else {
            // Continua escaneando se não encontrar nenhum QR code
            requestAnimationFrame(scanQRCode);
        }
    }
}

// Função para tratar o QR code lido
function handleQRCode(code) {
    // Exibe o conteúdo do QR code no log
    document.getElementById('log').textContent = `QR Code encontrado: ${code.data}`;

    // Parar o stream de vídeo e interromper a leitura da câmera
    stopCamera();

    // Exibir o botão de redirecionamento
    document.getElementById('redirect-button').style.display = 'inline-block';
}

// Função para parar a câmera
function stopCamera() {
    const video = document.getElementById('video');
    const stream = video.srcObject;

    // Se o stream da câmera estiver ativo, pare a captura de vídeo
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }

    scanning = false;  // Permitir escaneamento novamente, caso necessário
}

// Função para ler QR Code de um arquivo de imagem (upload)
function readQRCodeFromFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                document.getElementById('log').textContent = `QR Code encontrado: ${code.data}`;
                document.getElementById('redirect-button').style.display = 'inline-block'; // Exibe o botão
            } else {
                document.getElementById('log').textContent = 'Nenhum QR Code encontrado na imagem.';
            }
        };
        img.src = e.target.result;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}