const images = {
  hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85",
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
  fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
  home: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
  books: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  default: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
} as const;

export const heroImage = images.hero;

export function getStoreImage(value: string) {
  const text = value.toLowerCase();
  if (/electronic|phone|laptop|computer|headphone|camera|watch/.test(text)) return images.electronics;
  if (/fashion|cloth|shirt|shoe|wear|bag/.test(text)) return images.fashion;
  if (/home|furniture|kitchen|decor/.test(text)) return images.home;
  if (/beauty|skin|cosmetic|care/.test(text)) return images.beauty;
  if (/sport|fitness|gym|outdoor/.test(text)) return images.sports;
  if (/book|stationery|education/.test(text)) return images.books;
  if (/grocery|food|fresh|drink/.test(text)) return images.grocery;
  return images.default;
}
