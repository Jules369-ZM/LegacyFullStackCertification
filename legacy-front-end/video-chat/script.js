// P2P Video Chat Application (Demo Version)
// Note: This is a frontend-only demonstration. Full P2P functionality requires a backend signaling server.

class VideoChatApp {
    constructor() {
        this.localStream = null;
        this.currentRoom = null;
        this.isConnected = false;

        // DOM elements
        this.roomSelection = document.getElementById('roomSelection');
        this.videoChat = document.getElementById('videoChat');
        this.roomFull = document.getElementById('roomFull');

        this.permissionPrompt = document.getElementById('permissionPrompt');
        this.roomForm = document.getElementById('roomForm');
        this.roomNameForm = document.getElementById('roomNameForm');
        this.roomNameInput = document.getElementById('roomNameInput');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');

        this.currentRoomName = document.getElementById('currentRoomName');
        this.statusText = document.getElementById('statusText');
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');

        this.muteBtn = document.getElementById('muteBtn');
        this.videoBtn = document.getElementById('videoBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.leaveBtn = document.getElementById('leaveBtn');
        this.backToRoomSelect = document.getElementById('backToRoomSelect');

        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
        await this.requestMediaAccess();
    }

    setupEventListeners() {
        // Room form
        this.roomNameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRoomJoin();
        });

        // Control buttons
        this.retryBtn.addEventListener('click', () => this.retryMediaAccess());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.videoBtn.addEventListener('click', () => this.toggleVideo());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.leaveBtn.addEventListener('click', () => this.leaveRoom());
        this.backToRoomSelect.addEventListener('click', () => this.showRoomSelection());

        // Input validation
        this.roomNameInput.addEventListener('input', () => this.validateRoomName());
    }

    async requestMediaAccess() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            this.localVideo.srcObject = this.localStream;
            this.showRoomForm();

        } catch (error) {
            console.error('Media access error:', error);
            this.showErrorMessage();
        }
    }

    async retryMediaAccess() {
        this.errorMessage.style.display = 'none';
        this.permissionPrompt.style.display = 'block';
        await this.requestMediaAccess();
    }

    showRoomForm() {
        this.permissionPrompt.style.display = 'none';
        this.roomForm.style.display = 'block';
        this.roomNameInput.focus();
    }

    showErrorMessage() {
        this.permissionPrompt.style.display = 'none';
        this.errorMessage.style.display = 'block';
    }

    validateRoomName() {
        const roomName = this.roomNameInput.value.trim();
        const submitBtn = this.roomNameForm.querySelector('button[type="submit"]');

        if (roomName.length === 0) {
            submitBtn.disabled = true;
            return false;
        }

        // Check for only whitespace
        if (roomName.length > 0 && /^\s*$/.test(roomName)) {
            submitBtn.disabled = true;
            return false;
        }

        submitBtn.disabled = false;
        return true;
    }

    handleRoomJoin() {
        const roomName = this.roomNameInput.value.trim();

        if (!this.validateRoomName()) {
            alert('Please enter a valid room name');
            return;
        }

        // In a real implementation, this would check with the server
        // For demo purposes, we'll simulate room availability
        if (this.simulateRoomCheck(roomName)) {
            this.joinRoom(roomName);
        } else {
            this.showRoomFull();
        }
    }

    simulateRoomCheck(roomName) {
        // Simulate room availability (90% chance of being available)
        return Math.random() > 0.1;
    }

    joinRoom(roomName) {
        this.currentRoom = roomName;
        this.currentRoomName.textContent = roomName;
        this.statusText.textContent = 'Waiting for partner...';

        this.showVideoChat();

        // Simulate connection after a short delay
        setTimeout(() => {
            this.statusText.textContent = 'Demo Mode: Video chat interface loaded';
        }, 2000);
    }

    showRoomSelection() {
        this.roomSelection.classList.remove('hidden');
        this.videoChat.classList.add('hidden');
        this.roomFull.classList.add('hidden');

        // Reset form
        this.roomNameForm.reset();
        this.roomNameInput.focus();
    }

    showVideoChat() {
        this.roomSelection.classList.add('hidden');
        this.videoChat.classList.remove('hidden');
        this.roomFull.classList.add('hidden');
    }

    showRoomFull() {
        this.roomSelection.classList.add('hidden');
        this.videoChat.classList.add('hidden');
        this.roomFull.classList.remove('hidden');
    }

    toggleMute() {
        if (this.localStream) {
            const audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const audioTrack = audioTracks[0];
                audioTrack.enabled = !audioTrack.enabled;

                this.muteBtn.innerHTML = audioTrack.enabled
                    ? '<i class="fas fa-microphone"></i> Mute'
                    : '<i class="fas fa-microphone-slash"></i> Unmute';
            }
        }
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTracks = this.localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                const videoTrack = videoTracks[0];
                videoTrack.enabled = !videoTrack.enabled;

                this.videoBtn.innerHTML = videoTrack.enabled
                    ? '<i class="fas fa-video"></i> Turn Off Video'
                    : '<i class="fas fa-video-slash"></i> Turn On Video';
            }
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable full-screen mode:', err);
            });
            this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
        } else {
            document.exitFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
        }
    }

    leaveRoom() {
        // Stop all media tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Reset UI
        this.currentRoom = null;
        this.isConnected = false;

        // Go back to room selection
        this.showRoomSelection();
    }

    // Utility method to show messages (for future WebRTC signaling)
    showMessage(message) {
        console.log('Video Chat:', message);
        // In a real implementation, this would show messages to the user
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VideoChatApp();
});

// Add fullscreen change event listener
document.addEventListener('fullscreenchange', () => {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
    } else {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
    }
});

/*
 * PRODUCTION IMPLEMENTATION NOTES:
 *
 * For a real P2P video chat application, you would need:
 *
 * 1. Backend Signaling Server (Node.js + Socket.io):
 *    - Handle room creation and management
 *    - Relay WebRTC offer/answer/ICE candidates
 *    - Manage room capacity (max 2 users per room)
 *
 * 2. WebRTC Implementation:
 *    - Create RTCPeerConnection for each participant
 *    - Handle offer/answer SDP exchange
 *    - Manage ICE candidate exchange
 *    - Set up media streams
 *
 * 3. STUN/TURN Servers:
 *    - Required for NAT traversal
 *    - Free STUN servers available for development
 *    - TURN servers needed for production
 *
 * 4. Security Considerations:
 *    - HTTPS required for WebRTC
 *    - Room name validation and sanitization
 *    - Rate limiting for room creation
 *
 * This demo shows the UI/UX and basic media access,
 * but actual video calling requires the backend infrastructure.
 */
