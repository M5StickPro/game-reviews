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

      let starsHtml = '';
      if (post.rating) {
        const fullStars = Math.floor(post.rating / 2);
        for (let i = 0; i < 5; i++) {
          starsHtml += i < fullStars ? '★' : '☆';
        }
        starsHtml += ` <span style="color:#a0a0a0; font-size: 1.2rem;">(${post.rating}/10)</span>`;
      }

      const counterKey = `m5stickpro-site-${slug}`;
      let views = 0;

      fetch(`https://api.countapi.xyz/hit/m5stickpro-site/${counterKey}`)
        .then(res => res.json())
        .then(data => { views = data.value; })
        .catch(() => { views = 0; })
        .finally(() => {
          // Обновляем title страницы для SEO
          document.title = `${post.title} — GameReviews`;
          
          document.getElementById('post-content').innerHTML = `
            <a href="index.html" class="back-btn">← Назад к обзорам</a>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}">` : ''}
            <h1>${post.title}</h1>
            <div style="color: #ffd700; font-size: 1.5rem; margin-bottom: 10px; letter-spacing: 2px;">${starsHtml}</div>
            <p style="color:#ff6b00; font-weight:bold; margin-bottom: 20px;">👁 ${views} просмотров</p>
            
            <div class="post-body">
              ${bodyHtml}
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: #a0a0a0;">
              Made by <strong style="color: #ff6b00;">M5StickPro</strong>
            </div>
          `;
        });
    })
    .catch(error => {
      console.error('Ошибка:', error);
      document.getElementById('post-content').innerHTML = `<p style="color:red">Ошибка загрузки: ${error.message}</p>`;
    });
}