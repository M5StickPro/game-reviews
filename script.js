const projectId = 'lvvctfr4';
const dataset = 'production';
const sanityToken = 'skbawiXMggk8KxL60WzRkekShK2VoRbXm387zAjdpCOny58RFsF7gCVJxQ684Rsrn0IcsxwDiZxlESlUkxxC0YIEEiR3SYEaDaUPRNyTdQZVPR6QsPednIq4pdptqSwnQS4KcmcBStr3Qhsv3GEkQsAS8UWtq8rJIogVCjSV94C4fPGrqmJT';

const queryPosts = encodeURIComponent(`*[_type == "post"]{
  title, "imageUrl": mainImage.asset->url, "rating": rating, "text": excerpt, "slug": slug.current, "genres": genres[]->{ "value": value.current }
}`);
const queryGenres = encodeURIComponent(`*[_type == "genre"]{ title, "value": value.current }`);

let allReviews = [];
let currentGenre = 'all';
let currentSearch = '';

// 1. Загрузка жанров и отрисовка кнопок
fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${queryGenres}`)
  .then(res => res.json())
  .then(data => {
    const genres = data.result;
    const mainContainer = document.getElementById('filters-main');
    const moreContainer = document.getElementById('filters-more');
    
    // Первые 4 жанра (или сколько есть) идут в основной ряд
    const mainGenres = genres.slice(0, 4);
    const moreGenres = genres.slice(4); // Остальные в "Ещё"

    let mainHtml = `<button class="filter-btn active" data-genre="all">Все</button>`;
    mainGenres.forEach(g => {
      mainHtml += `<button class="filter-btn" data-genre="${g.value}">${g.title}</button>`;
    });
    mainContainer.innerHTML = mainHtml;

    // Если есть дополнительные жанры, показываем кнопку "Ещё..."
    if (moreGenres.length > 0) {
      let moreHtml = `<button class="more-btn" id="moreBtn">Ещё...</button><div class="more-dropdown" id="moreDropdown">`;
      moreGenres.forEach(g => {
        moreHtml += `<button class="filter-btn" data-genre="${g.value}">${g.title}</button>`;
      });
      moreHtml += `</div>`;
      moreContainer.innerHTML = moreHtml;

      // Обработчик для открытия/закрытия списка
      document.getElementById('moreBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('moreDropdown').classList.toggle('active');
      });
    }

    // Добавляем обработчики на ВСЕ кнопки (и в основном ряду, и в "Ещё")
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentGenre = this.getAttribute('data-genre');
        
        // Закрываем "Ещё" после выбора
        const dropdown = document.getElementById('moreDropdown');
        if (dropdown) dropdown.classList.remove('active');
        
        filterReviews();
      });
    });
  });

// Закрытие выпадающего списка при клике вне его
window.addEventListener('click', function(e) {
  const dropdown = document.getElementById('moreDropdown');
  const moreBtn = document.getElementById('moreBtn');
  if (dropdown && moreBtn && !moreBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove('active');
  }
});

// 2. Загрузка статей
fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${queryPosts}`)
  .then(response => response.json())
  .then(data => {
    allReviews = data.result;
    renderReviews(allReviews);
  })
  .catch(error => {
    console.error('Ошибка запроса:', error);
    document.getElementById("reviews").innerHTML = `<p style="color:red;">Ошибка: ${error.message}</p>`;
  });

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
    if (r.rating >= 9) card.classList.add("highlight");

    let imgSrc = r.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image';
    if (r.imageUrl && r.imageUrl.includes('cdn.sanity.io')) imgSrc = r.imageUrl + '?w=400';
    
    let starsHtml = '';
    if (r.rating) {
      const ratingOutOfFive = r.rating / 2;
      for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(ratingOutOfFive)) starsHtml += '<span class="star full">★</span>';
        else if (i === Math.ceil(ratingOutOfFive) && !Number.isInteger(ratingOutOfFive)) starsHtml += '<span class="star half">★</span>';
        else starsHtml += '<span class="star empty">★</span>';
      }
      starsHtml += ` <span style="color:var(--text-muted); font-size: 0.9rem; margin-left: 5px;">(${r.rating}/10)</span>`;
    } else {
      starsHtml = '<span style="color:var(--text-muted); font-size: 0.9rem;">Нет оценки</span>';
    }

    card.innerHTML = `
      <img src="${imgSrc}" alt="${r.title}" loading="lazy" decoding="async">
      <div class="card-body">
        <div class="rating">${starsHtml}</div>
        <h2>${r.title}</h2>
        <p>${r.text || 'Описание отсутствует.'}</p>
        <a href="post.html?slug=${r.slug || ''}" class="read-more-btn">Читать далее</a>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterReviews() {
  let filtered = allReviews;
  if (currentGenre !== 'all') {
    filtered = filtered.filter(r => r.genres && r.genres.some(g => g.value === currentGenre));
  }
  if (currentSearch.trim() !== '') {
    filtered = filtered.filter(r => r.title.toLowerCase().includes(currentSearch.toLowerCase()));
  }
  renderReviews(filtered);
}

document.getElementById('searchInput').addEventListener('input', function(e) {
  currentSearch = e.target.value;
  filterReviews();
});

// Модалка предложки и остальное
function openSuggestModal() { document.getElementById('suggestModal').style.display = 'flex'; }
function closeSuggestModal() { document.getElementById('suggestModal').style.display = 'none'; }
document.getElementById('suggestForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const gameName = document.getElementById('suggestGameName').value.trim();
  const reason = document.getElementById('suggestReason').value.trim();
  const status = document.getElementById('formStatus');
  const button = document.querySelector('.submit-suggest-btn');
  if (!gameName) return;
  button.disabled = true; button.textContent = 'Отправка...'; status.textContent = '';
  fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sanityToken}` },
    body: JSON.stringify({ mutations: [{ create: { _type: 'suggestion', gameName, reason, createdAt: new Date().toISOString() } }] })
  }).then(res => {
    if (res.ok) {
      status.innerHTML = '<span style="color: #4caf50;">Спасибо! Отправлено.</span>';
      document.getElementById('suggestForm').reset();
      setTimeout(() => { closeSuggestModal(); status.textContent = ''; }, 2000);
    } else status.innerHTML = '<span style="color: #f44336;">Ошибка отправки.</span>';
  }).finally(() => { button.disabled = false; button.textContent = 'Отправить'; });
});
window.onclick = e => { if (e.target === document.getElementById('suggestModal')) closeSuggestModal(); }
function toggleThemeMenu() { document.getElementById('themeMenu').classList.toggle('active'); }
function setTheme(theme) { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); document.getElementById('themeMenu').classList.remove('active'); }
const savedTheme = localStorage.getItem('theme'); if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme); else document.documentElement.setAttribute('data-theme', 'dark');
const scrollBtn = document.getElementById("scrollTopBtn");
window.onscroll = function() { if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) scrollBtn.classList.add("show"); else scrollBtn.classList.remove("show"); };
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }