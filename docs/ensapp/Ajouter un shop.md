# Ajouter un shop

## Non D2C
1 - Se rendre sur https://shopify-magistor-connector.herokuapp.com/

2 - Rentrer l'URL de son magasin Shopify et s'y connecter. Vous serez redirigés vers votre espace administrateur

3 - Editer votre magasin dans l'app pour ajouter toutes les informations demandées (code entreprise, code du site, IP du serveur, nom d'utilisateur pour le serveur, mot de passe pour le serveur, heures de synchronisation des produits et des commandes, email de support, email de support secondaire). Ajouter des méthodes de livraison pour chacune des méthodes de livraison de Shopify. **Le nom doit être le même que la dénomination sur Shopify** et le code est généré par Magistor.


## D2C
Ce processus est très spécifique à Aventure Bio. Aventure Bio gére des magasins D2C (Direct to consumer) et leur stock comme para exemple: [Dagobert](https://dagobert.shop/), [Emma Noël](https://emmanoel.bio/), [Emile Noël](https://emilenoel.bio/), [Bio Demain](https://biodemain.shop/). Chez ENSOVO le stock de ces magasins est géré ensemble avec le stock d'Aventure Bio. C'est pourquoi c'est immportant d'envoyer les commandes de ces shops comme des commandes Aventure Bio.

1 - Se rendre sur https://shopify-magistor-connector.herokuapp.com/

2 - Rentrer l'URL de son magasin Shopify et s'y connecter. Vous serez redirigés vers votre espace administrateur

3 - Clicker en haut à droite sur 'Mon magasin' et puis sur 'Modifier'

4 - Remplissez avec les informations suivantes:

::: warning Attention
  Les champs non mentionnés sont à laisser vide
:::

* Info pricipale 
  * Code Entreprise: `ABIO`
  * Nom de la Boutique: Le nom de la boutique, par exemple `Bio Demain`
  * Code du site: `EN1`
  * IP du serveur: `79.81.205.149`
  * Nom de l'utilisateur du serveur: `ABIO_SFTP_P`
  * Mot de pass du serveur: **Demander à ENSOVO** où aller dans le terminal (si accès au code) et tapper les lignes suivantes
  ```ruby
    shop = Shop.find(36) # => shop Aventure bio id = 36
    shop.server_password # => retourne le mot de pass du serveur SFTP
  ```
  * Heure de synchronisation des produits: `05:30 AM`
  * Automatically send orders to magistor: `true`
  * Email de support technique pour transmission des erreurs: `tech@aventure.bio`
  * Email de support technique secondaire: `slf@aventure.bio`
  * Email de support technique tertiaire: `bonjour@aventure.bio`
  * Email de support client: `bonjour@aventure.bio`
  * Envoyer les produits à Magistor: `false`
  * Envoyer les commandes à Magistor: `true`
  * Mettre à jour le traitement des commandes Shopify: `true`
  * Mettre à jour l'inventaire Shopify: `false`
  * Gérer les DLV par défaut: `false`
  * Gérer les lots par défaut: `false`
  * Envoyer un email avec les changements d'inventaire: `false`
  * Donnée à utiliser comme code produit: `Code Barre`
  * Transmettre à Magistor les commandes non payées: `false`
  * Transmettre le fichier de stock mensuellement à l'entreprise: `false`
  * Valider les commandes avant de les transmettre à Magistor: `false`
  * Faire le choix de la méthode d'expédition dans Magistor: `false`
* Première méthode de livraison
  * Nom: `livraison à domicile (dpd)`
  * Code Transporteur: `DPD_ABIO`
  * Template de l'url de suivi: `https://www.dpd.fr/trace/[TRACKING_NUMBER]`
* Deuxième méthode de livraison
  * Nom: `Expédition gratuite`
  * Code Transporteur: `DPD_ABIO`
  * Template de l'url de suivi: `https://www.dpd.fr/trace/[TRACKING_NUMBER]`

5 - Une fois les infos entrées clickez sur Modifier ce(tte) Boutique

6 - Maintenant que l'intégration est faite, comme Aventure bio gère les stocks des D2C il faut synchroniser les
produits. Pour ça, aller en console et tappez le code suivant. Si vous n'avez pas accès au code demandez à quelqu'un de
l'équipe tech pour vous aider:
```ruby
  shop = Shop.last # => normalement la dernière shop faite créée. Sinon cherchez par l'id
  ShopifyToMagistor::ProductsJob.perform_now(shop.id, true)
```
::: warning Attention
  Il est important de mettre le `debug = true` (deuxième argument de envoyé au job) parce qu'**on ne veut pas** déposer le fichier des produits dans le serveur SFTP!

  Pour l'instant l'application ENSAPP ne gère pas le stock entre Aventure Bio et ces shop D2C. Cela est fait via une application shopify: [Stocky](https://apps.shopify.com/stocky)
:::
