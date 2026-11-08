const projectId = 'lvvctfr4';
const dataset = 'production';

const query = encodeURIComponent(`*[_type == "post"]{
  title,
  "imageUrl": mainImage.asset->url,
  "rating": rating,
  "text": excerpt,
  "slug": slug.current,
  "genre": genre
}`);

const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`;

let allReviews = [];
let currentGenre = 'all';
let currentSearch = '';

function renderReviews(reviews) {
  const container = document.getElementById("reviews");
  if (!container) return;
  
  container.innerHTML = "";

  if (!reviews || reviews.length === 0) {
    container.innerHTML = "<p style='color: var(--text-muted); text-align: center; width: 100%;'>Ничего не найдено.</p>";
    return;
  }

  reviews.forEach(r => {
    const card = document.createElement("article");
    card.className = "card";
    
    if (r.rating >= 9) {
      card.classList.add("highlight");
    }

    const imgSrc = r.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image';
    
    let starsHtml = '';
    if (r.rating) {
      const ratingOutOfFive = r.rating / 2;
      for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(ratingOutOfFive)) {
          starsHtml += '<span class="star full">★</span>';
        } else if (i === Math.ceil(ratingOutOfFive) && !Number.isInteger(ratingOutOfFive)) {
          starsHtml += '<span class="star half">★</span>';
        } else {
          starsHtml += '<span class="star empty">★</span>';
        }
      }
      starsHtml += ` <span style="color:var(--text-muted); font-size: 0.9rem; margin-left: 5px;">(${r.rating}/10)</span>`;
    } else {
      starsHtml = '<span style="color:var(--text-muted); font-size: 0.9rem;">Нет оценки</span>';
    }

    const textText = r.text || 'Описание отсутствует.';
    const postSlug = r.slug || '';

    card.innerHTML = `
      <img src="${imgSrc}" alt="${r.title}" loading="lazy" decoding="async">
      <div class="card-body">
        <div class="rating">${starsHtml}</div>
        <h2>${r.title}</h2>
        <p>${textText}</p>
        <a href="post.html?slug=${postSlug}" class="read-more-btn">Читать далее</a>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterReviews() {
  let filtered = allReviews;

  if (currentGenre !== 'all') {
    filtered = filtered.filter(r => r.genre === currentGenre);
  }

  if (currentSearch.trim() !== '') {
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(currentSearch.toLowerCase())
    );
  }

  renderReviews(filtered);
}

fetch(url)
  .then(response => response.json())
  .then(data => {
    allReviews = data.result;
    renderReviews(allReviews);
  })
  .catch(error => {
    console.error('Ошибка запроса:', error);
    document.getElementById("reviews").innerHTML = `<p style="color:red;">Ошибка: ${error.message}</p>`;
  });

document.getElementById('searchInput').addEventListener('input', function(e) {
  currentSearch = e.target.value;
  filterReviews();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    currentGenre = this.getAttribute('data-genre');
    filterReviews();
  });
});

function toggleThemeMenu() {
  document.getElementById('themeMenu').classList.toggle('active');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  document.getElementById('themeMenu').classList.remove('active');
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
} else {
  document.documentElement.setAttribute('data-theme', 'dark');
}

const scrollBtn = document.getElementById("scrollTopBtn");
window.onscroll = function() {
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}