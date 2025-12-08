document.addEventListener('DOMContentLoaded', () => {
  loadBooks();

  // Check if user is logged in by trying to load my books
  loadMyBooks().then(() => {
    showAuthenticatedSections();
  }).catch(() => {
    hideAuthenticatedSections();
  });

  const addBookBtn = document.getElementById('addBookBtn');
  const addBookSection = document.getElementById('addBook');
  const bookForm = document.getElementById('bookForm');

  addBookBtn.addEventListener('click', () => {
    addBookSection.style.display = addBookSection.style.display === 'none' ? 'block' : 'none';
  });

  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const isbn = document.getElementById('bookISBN').value;
    const image = document.getElementById('bookImage').value;

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, author, isbn, image })
      });

      if (response.ok) {
        loadBooks();
        loadMyBooks();
        addBookSection.style.display = 'none';
        bookForm.reset();
      } else {
        alert('Failed to add book');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

async function loadBooks() {
  try {
    const response = await fetch('/api/books');
    const books = await response.json();
    displayBooks(books, 'booksList', false);
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

async function loadMyBooks() {
  try {
    const response = await fetch('/api/mybooks');
    const books = await response.json();
    displayBooks(books, 'myBooksList', true);
    loadTrades();
    return books;
  } catch (error) {
    throw error;
  }
}

function displayBooks(books, containerId, isMyBooks) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  books.forEach(book => {
    const bookDiv = document.createElement('div');
    bookDiv.className = 'book';

    bookDiv.innerHTML = `
      <img src="${book.image || 'https://via.placeholder.com/80x120?text=No+Cover'}" alt="${book.title}">
      <div class="book-info">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        ${book.isbn ? `<p><strong>ISBN:</strong> ${book.isbn}</p>` : ''}
        ${!isMyBooks ? `<p><strong>Owner:</strong> ${book.owner.username} (${book.owner.city}, ${book.owner.state})</p>` : ''}
      </div>
      <div class="book-actions">
        ${!isMyBooks ? `<button class="trade-btn" onclick="initiateTrade('${book._id}')">Request Trade</button>` : ''}
        ${isMyBooks ? `<button class="delete-btn" onclick="deleteBook('${book._id}')">Remove</button>` : ''}
      </div>
    `;

    container.appendChild(bookDiv);
  });
}

async function deleteBook(bookId) {
  if (!confirm('Are you sure you want to remove this book?')) return;

  try {
    const response = await fetch(`/api/books/${bookId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadBooks();
      loadMyBooks();
    } else {
      alert('Failed to delete book');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function initiateTrade(bookId) {
  // Get user's books for selection
  try {
    const response = await fetch('/api/mybooks');
    const myBooks = await response.json();

    if (myBooks.length === 0) {
      alert('You need to add books to your collection before requesting a trade');
      return;
    }

    const offeredBookId = prompt(`Select a book to offer in trade:\n${myBooks.map((book, index) => `${index + 1}. ${book.title} by ${book.author}`).join('\n')}`, '1');

    if (!offeredBookId) return;

    const index = parseInt(offeredBookId) - 1;
    if (index < 0 || index >= myBooks.length) {
      alert('Invalid selection');
      return;
    }

    const response2 = await fetch('/api/trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requestedBookId: bookId,
        offeredBookId: myBooks[index]._id
      })
    });

    if (response2.ok) {
      alert('Trade request sent!');
      loadTrades();
    } else {
      alert('Failed to send trade request');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function loadTrades() {
  try {
    const response = await fetch('/api/trades');
    const trades = await response.json();
    displayTrades(trades);
  } catch (error) {
    console.error('Error loading trades:', error);
  }
}

function displayTrades(trades) {
  const container = document.getElementById('tradesList');
  container.innerHTML = '';

  trades.forEach(trade => {
    const tradeDiv = document.createElement('div');
    tradeDiv.className = `trade-request status-${trade.status}`;

    const isRequester = trade.requester._id === getCurrentUserId(); // This would need to be implemented
    const actionButtons = trade.status === 'pending' && !isRequester ?
      `<button onclick="respondToTrade('${trade._id}', 'accepted')">Accept</button>
       <button onclick="respondToTrade('${trade._id}', 'rejected')">Reject</button>` : '';

    tradeDiv.innerHTML = `
      <h4>${isRequester ? 'You requested:' : 'Trade request:'}</h4>
      <p><strong>Requested:</strong> "${trade.requestedBook.title}" by ${trade.requestedBook.author}</p>
      <p><strong>Offered:</strong> "${trade.offeredBook.title}" by ${trade.offeredBook.author}</p>
      <p><strong>From:</strong> ${trade.requester.username}</p>
      <p><strong>Status:</strong> ${trade.status}</p>
      ${actionButtons}
    `;

    container.appendChild(tradeDiv);
  });
}

async function respondToTrade(tradeId, status) {
  try {
    const response = await fetch(`/api/trades/${tradeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      loadTrades();
      loadBooks();
      loadMyBooks();
    } else {
      alert('Failed to respond to trade');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function showAuthenticatedSections() {
  document.getElementById('myBooks').style.display = 'block';
  document.getElementById('trades').style.display = 'block';
  document.getElementById('addBookBtn').style.display = 'inline-block';
}

function hideAuthenticatedSections() {
  document.getElementById('myBooks').style.display = 'none';
  document.getElementById('trades').style.display = 'none';
  document.getElementById('addBookBtn').style.display = 'none';
}

// Helper function to get current user ID (would need server-side implementation)
function getCurrentUserId() {
  // This would typically be stored in a global variable or retrieved from session
  return null;
}
