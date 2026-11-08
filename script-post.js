const projectId = 'lvvctfr4'; const dataset = 'production';
const params = new URLSearchParams(window.location.search); const slug = params.get('slug');

if (!slug) document.getElementById('post-content').innerHTML = '<p style="color:red">Статья не найдена.</p>';
else {
  const query = encodeURIComponent(`*[_type == "post" && slug.current == "${slug}"][0]{ title, "imageUrl": mainImage.asset->url, "body": body, "rating": rating }`);
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`;
  fetch(url).then(res => res.json()).then(data => {
    const post = data.result;
    if (!post) { document.getElementById('post-content').innerHTML = '<p style="color:red">Статья не найдена.</p>'; return; }
    let bodyHtml = '';
    if (post.body && Array.isArray(post.body)) post.body.forEach(block => { if (block._type === 'block' && block.children) { const textContent = block.children.map(c => c.text).join(''); if (textContent.trim()) bodyHtml += `<p>${textContent}</p>`; } });
    else if (post.body) bodyHtml = `<p>${post.body}</p>`;
    else bodyHtml = '<p>Текст отсутствует.</p>';

    let starsHtml = '';
    if (post.rating) { const r5 = post.rating / 2; for (let i = 1; i <= 5; i++) { if (i <= Math.floor(r5)) starsHtml += '<span class="star full">★</span>'; else if (i === Math.ceil(r5)