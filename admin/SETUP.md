# 🚀 Guide de Configuration - Decap CMS

## Étape 1 : Importer les produits existants

Si vous avez déjà des produits dans `products.js`, importez-les vers Decap CMS :

```bash
npm run import-products
```

Cela créera les fichiers JSON dans `admin/data/products/` à partir de `products.js`.

## Étape 2 : Configuration pour Netlify (Production)

### 2.1 Déployer sur Netlify

1. Créez un compte sur [Netlify](https://www.netlify.com)
2. Connectez votre dépôt Git (GitHub, GitLab, Bitbucket)
3. Déployez votre site

### 2.2 Activer Identity et Git Gateway

1. Dans Netlify Dashboard → **Site settings** → **Identity**
2. Cliquez sur **Enable Identity**
3. Dans **Services** → **Git Gateway**, cliquez sur **Enable Git Gateway**
4. Configurez les **Registration preferences** selon vos besoins

### 2.3 Accéder à l'admin

1. Allez sur `votre-site.netlify.app/admin/`
2. Cliquez sur **Sign up** pour créer un compte admin
3. Vérifiez votre email
4. Connectez-vous et commencez à gérer vos produits !

## Étape 3 : Configuration pour le développement local

### 3.1 Installer les dépendances

```bash
npm install
```

### 3.2 Lancer Decap CMS en mode proxy

```bash
npm run cms
```

Cela lancera un serveur sur `http://localhost:8080`

### 3.3 Modifier config.yml pour le mode proxy

Ouvrez `admin/config.yml` et remplacez :

```yaml
backend:
  name: git-gateway
  branch: main
```

Par :

```yaml
backend:
  name: proxy
  proxy_url: http://localhost:8081/api
```

### 3.4 Accéder à l'admin local

Allez sur `http://localhost:8080/admin/`

## Étape 4 : Utilisation quotidienne

### Ajouter/Modifier un produit

1. Allez sur `/admin/`
2. Cliquez sur **Produits**
3. Cliquez sur **New Product** ou sur un produit existant
4. Remplissez les champs :
   - **ID** : Format `categorie-numero` (ex: `corporel-1`)
   - **Nom** : Nom du produit
   - **Prix** : Prix en FCFA
   - **Catégorie** : Sélectionnez la catégorie
   - **Image** : Upload ou URL
5. Cliquez sur **Save**

### Exporter vers products.js

Après avoir modifié des produits, régénérez `products.js` :

```bash
npm run export-products
```

Cela convertira tous les fichiers JSON en `products.js`.

## ⚠️ Important

- **Toujours exporter** après avoir modifié des produits dans Decap CMS
- Les modifications dans Decap CMS créent des fichiers JSON, pas directement `products.js`
- Le script `export-products` est nécessaire pour synchroniser avec `products.js`
- Commitez les changements dans Git après export

## 🔄 Workflow recommandé

1. Modifier les produits dans `/admin/`
2. Exécuter `npm run export-products`
3. Vérifier que `products.js` est à jour
4. Commiter les changements
5. Pousser vers Git (Netlify déploiera automatiquement)

## 🆘 Dépannage

### L'admin ne se charge pas

- Vérifiez que `admin/index.html` existe
- Vérifiez que `admin/config.yml` est valide
- Vérifiez la console du navigateur pour les erreurs

### Les produits ne s'affichent pas

- Vérifiez que les fichiers JSON existent dans `admin/data/products/`
- Exécutez `npm run import-products` pour créer les fichiers initiaux
- Vérifiez que `products.js` est bien généré avec `npm run export-products`

### Erreur "Git Gateway"

- Vérifiez que Git Gateway est activé dans Netlify
- Vérifiez que vous êtes connecté avec un compte Netlify Identity
- En local, utilisez le mode proxy au lieu de git-gateway

