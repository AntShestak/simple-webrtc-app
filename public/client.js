const peerConnection = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:a.relay.metered.ca:80",
        },
        {
            urls: "turn:a.relay.metered.ca:80",
            username: "a276bf537800bd9c0302897d",
            credential: "6EvrimDTyR8MsNUP",
        },
        {
            urls: "turn:a.relay.metered.ca:80?transport=tcp",
            username: "a276bf537800bd9c0302897d",
            credential: "6EvrimDTyR8MsNUP",
        },
        {
            urls: "turn:a.relay.metered.ca:443",
            username: "a276bf537800bd9c0302897d",
            credential: "6EvrimDTyR8MsNUP",
        },
        {
            urls: "turn:a.relay.metered.ca:443?transport=tcp",
            username: "a276bf537800bd9c0302897d",
            credential: "6EvrimDTyR8MsNUP",
        },
    ]
});
let localStream = null;

// Access the user's video and audio
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        document.getElementById('localVideo').srcObject = stream;
        localStream = stream;

        // Add the stream to the RTCPeerConnection
        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    });

    const createOfferButton = document.getElementById('createOffer');
    createOfferButton.onclick = () => {
        peerConnection.createOffer()
            .then(offer => {
                return peerConnection.setLocalDescription(offer);
            })
            .then(() => {
                // Send the offer to the signaling server
                socket.emit('offer', peerConnection.localDescription);
            });
    };

// Handle signaling server messages and WebRTC signaling here
var socket = io.connect(window.location.origin);

// Listen for remote ICE candidates and add them to the peer connection
socket.on('candidate', candidate => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Listen for offers
socket.on('offer', (offer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    peerConnection.createAnswer()
        .then(answer => {
            peerConnection.setLocalDescription(answer);
            socket.emit('answer', answer); // Send answer to the server
        })
        .catch(error => console.error('Error creating an answer', error));
});

// Listen for answers
socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Sending ICE candidates to the signaling server
peerConnection.onicecandidate = event => {
    if (event.candidate) {
        socket.emit('candidate', event.candidate);
    }
};

// Once the remote stream arrives, display it in the #remoteVideo element
peerConnection.ontrack = event => {
    if (event.streams && event.streams[0]) {
        document.getElementById('remoteVideo').srcObject = event.streams[0];
    }
};

// Creating an offer to connect with a peer
// function createOffer() {
//     peerConnection.createOffer()
//         .then(offer => {
//             return peerConnection.setLocalDescription(offer);
//         })
//         .then(() => {
//             // Send the offer to the signaling server
//             socket.emit('offer', peerConnection.localDescription);
//         })
//         .catch(error => console.error('Error creating an offer', error));
// }

// Optionally, call createOffer somewhere in your code to start the process,
// for example, in response to a button click
// createOffer();
