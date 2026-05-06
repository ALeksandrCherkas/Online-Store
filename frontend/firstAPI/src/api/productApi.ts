export async function getProducts(){
    const response = await fetch("http://localhost:3000/api/product");

    if(!response.ok) {
        throw new Error("Failed to fetch products")
    }

    return response.json()
}