// Wikipedia Viewer - Search and display Wikipedia articles

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const WIKIPEDIA_SEARCH_URL = 'https://en.wikipedia.org/w/api.php';

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    showWelcomeMessage();
}

function setupEventListeners() {
    const searchForm = document.getElementById('searchForm');
    const randomBtn = document.getElementById('randomBtn');

    searchForm.addEventListener('submit', handleSearch);
    randomBtn.addEventListener('click', getRandomArticle);
}

function handleSearch(event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value.trim();

    if (query) {
        searchWikipedia(query);
    }
}

async function searchWikipedia(query) {
    showLoading();

    try {
        // First, search for articles
        const searchResults = await searchArticles(query);

        if (searchResults.length === 0) {
            showNoResults();
            return;
        }

        // Get detailed information for each result
        const articles = await Promise.all(
            searchResults.slice(0, 10).map(title => getArticleSummary(title))
        );

        displayResults(articles.filter(article => article !== null));
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search Wikipedia. Please check your internet connection and try again.');
    }
}

async function searchArticles(query) {
    const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*',
        srlimit: 10
    });

    const response = await fetch(`${WIKIPEDIA_SEARCH_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    return data.query.search.map(result => result.title);
}

async function getArticleSummary(title) {
    try {
        const response = await fetch(`${WIKIPEDIA_API_URL}${encodeURIComponent(title)}`);

        if (!response.ok) {
            if (response.status === 404) {
                return null; // Article not found
            }
            throw new Error(`Summary API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            title: data.title,
            extract: data.extract,
            thumbnail: data.thumbnail?.source,
            url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
            description: data.description || ''
        };
    } catch (error) {
        console.error(`Error fetching summary for ${title}:`, error);
        return null;
    }
}

async function getRandomArticle() {
    showLoading();

    try {
        const params = new URLSearchParams({
            action: 'query',
            list: 'random',
            rnlimit: 1,
            format: 'json',
            origin: '*'
        });

        const response = await fetch(`${WIKIPEDIA_SEARCH_URL}?${params}`);

        if (!response.ok) {
            throw new Error(`Random API error: ${response.status}`);
        }

        const data = await response.json();
        const randomTitle = data.query.random[0].title;

        const article = await getArticleSummary(randomTitle);

        if (article) {
            displayResults([article]);
            // Clear search input
            document.getElementById('searchInput').value = '';
        } else {
            showError('Could not load random article. Please try again.');
        }
    } catch (error) {
        console.error('Random article error:', error);
        showError('Failed to get random article. Please try again.');
    }
}

function displayResults(articles) {
    hideAllMessages();

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    articles.forEach(article => {
        const card = createArticleCard(article);
        resultsContainer.appendChild(card);
    });
}

function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';

    const thumbnailHtml = article.thumbnail
        ? `<img src="${article.thumbnail}" alt="${article.title}" style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">`
        : '';

    card.innerHTML = `
        <div class="article-content">
            ${thumbnailHtml}
            <h3 class="article-title">
                <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                    ${article.title}
                </a>
            </h3>
            <p class="article-excerpt">${truncateText(article.extract, 200)}</p>
            <div class="article-meta">
                <span>${article.description}</span>
                <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="article-link">
                    Read more →
                </a>
            </div>
        </div>
    `;

    return card;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength).trim() + '...';
}

function showWelcomeMessage() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="article-card">
            <div class="article-content" style="text-align: center; padding: 3rem 1rem;">
                <i class="fas fa-search" style="font-size: 4rem; color: #007cba; margin-bottom: 1rem;"></i>
                <h3>Welcome to Wikipedia Viewer</h3>
                <p style="color: #666; margin-bottom: 2rem;">
                    Search for any topic or click "Random Article" to discover something new.
                    All results are fetched from Wikipedia's public API.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border: 1px solid #ddd;">
                        <strong>Example searches:</strong><br>
                        JavaScript, Machine Learning, History of Computing
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showLoading() {
    hideAllMessages();
    document.getElementById('loading').classList.remove('hidden');
}

function showError(message) {
    hideAllMessages();
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('errorMessage').textContent = message;
}

function showNoResults() {
    hideAllMessages();
    document.getElementById('noResults').classList.remove('hidden');
}

function hideAllMessages() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('noResults').classList.add('hidden');
}

// Add keyboard shortcut for search (Enter key)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && document.activeElement === document.getElementById('searchInput')) {
        document.getElementById('searchForm').dispatchEvent(new Event('submit'));
    }
});
