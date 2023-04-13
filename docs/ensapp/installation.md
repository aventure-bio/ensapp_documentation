# Installation

## Magasin classique

1) Depuis la mise à jour Shopify (2022-10) nous avons modifier le format de l'application ENSAPP dans shopify. Il faut obligatoirement créer une application custom dans le shopify en question, voici un [lien](https://www.notion.so/aventurebio/Comment-cr-er-un-app-personnalis-e-dans-Shopify-custom-app-320adba13a0f48ed99d0e80323c3e6e5) pour créer l'appication.
Voici la liste des autorisation à ajouter a l'application custom:
- write_products,
- read_proucts,
- write_orders,
- read_orders,
- read_locations,
- write_location,
- write_inventory,
- read_inventory,
- write_fulfillments,
- read_fulfillments,
- write_assigned_fulfillment_orders,
- read_assigned_fulfillment_orders
- write_merchant_managed_fulfillment_orders,
- read_merchant_managed_fulfillment_orders,
- write_third_party_fulfillment_orders
- read_third_party_fulfillment_orders

2) Un développeur devra vous créer le `shop` avec les clès générés via l'application custom `(Clé API, Mot de passe API, Jeton)` dans ENSAPP et y rattacher un `user` pour pouvoir vous connecter à ENSAPP via ce user.
::: details * Infos pour les développeurs - Créer un shop et le rattacher à un `user`
  - faire `shop = Shop.create(shopify_domain: 'XX', shopify_api_key: 'XX', shopify_api_password: 'XX', shopify_token: 'XX')`
  - faire `user = User.new(email: "XX", password: "XX")`
  - faire `user.shops << shop`
  - faire `user.save`

  ___IMPORTANT___ il faut absulment renseigner dans `lastpast` les clés générées et les utilisateurs lié au shop pour pouvoir s'y connecter !
:::
3) Pour le bon fonctionnement du shop il faut également ajouter les webhooks pour recevoir les informations de shopify. Nous avons besoin d'écouter la liste suivants pour que l'application focntionne a 100%.

> __Liste des webhooks:__
>
> orders/create, orders/updated, orders/cancelled, products/create, products/update, products/delete, inventory_items/create, inventory_items/update

::: details * Infos pour les développeurs - Créer les webhooks pour un `shop`
  ```rb
  shop = Shop.find(XX)
  shop.activate_session
  # vérifier la liste de webhook
  ShopifyAPI::Webhook.all.map(&:address)

  # créer les webhooks
  topics = %w[orders/create orders/updated orders/cancelled products/create products/update products/delete inventory_items/create inventory_items/update]
  topics.each do |topic|
    ShopifyAPI::Webhook.create!(topic: topic, address: "https://shopify-magistor-connector.herokuapp.com/webhooks/#{topic.gsub('/', '_')}", format: 'json')
  end

  # vérifier la liste de webhook
  ShopifyAPI::Webhook.all.map(&:address)

  ```

  - Pour faire des tests il est possible de créer des webhooks avec l'adresse de `ngrok` à la place de `https://shopify-magistor-connector.herokuapp.com/webhooks/`

  - une task existe, elle tourne tout les jours pour créer d'éventuelle webhook qui aurait pu etre supprimer par shopify, taks `rake generate_webhooks`

:::

4) Se rendre sur [https://shopify-magistor-connector.herokuapp.com/](https://shopify-magistor-connector.herokuapp.com/)
5) Se connecter avec l'utilisateur associé au magasin désiré.
6) Cliquer sur _Mon magasin_ (en haut à droite) et puis sur _Modifier_
7) Remplir les informations demandées :
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

### Configuration

1) Se rendre sur [https://shopify-magistor-connector.herokuapp.com/](https://shopify-magistor-connector.herokuapp.com/)
2) Se connecter avec l'utilisateur associé au magasin désiré.
3) Cliquer sur _Mon magasin_ (en haut à droite) et puis sur _Modifier_
4) Remplir toutes les informations demandées de la manière suivante :

::: warning Attention
  Les champs non mentionnés doivent être laisser vides.
:::


> Informations pricipales
> - Code Entreprise: `ABIO`,
> - Nom de la Boutique: `Nom du magasin`
> - Code du site: `EN1`
> - IP du serveur: `79.81.205.149`
> - Nom de l'utilisateur du serveur: `ABIO_SFTP_P`
> - Mot de passe du serveur: **Demander à ENSOVO***
> - Heure de synchronisation des produits: `05:30 AM`
> - Automatically send orders to magistor: `true`
> - Email de support technique pour transmission des erreurs: `tech@aventure.bio`
> - Email de support technique secondaire: `slf@aventure.bio`
> - Email de support technique tertiaire: **Demander l'email à l'équipe Business AB + Faire autorisation Postmark si besoin**
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

::: details * Infos pour les développeurs - lancer ENSAPP en local
  - faire `ngrok http -subdomain=ensovapp 5000` (dans un premier onglet)
  - faire `rails s -p 5000` (dans un deuxième onglet)
  - aller sur "https://ensovapp.ngrok.io"
  - se connecter au shop désiré via l'utilisateur correspondant.
:::
