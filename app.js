import giphy from './api/giphy.js';

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const resultSection = document.querySelector('#results-section');
const overlay = document.querySelector('#overlay');

// Generates array with random [horizontal, vertical] values from 1 to 4
const digits = Array.from({ length: 25 }, () => [
  randomNumber(3),
  randomNumber(3)
]);

// Event Listeners
form.addEventListener('submit', e => onFormSubmit(e));
resultSection.addEventListener('click', onGifClickHandle);
overlay.addEventListener('click', close);

const lazyLoad = target => {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');

        img.setAttribute('src', src);
        img.classList.remove('lazy');

        observer.disconnect();
      }
    });
  });

  io.observe(target);
};

// Functions
const onFormSubmit = e => {
  e.preventDefault();
  if (searchInput.value && searchInput.value.trim()) {
    const searchString = searchInput.value.replace(/ /g, '+');
    makeRequest(searchString)
      .then(res => {
        generateAndShowResults(res.data.data, digits);
        // Add intersection observer to all images loaded
        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(lazyLoad);
      })
      .catch(err => console.log(err));
  }
};

const generateAndShowResults = (apiResponse, digits) => {
  let element = '';

  apiResponse.forEach((gif, index) => {
    const [h, v] = digits[index];
    element += `
    <div class="gif-box h${h} v${v}">
      <img class="lazy" data-src="${gif.images.downsized.url}"></img>
      <div class="gif-box-overlay">
        <button id="view-gif-btn">View &rarr;</button>
      </div>
    </div>
    `;
  });

  resultSection.innerHTML = element;
};

function onGifClickHandle(e) {
  if (e.target.parentElement.classList.contains('gif-box')) {
    overlay.querySelector('img').src = e.target.previousElementSibling.src;
    overlay.classList.add('open');
  }
}

async function makeRequest(searchTerm) {
  return await giphy.get('/v1/gifs/search', {
    params: {
      q: searchTerm
    }
  });
}

// Helper Functions
function randomNumber(limit) {
  return Math.floor(Math.random() * limit + 1);
}

function close() {
  overlay.classList.remove('open');
}
