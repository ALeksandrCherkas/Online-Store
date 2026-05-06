export type ProductImages = {
  id: number,
  image_url: string,
  product_id: number
}

export type Product = {
  id: number,
  title: string,
  description: string,
  price: number
  images: ProductImages[],
  rating: number,
  full_description?: string,
  category: string
} 