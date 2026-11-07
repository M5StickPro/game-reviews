const projectId = 'lvvctfr4';
const dataset = 'production';

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

if (!slug) {
  document.getElementById('post-content').innerHTML = '<p style="color:red">Ошибка: Статья не найдена.</p>';
} else {
  const query = encodeURIComponent(`*[_type == "post" && slug.current == "${slug}"][0]{
    title,
    "imageUrl": mainImage.asset->url,
    "body": body,
    "rating": rating
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

      // Считаем звезды для страницы статьи
      let starsHtml = '';
      if (post.rating) {
        const fullStars = Math.floor(post.rating / 2);
        for (let i = 0; i < 5; i++) {
          starsHtml += i < fullStars ? '★' : '☆';
        }
        starsHtml += ` <span style="color:#9a9aad; font-size: 1.2rem;">(${post.rating}/10)</span>`;
      }

      // --- СЧЕТЧИК ПРОСМОТРОВ ---
      // ВАЖНО: Замени "m5stickpro-site" на любое свое уникальное слово на английском!
      const counterKey = `m5stickpro-site-${slug}`;
      let views = 0;

      fetch(`https://api.countapi.xyz/hit/m5stickpro-site/${counterKey}`)
        .then(res => res.json())
        .then(data => { views = data.value; })
        .catch(() => { views = 0; })
        .finally(() => {
          document.getElementById('post-content').innerHTML = `
            <a href="index.html" class="back-btn">← Назад к обзорам</a>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}">` : ''}
            <h1>${post.title}</h1>
            <div style="color: #ffd700; font-size: 1.5rem; margin-bottom: 10px; letter-spacing: 2px;">${starsHtml}</div>
            <p style="color:#6c3ce0; font-weight:bold; margin-bottom: 20px;">👁 ${views} просмотров</p>
            <div class="post-body">
              ${bodyHtml}
            </div>
          `;
        });
    })
    .catch(error => {
      console.error('Ошибка:', error);
      document.getElementById('post-content').innerHTML = `<p style="color:red">Ошибка загрузки: ${error.message}</p>`;
    });
}