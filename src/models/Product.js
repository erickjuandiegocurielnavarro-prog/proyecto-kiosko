const PRODUCTS = [
  {
    id: 1,
    name: "Café Espresso & Cappuccino Gourmet",
    category: "cafe",
    categoryLabel: "Café",
    price: 45.00,
    image: "images/cafe.jpg",
    description: "Preparado con selección especial de granos 100% arábica recién molidos."
  },
  {
    id: 2,
    name: "Frappé Caramel Supreme",
    category: "frappe",
    categoryLabel: "Frappé",
    price: 65.00,
    image: "images/frappe.jpg",
    description: "Bebida helada a base de espresso doble, crema batida y caramelo artesanal."
  },
  {
    id: 3,
    name: "Combo Desayuno Gourmet",
    category: "combos",
    categoryLabel: "Combos",
    price: 95.00,
    image: "images/combos.jpg",
    description: "Café caliente + Croissant de mantequilla recién horneado + Jugo natural."
  },
  {
    id: 4,
    name: "Selección de Pan Artesanal y Baguettes",
    category: "pan",
    categoryLabel: "Pan en General",
    price: 35.00,
    image: "images/pan.jpg",
    description: "Variedad de pan rústico de masa madre, baguettes crujientes y repostería."
  }
];

module.exports = {
  getAllProducts: () => PRODUCTS
};
