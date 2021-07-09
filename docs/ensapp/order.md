# Commandes

## Import des commandes Shopify dans Ensapp

La récupération des commandes s'effectue grâce à la tache `shopify_to_magistor:import_orders_from_shopify` qui tourne **TOUTES LES 10 MINUTES**. 

### Création d'une commande

Dans le cas où le magasin a coché l'option _Envoyer les commandes à Magistor_ (`sync_orders`), une requête API à Shopify va récupérer toutes les commandes :
- datant de **moins de 15J**
- ayant un **statut "non traitée"** (`unfulfilled`).

On vérifie pour chaque commande si elle n'a pas déjà été créée dans Ensapp et si ce n'est pas le cas, elle est créée.

Lors de la création d'une commande dans Ensapp, on enregistre les données suivantes issues de Shopify :
- nom de la commande (`name`) : ex. AB1000, PAOS1000
- identifiant shopify (`shopify_id`)
- magasin auquel elle est rattachée (`shop`) : ex. Aventure Bio
- email de contact (`email`)
- adresse de livraison (`shipping_address`)
- adresse de facturation (`billing_address`) => en cas d'absence, est remplacée par l'adresse de livraison
- méthode de livraison (`shipping_method`) provenant soit :
  - d'un tag "transporteur@xxx"
  - du méthode de livraison choisie
  - du méthode de livraison par défaut

::: details Méthode(s) de livraison
Le magasin peut cocher ou non l'option _Faire le choix de la méthode d'expédition dans Magistor_ et ajouter une ou plusieurs méthodes de livraison (avec nom, code transporteur et url de suivi).
:::

La commande est maintenant créée avec un statut (`state`) "initial" dans Ensapp.

Si une erreur a eu lieu pendant la création de la commande, un email d'information est transmis aux emails support du magasin.

### Création des articles de la commande

Une fois la commande créée dans Ensapp, on créé les articles (`line_item`) qui lui sont rattachés.

Pour être créé, l'article doit être considéré comme éligible pour Magistor, c'est à dire :
- avoir une quantité traitable supérieur à 0 dans Shopify (`fulfillable_quantity`)
- être lié à un vendeur transmissible si `vendor_to_fulfill` est renseigné : ex. "Aventure Bio Grossiste" pour Aventure Bio
- être lié à un produit qui n'a pas le tag "exclure_ensovo".

Tous les articles éligibles à Magistor seront créés dans Ensapp avec les données suivantes :
- nom de l'article (`name`)
- identifiant shopify (`shopify_id`)
- commande à la laquelle il est rattaché (`order`)
- variant auquel il est rattaché (`variant`)
- quantité totale (`quantity`).

L'article est créé avec un statut de traitement "non traité" (`fulfillment_status: 'unfulfilled'`).

On vérifie ensuite si certains articles ont été remboursés et si oui, on ajoute la quantité remboursée dans le champ "quantité annulée" (`cancelled_quantity`) de l'article.

Si l'article a été 100% remboursé (quantité total = quantité annulée), son statut de traitement devient "annulé" (`cancelled`).

## Transmission des commandes d'Ensapp vers Magistor

