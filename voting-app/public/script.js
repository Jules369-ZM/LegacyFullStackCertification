document.addEventListener('DOMContentLoaded', () => {
  loadPolls();

  const createPollBtn = document.getElementById('createPollBtn');
  const createPollSection = document.getElementById('createPoll');
  const pollForm = document.getElementById('pollForm');
  const addOptionBtn = document.getElementById('addOption');

  createPollBtn.addEventListener('click', () => {
    createPollSection.style.display = createPollSection.style.display === 'none' ? 'block' : 'none';
  });

  addOptionBtn.addEventListener('click', () => {
    const optionsDiv = document.getElementById('options');
    const optionCount = optionsDiv.children.length + 1;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'option';
    input.placeholder = `Option ${optionCount}`;
    input.required = true;
    optionsDiv.appendChild(input);
  });

  pollForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('pollTitle').value;
    const options = Array.from(document.querySelectorAll('.option')).map(input => input.value);

    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, options })
      });

      if (response.ok) {
        loadPolls();
        createPollSection.style.display = 'none';
        pollForm.reset();
      } else {
        alert('Failed to create poll');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

async function loadPolls() {
  try {
    const response = await fetch('/api/polls');
    const polls = await response.json();
    displayPolls(polls);
  } catch (error) {
    console.error('Error loading polls:', error);
  }
}

function displayPolls(polls) {
  const pollsList = document.getElementById('pollsList');
  pollsList.innerHTML = '';

  polls.forEach(poll => {
    const pollDiv = document.createElement('div');
    pollDiv.className = 'poll';

    pollDiv.innerHTML = `
      <h3>${poll.title}</h3>
      <p>Created by: ${poll.createdBy.username}</p>
      ${poll.options.map((option, index) => `
        <div>
          <label>
            <input type="radio" name="vote-${poll._id}" value="${index}">
            ${option.text} (${option.votes} votes)
          </label>
        </div>
      `).join('')}
      <button onclick="vote('${poll._id}')">Vote</button>
    `;

    pollsList.appendChild(pollDiv);
  });
}

async function vote(pollId) {
  const selectedOption = document.querySelector(`input[name="vote-${pollId}"]:checked`);
  if (!selectedOption) {
    alert('Please select an option');
    return;
  }

  const optionIndex = selectedOption.value;

  try {
    const response = await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ optionIndex })
    });

    if (response.ok) {
      loadPolls();
    } else {
      alert('Failed to vote');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
