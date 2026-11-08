const projectId = 'lvvctfr4';
const dataset = 'production';

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

if (!slug) {
  document.getElementById('post-content').innerHTML = '<p style="color:red">Статья не найдена.</p>';
} else {
  // Запрос на текущую статью
  const query = encodeURIComponent(`*[_type == "post" && slug.current == "${slug}"][0]{
    title,
    "imageUrl": mainImage.asset->url,
    "body": body,
    "rating": rating,
    "genre": genre
  }`);

  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const post = data.result;
      if (!post) {
        document.getElementById('post-content').innerHTML = '<p style="color:red">Статья не найдена.</p>';
        return;
      }

      let bodyHtml = '';
      if (post.body && Array.isArray(post.body)) {
        post.body.forEach(block => {
          if (block._type === 'block' && block.children) {
             const textContent = block.children.map(child => child.text).join('');
             if (textContent.trim()) bodyHtml += `<p>${textContent}</p>`;
          }
        });
      } else if (post.body) {
        bodyHtml = `<p>${post.body}</p>`;
      } else {
        bodyHtml = '<p>Текст обзора отсутствует.</p>';
      }

      let starsHtml = '';
      if (post.rating) {
        const ratingOutOfFive = post.rating / 2;
        for (let i = 1; i <= 5; i++) {
          if (i <= Math.floor(ratingOutOfFive)) {
            starsHtml += '<span class="star full">★</span>';
          } else if (i === Math.ceil(ratingOutOfFive) && !Number.isInteger(ratingOutOfFive)) {
            starsHtml += '<span class="star half">★</span>';
          } else {
            starsHtml += '<span class="star empty">★</span>';
          }
        }
        starsHtml += ` <span style="color:var(--text-muted); font-size: 1.2rem; margin-left: 5px;">(${post.rating}/10)</span>`;
      }

      const counterKey = `m5stickpro-site-${slug}`;
      let views = 0;

      fetch(`https://api.countapi.xyz/hit/m5stickpro-site/${counterKey}`)
        .then(res => res.json())
        .then(data => { views = data.value; })
        .catch(() => { views = 0; })
        .finally(() => {
          document.title = `${post.title} — GameReviews`;
          
          document.getElementById('post-content').innerHTML = `
            <a href="index.html" class="back-btn">← Назад к обзорам</a>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" loading="lazy">` : ''}
            <h1>${post.title}</h1>
            <div class="rating">${starsHtml}</div>
            <p style="color:var(--accent-orange); font-weight:bold; margin-bottom: 20px;">Просмотров: ${views}</p>
            
            <div class="post-body">
              ${bodyHtml}
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border-glass); text-align: center; color: var(--text-muted);">
              Made by <strong style="color: var(--accent-orange);">M5StickPro</strong>
            </div>

            <div class="related-posts" id="related-posts"></div>
          `;

          // Загружаем похожие статьи
          loadRelatedPosts(slug, post.genre);
        });
    })
    .catch(error => {
      console.error('Ошибка:', error);
      document.getElementById('post-content').innerHTML = `<p style="color:red">Ошибка загрузки: ${error.message}</p>`;
    });
}

// Функция загрузки похожих статей
function loadRelatedPosts(currentSlug, currentGenre) {
  const relatedContainer = document.getElementById('related-posts');
  if (!relatedContainer) return;

  // Запрос: берем 3 статьи, исключая текущую. Если есть жанр - ищем по нему, иначе просто любые.
  let relatedQuery = `*[_type == "post" && slug.current != "${currentSlug}"]`;
  if (currentGenre) {
    relatedQuery += ` && genre == "${currentGenre}"`;
  }
  relatedQuery = encodeURIComponent(relatedQuery + ` | order(_createdAt desc)[0...3] {
    title,
    "imageUrl": mainImage.asset->url,
    "rating": rating,
    "slug": slug.current
  }`);

  const relatedUrl = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${relatedQuery}`;

  fetch(relatedUrl)
    .then(res => res.json())
    .then(data => {
      const related = data.result;
      if (related && related.length > 0) {
        let html = `<h3 class="related-title">Читайте также</h3><div class="related-grid">`;
        
        related.forEach(r => {
          let miniStars = '';
          if (r.rating) {
            const full = Math.floor(r.rating / 2);
            for (let i = 0; i < 5; i++) {
              miniStars += i < full ? '★' : '☆';
            }
            miniStars += ` (${r.rating}/10)`;
          }

          html += `
            <a href="post.html?slug=${r.slug}" class="related-card">
              ${r.imageUrl ? `<img src="${r.imageUrl}" alt="${r.title}" loading="lazy">` : ''}
              <div class="related-card-body">
                <h4>${r.title}</h4>
                <div class="related-rating">${miniStars}</div>
              </div>
            </a>
          `;
        });
        html += `</div>`;
        relatedContainer.innerHTML = html;
      }
    })
    .catch(err => console.error('Ошибка загрузки похожих статей:', err));
}

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