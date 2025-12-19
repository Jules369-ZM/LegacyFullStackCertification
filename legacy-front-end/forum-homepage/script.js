// freeCodeCamp Forum Homepage
const API_URL = 'https://forum-proxy.freecodecamp.rocks/latest';

document.addEventListener('DOMContentLoaded', function() {
    fetchForumPosts();
});

async function fetchForumPosts() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const postsContainer = document.getElementById('postsContainer');

    try {
        loadingElement.style.display = 'flex';

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayPosts(data);

    } catch (error) {
        console.error('Error fetching forum posts:', error);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
    }
}

function displayPosts(data) {
    const loadingElement = document.getElementById('loading');
    const postsContainer = document.getElementById('postsContainer');

    // Hide loading
    loadingElement.style.display = 'none';

    // Create user map for quick lookup
    const usersMap = {};
    data.users.forEach(user => {
        usersMap[user.id] = user;
    });

    // Get topics and display them
    const topics = data.topic_list.topics;

    topics.forEach(topic => {
        const postElement = createPostElement(topic, usersMap);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(topic, usersMap) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';

    // Calculate replies (posts_count includes original post)
    const replies = topic.posts_count - 1;

    // Format timestamp
    const lastPostedDate = new Date(topic.last_posted_at);
    const timeAgo = getTimeAgo(lastPostedDate);

    // Create user links
    const userLinks = topic.posters.map(poster => {
        const user = usersMap[poster.user_id];
        if (!user) return '';

        const userUrl = `https://forum.freecodecamp.org/u/${user.username}`;
        const avatarUrl = user.avatar_template
            ? `https://forum.freecodecamp.org${user.avatar_template.replace('{size}', '24')}`
            : 'https://forum.freecodecamp.org/user_avatar/forum.freecodecamp.org/default/24.png';

        return `<a href="${userUrl}" class="user-link" target="_blank" rel="noopener noreferrer">
            <img src="${avatarUrl}" alt="${user.username}" style="width: 16px; height: 16px; border-radius: 50%; margin-right: 4px;">
            ${user.username}
        </a>`;
    }).filter(link => link).join('');

    postDiv.innerHTML = `
        <div class="post-title">
            <a href="https://forum.freecodecamp.org/t/${topic.slug}/${topic.id}" target="_blank" rel="noopener noreferrer">
                ${topic.title}
            </a>
        </div>

        <div class="post-users">
            <strong>Recent posters:</strong>
            <div class="user-links">
                ${userLinks}
            </div>
        </div>

        <div class="post-meta">
            <div class="post-stats">
                <span class="stat-item">
                    <i class="fas fa-reply"></i>
                    ${replies} ${replies === 1 ? 'reply' : 'replies'}
                </span>
                <span class="stat-item">
                    <i class="fas fa-eye"></i>
                    ${topic.views} ${topic.views === 1 ? 'view' : 'views'}
                </span>
            </div>
            <div class="post-time">
                <i class="fas fa-clock"></i>
                Last active ${timeAgo}
            </div>
        </div>
    `;

    return postDiv;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}
