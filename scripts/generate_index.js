const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, '../data/produits');
const outputFile = path.join(__dirname, '../data/products.json');

// Ensure directory exists
if (!fs.existsSync(productsDir)) {
  console.error('Directory not found:', productsDir);
  process.exit(1);
}

try {
  const files = fs.readdirSync(productsDir)
    .filter(file => file.endsWith('.json'));

  const allProducts = files.map(file => {
    const content = fs.readFileSync(path.join(productsDir, file), 'utf8');
    return JSON.parse(content);
  });

  fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2));
  console.log('Aggregated products file created successfully:', outputFile);
  console.log('Total products:', allProducts.length);
} catch (error) {
  console.error('Error creating aggregated index:', error);
  process.exit(1);
}
