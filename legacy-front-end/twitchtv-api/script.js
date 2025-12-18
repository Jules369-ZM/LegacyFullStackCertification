// TwitchTV JSON API - Mock Implementation
// Since Twitch API v5 is deprecated, this uses mock data to demonstrate API concepts

const streamers = [
    {
        name: "ESL_SC2",
        display_name: "ESL_SC2",
        logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/esl_sc2-profile_image-d6db9488cec97125-300x300.jpeg",
        status: "online",
        game: "StarCraft II",
        viewers: 15432,
        description: "Professional StarCraft II tournaments and competitive gaming"
    },
    {
        name: "OgamingSC2",
        display_name: "OgamingSC2",
        logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/ogamingsc2-profile_image-9021dccf9399929e-300x300.jpeg",
        status: "offline",
        game: null,
        viewers: 0,
        description: "StarCraft II content creator and streamer"
    },
    {
        name: "cretetion",
        display_name: "cretetion",
        logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/cretetion-profile_image-12bae34d9765f222-300x300.jpeg",
        status: "online",
        game: "Dota 2",
        viewers: 8765,
        description: "Dota 2 professional player and commentator"
    },
    {
        name: "freecodecamp",
        display_name: "FreeCodeCamp",
        logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/freecodecamp-profile_image-d571db1ba95b2c48-300x300.png",
        status: "online",
        game: "Creative",
        viewers: 5432,
        description: "Learn to code with FreeCodeCamp - 24/7 coding education"
    },
    {
        name: "storbeck",
        display_name: "storbeck",
        logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/storbeck-profile_image-7ab13c2f781b3c26-300x300.png",
        status: "offline",
        game: null,
        viewers: 0,
        description: "Robotics and engineering projects"
    },
    {
        name: "habathcx",
        display_name: "habathcx",
        logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/habathcx-profile_image-d75385dbe4f42a63-300x300.jpeg",
        status: "online",
        game: "Programming",
        viewers: 2134,
        description: "Live coding and software development"
    },
    {
        name: "RobotCaleb",
        display_name: "RobotCaleb",
        logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/robotcaleb-profile_image-9421f7469017c8d9-300x300.png",
        status: "online",
        game: "Science & Technology",
        viewers: 3456,
        description: "Science experiments and educational content"
    },
    {
        name: "noobs2ninjas",
        display_name: "noobs2ninjas",
        logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/noobs2ninjas-profile_image-34707f847a73d934-300x300.png",
        status: "offline",
        game: null,
        viewers: 0,
        description: "Gaming and entertainment streaming"
    }
];

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadStreamers();
}

function setupEventListeners() {
    document.getElementById('allBtn').addEventListener('click', () => filterStreamers('all'));
    document.getElementById('onlineBtn').addEventListener('click', () => filterStreamers('online'));
    document.getElementById('offlineBtn').addEventListener('click', () => filterStreamers('offline'));
}

function filterStreamers(filter) {
    currentFilter = filter;

    // Update button states
    document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${filter}Btn`).classList.add('active');

    loadStreamers();
}

function loadStreamers() {
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('streamers').innerHTML = '';

    // Simulate API delay
    setTimeout(() => {
        try {
            // Filter streamers based on current filter
            let filteredStreamers = streamers;
            if (currentFilter === 'online') {
                filteredStreamers = streamers.filter(s => s.status === 'online');
            } else if (currentFilter === 'offline') {
                filteredStreamers = streamers.filter(s => s.status === 'offline');
            }

            displayStreamers(filteredStreamers);
            document.getElementById('loading').classList.add('hidden');
        } catch (error) {
            showError();
        }
    }, 1000); // Simulate 1 second API delay
}

function displayStreamers(streamerList) {
    const container = document.getElementById('streamers');

    streamerList.forEach(streamer => {
        const card = createStreamerCard(streamer);
        container.appendChild(card);
    });
}

function createStreamerCard(streamer) {
    const card = document.createElement('div');
    card.className = 'streamer-card';

    const statusClass = streamer.status === 'online' ? 'online' : 'offline';
    const statusText = streamer.status === 'online' ? 'Online' : 'Offline';
    const gameText = streamer.game || 'Not Playing';
    const viewersText = streamer.status === 'online' ? `${streamer.viewers.toLocaleString()} viewers` : '';

    card.innerHTML = `
        <div class="streamer-header">
            <img src="${streamer.logo}" alt="${streamer.display_name}" class="streamer-avatar" onerror="this.src='https://via.placeholder.com/60x60/666666/ffffff?text=?';">
            <div class="streamer-info">
                <h3>${streamer.display_name}</h3>
                <span class="streamer-status ${statusClass}">${statusText}</span>
            </div>
        </div>
        <div class="streamer-content">
            <div class="streamer-game">${gameText}</div>
            <div class="streamer-description">${streamer.description}</div>
            ${streamer.status === 'online' ? `<div class="streamer-viewers">${viewersText}</div>` : ''}
        </div>
    `;

    return card;
}

function showError() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('streamers').innerHTML = '';
}

// Mock API function to demonstrate how real API calls would work
function mockTwitchAPI() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate occasional API failure (5% chance)
            if (Math.random() < 0.05) {
                reject(new Error('API Error'));
            } else {
                resolve(streamers);
            }
        }, Math.random() * 2000 + 500); // Random delay between 500-2500ms
    });
}

// Example of how to use the mock API (not used in main app)
async function fetchStreamers() {
    try {
        const data = await mockTwitchAPI();
        console.log('Fetched streamers:', data);
        return data;
    } catch (error) {
        console.error('Failed to fetch streamers:', error);
        throw error;
    }
}
