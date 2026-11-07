export default {
  name: 'post',
  title: 'Обзор игры',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Название игры',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Ссылка (Slug)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    },
    {
      name: 'mainImage',
      title: 'Обложка игры',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'excerpt',
      title: 'Краткое описание (для карточки)',
      type: 'text',
      rows: 3,
    },
    {
      name: 'rating',
      title: 'Оценка (от 1 до 10)',
      type: 'number',
      validation: Rule => Rule.min(1).max(10)
    },
    {
      name: 'author',
      title: 'Автор',
      type: 'reference',
      to: [{type: 'author'}] // Ссылка на созданного автора
    },
    {
      name: 'body',
      title: 'Полный текст обзора',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
}