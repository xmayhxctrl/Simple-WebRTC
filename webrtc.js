const createRoomButton = document.getElementById('createRoom');
const roomLinkInput = document.getElementById('roomLink');
const joinRoomInput = document.getElementById('joinRoom');
const connectRoomButton = document.getElementById('connectRoom');
const remoteAudio = document.getElementById('remoteAudio');

let peerConnection;
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

createRoomButton.addEventListener('click', () => {
  const roomId = Math.random().toString(36).substring(7); // Генерация случайного ID комнаты
  const roomLink = `${window.location.origin}/?room=${roomId}`;
  roomLinkInput.value = roomLink;
  window.history.pushState({}, "", `?room=${roomId}`);
  
  initializePeerConnection(); // Настройка WebRTC соединения
});

connectRoomButton.addEventListener('click', () => {
  const roomLink = joinRoomInput.value;
  const urlParams = new URL(roomLink).searchParams;
  const roomId = urlParams.get('room');
  
  if (roomId) {
    window.history.pushState({}, "", `?room=${roomId}`);
    initializePeerConnection(); // Настройка WebRTC соединения
  }
});

function initializePeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);
  
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  });

  peerConnection.ontrack = (event) => {
    remoteAudio.srcObject = event.streams[0];
  };
  
  const currentUrl = new URL(window.location.href);
  const roomId = currentUrl.searchParams.get('room');
  
  if (roomId) {
    // Если пользователь присоединился к комнате
    peerConnection.createOffer().then((offer) => {
      return peerConnection.setLocalDescription(offer);
    }).then(() => {
      // Передать offer через копирование ссылки 
      const offerLink = `${window.location.href}&offer=${encodeURIComponent(peerConnection.localDescription.sdp)}`;
      roomLinkInput.value = offerLink;  
    });
    
    // Проверяем, есть ли ответ в URL
    const answer = currentUrl.searchParams.get('answer');
    if (answer) {
      const remoteDesc = new RTCSessionDescription({ type: 'answer', sdp: decodeURIComponent(answer) });
      peerConnection.setRemoteDescription(remoteDesc);
    }
  }

  // Обрабатываем, когда пользователь получил offer
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('New ICE candidate', event.candidate);
    }
  };
}
