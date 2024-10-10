let peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const startSessionButton = document.getElementById('startSession');
const joinSessionButton = document.getElementById('joinSession');
const startBox = document.getElementById('startBox');
const joinBox = document.getElementById('joinBox');
const offerTextarea = document.getElementById('offer');

startSessionButton.onclick = async () => {
    try {
        // Открываем блок для начала сессии
        startBox.style.display = 'block';
        joinBox.style.display = 'none';

        // Создаём новый RTCPeerConnection
        peerConnection = new RTCPeerConnection(config);

        // Получаем доступ к микрофону
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        // Обработка ICE-кандидатов
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log('ICE Candidate:', event.candidate);
            }
        };

        // Обработка входящего аудиопотока
        peerConnection.ontrack = event => {
            const audio = document.createElement('audio');
            audio.srcObject = event.streams[0];
            audio.play();
        };

        // Создаём offer (предложение) и отображаем его
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        offerTextarea.value = JSON.stringify(peerConnection.localDescription);
        console.log("Offer создан:", offer);
    } catch (error) {
        console.error('Ошибка при создании сессии:', error);
    }
};

document.getElementById('setAnswer').onclick = async () => {
    try {
        const answer = JSON.parse(document.getElementById('answer').value);
        await peerConnection.setRemoteDescription(answer);
        console.log("Answer установлен:", answer);
    } catch (error) {
        console.error('Ошибка при установке answer:', error);
    }
};

joinSessionButton.onclick = () => {
    startBox.style.display = 'none';
    joinBox.style.display = 'block';
};

document.getElementById('createAnswer').onclick = async () => {
    try {
        peerConnection = new RTCPeerConnection(config);

        const offer = JSON.parse(document.getElementById('joinOffer').value);
        await peerConnection.setRemoteDescription(offer);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log('ICE Candidate:', event.candidate);
            }
        };

        peerConnection.ontrack = event => {
            const audio = document.createElement('audio');
            audio.srcObject = event.streams[0];
            audio.play();
        };

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        document.getElementById('joinAnswer').value = JSON.stringify(peerConnection.localDescription);
        console.log("Answer создан:", answer);
    } catch (error) {
        console.error('Ошибка при создании answer:', error);
    }
};
