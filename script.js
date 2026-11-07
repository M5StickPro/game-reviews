const projectId = 'lvvctfr4';
const dataset = 'production';

const query = encodeURIComponent(`*[_type == "post"]{
  title,
  "imageUrl": mainImage.asset->url,
  "rating": rating,
  "text": excerpt,
  "slug": slug.current
}`);

const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`;

function renderReviews(reviews) {
  const container = document.getElementById("reviews");
  if (!container) return;
  
  container.innerHTML = "";

  if (!reviews || reviews.length === 0) {
    container.innerHTML = "<p style='color: #a0a0a0; text-align: center; width: 100%;'>Нет статей.</p>";
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
          starsHtml += '★';
        } else if (i === Math.ceil(ratingOutOfFive) && !Number.isInteger(ratingOutOfFive)) {
          starsHtml += '⯨';
        } else {
          starsHtml += '☆';
        }
      }
      starsHtml += ` <span style="color:#a0a0a0; font-size: 1rem;">(${r.rating}/10)</span>`;
    } else {
      starsHtml = '<span style="color:#a0a0a0; font-size: 1rem;">Нет оценки</span>';
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

fetch(url)
  .then(response => response.json())
  .then(data => {
    renderReviews(data.result);
  })
  .catch(error => {
    console.error('Ошибка запроса:', error);
    document.getElementById("reviews").innerHTML = `<p style="color:red;">Ошибка: ${error.message}</p>`;
  });