const fs = require('fs');
const path = require('path');
const vm = require('vm');

const productsFilePath = path.join(__dirname, '../products.js');
const outputDir = path.join(__dirname, '../data/produits');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Reading products from:', productsFilePath);
let productsContent = fs.readFileSync(productsFilePath, 'utf8');

// Replace const definition to ensure it attaches to sandbox
productsContent = productsContent.replace('const PRODUCTS =', 'var PRODUCTS =');

// Create a sandbox to evaluate the PRODUCTS variable
const sandbox = {};
vm.createContext(sandbox);

try {
  vm.runInContext(productsContent, sandbox);
} catch (e) {
  console.error('Error parsing products.js:', e);
  process.exit(1);
}

const PRODUCTS = sandbox.PRODUCTS;

if (!PRODUCTS) {
  console.error('PRODUCTS variable not found in products.js');
  process.exit(1);
}

let count = 0;

// Iterate through categories
for (const category in PRODUCTS) {
  const products = PRODUCTS[category];
  console.log(`Processing category: ${category} (${products.length} products)`);

  products.forEach(product => {
    // Ensure strict JSON format fields
    const productData = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category || category // Ensure category is set
    };

    // Normalize category for 'maison' if it was implicitly grouped
    if (category === 'maison' && (product.id.startsWith('chambre') || product.id.startsWith('thiouraye'))) {
        productData.category = 'maison';
    }

    const fileName = `${product.id}.json`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(productData, null, 2));
    count++;
  });
}

console.log(`Successfully migrated ${count} products to ${outputDir}`);
