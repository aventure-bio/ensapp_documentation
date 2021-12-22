# Installation

## Magasin classique

1) Se rendre sur [https://shopify-magistor-connector.herokuapp.com/](https://shopify-magistor-connector.herokuapp.com/)
2) Saisir l'url du magasin Shopify et s'y connecter. Vous serez redirigés vers votre espace administrateur
3) Cliquer sur _Mon magasin_ (en haut à droite) et puis sur _Modifier_
4) Remplir les informations demandées :
- code entreprise
- code du site
- IP du serveur
- nom d'utilisateur pour le serveur
- mot de passe pour le serveur
- heures de synchronisation des produits et des commandes
- email de support et email de support secondaire
- méthodes de livraison pour chacune des méthodes de livraison de Shopify. 

::: warning Méthodes de livraison
**Le nom doit être le même que la dénomination sur Shopify** et le code est généré par Magistor.
:::

## Aventure Bio (magasin D2C)

Aventure Bio a des besoins spécifiques concernant la gestion de ses magasins D2C (Direct to Consumer) et nécessite une configuration particulière. 
Exemple des magasins D2C : 
- [Dagobert](https://dagobert.shop/)
- [Emma Noël](https://emmanoel.bio/)
- [Emile Noël](https://emilenoel.bio/)
- [Bio Demain](https://biodemain.shop/). 

Pour ces magasins D2C, les flux d'information sur la gestion des commandes sont différents de ceux liés à la gestion des produits (stock).

**Points clés sur la gestion des commandes** :
- chaque magasin D2C transmet directement ses nouvelles commandes Shopify vers Magistor => ne transite pas via Shopify Aventure Bio
- chaque commande expédiée/traitée est directement mise à jour sur le magasin Shopify D2C => ne transite pas via Shopify Aventure Bio.

**Points clés sur la gestion des produits** :
- les produits en vente sur un magasin D2C sont dupliqués dans le magasin Aventure Bio
- le magasin Aventure Bio communique tous les produits en vente à Magistor (produits D2C inclus) => transite via Shopify Aventure Bio
- l'inventaire quotidien des stocks est reçu via le magasin Aventure Bio (stock produits Aventure Bio + D2C) => transite via Shopify Aventure Bio (puis Syncio)
- le calcul de retraitement des stocks (stocks réels - commandes en attente) tient compte des commandes d'Aventure Bio + commandes sur les magasins D2C.

### Confuguration

1) Se rendre sur [https://shopify-magistor-connector.herokuapp.com/](https://shopify-magistor-connector.herokuapp.com/)
2) Saisir l'url du magasin Shopify et s'y connecter. Vous serez redirigés vers votre espace administrateur.
3) Cliquer sur _Mon magasin_ (en haut à droite) et puis sur _Modifier_
4) Remplir toutes les informations demandées de la manière suivante :

::: warning Attention
  Les champs non mentionnés doivent être laisser vides.
:::


> Informations pricipales
> - Code Entreprise: `ABIO`
> - Nom de la Boutique: `Nom du magasin`
> - Code du site: `EN1`
> - IP du serveur: `79.81.205.149`
> - Nom de l'utilisateur du serveur: `ABIO_SFTP_P`
> - Mot de passe du serveur: **Demander à ENSOVO***
> - Heure de synchronisation des produits: `05:30 AM`
> - Automatically send orders to magistor: `true`
> - Email de support technique pour transmission des erreurs: `tech@aventure.bio`
> - Email de support technique secondaire: `slf@aventure.bio`
> - Email de support technique tertiaire: `bonjour@aventure.bio`
> - Email de support client: **Demander l'email à l'équipe Business AB + Faire autorisation Postmark si besoin**
> - Envoyer les produits à Magistor: `false`
> - Envoyer les commandes à Magistor: `true`
> - Mettre à jour le traitement des commandes Shopify: `true`
> - Mettre à jour l'inventaire Shopify: `false`
> - Gérer les DLV par défaut: `false`
> - Gérer les lots par défaut: `false`
> - Envoyer un email avec les changements d'inventaire: `false`
> - Donnée à utiliser comme code produit: `SKU`
> - Transmettre à Magistor les commandes non payées: `false`
> - Transmettre le fichier de stock mensuellement à l'entreprise: `false`
> - Valider les commandes avant de les transmettre à Magistor: `false`
> - Faire le choix de la méthode d'expédition dans Magistor: `false`

> Première méthode de livraison
> - Nom: `livraison à domicile (dpd)`
> - Code Transporteur: `AB_DPD`
> - Template de l'url de suivi: `https://www.dpd.fr/trace/[TRACKING_NUMBER]`

> Deuxième méthode de livraison
> - Nom: `Expédition gratuite`
> - Code Transporteur: `AB_DPD`
> - Template de l'url de suivi: `https://www.dpd.fr/trace/[TRACKING_NUMBER]`

::: details * Infos pour les développeurs
Pour obtenir le mot de passe, aller dans le Terminal et saisir les lignes suivantes
  ```ruby
    shop = Shop.find(36) # => shop Aventure bio id = 36
    shop.server_password # => retourne le mot de passe du serveur SFTP
  ```
:::

5) Cliquer sur _Modifier ce(tte) Boutique_

6) Maintenant que la configuration est terminée, ajouter les produits D2C en vente dans le magasin Aventure bio pour pouvoir gérer les stocks.

Si vous n'avez pas accès au code, veuiller demander à l'équipe Tech de le faire.
::: details Infos pour les développeurs
Dans le job `ShopifyToMagistor::ProductsJob`, mettre en deuxième argument `debug = true` pour **ne pas déposer le fichier des produits dans le serveur SFTP**!

Aller en console et saisir les lignes suivantes :
```ruby
  shop = Shop.last # => normalement dernier shop créé ou chercher par id
  ShopifyToMagistor::ProductsJob.perform_now(shop.id, true)
```
:::
