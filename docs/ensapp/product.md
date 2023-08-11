# Produits

## Transmission des produits de Shopify vers Magistor

Toutes les 10 minutes, les données produits de Shopify sont transmises à Magistor via la tâche `ShopifyToMagistor::ProductsJob`.

Cette transmission est **déclenchée automatiquement** si :
- le magasin a activé la synchronisation / transmission des produits vers Magistor
- une heure de synchronisation est configurée pour le magasin
- la transmission n'a pas déjà été faite.

Elle peut également être **déclenchée manuellement** en cliquant sur le bouton _Synchroniser les produits_ dans l'application Ensapp de la boutique Shopify.

Cette tâche va alors transmettre un fichier contenant tous les produits du magasin Shopify vers le serveur SFTP dédié.

Dans la pratique, le fichier produits a toujours pour extension `.dat`. Une fois son chargement sur le serveur SFTP terminé et afin d'indiquer à Magistor que le fichier produits est prêt à être traité, Ensapp dépose sur le serveur SFTP un second fichier **vide** ayant le même nom mais une extension `.bal`. C'est ce deuxième dépôt qui déclenchera la synchronisation de Magistor.
Cette stratégie de doublon est utilisée pour la gestion des commandes.

::: warning Attention
S'il manque des informations au produit dans Shopify (pas de code-barres, pas de titre), il ne sera pas intégré au fichier !

Un email d'erreur sera transmis aux destinataires support du magasin pour signaler l'anomalie.
:::

::: details Infos pour les développeurs
Ce job peut être lancé en mode "test" depuis la console en lui ajoutant le boolean `true`. Exemple :
```ruby
  ShopifyToMagistor::ProductsJob.perform_now(36, true)
```
Cet argument est initialisé par défaut à `false` et pas besoin de l'ajouter en dehors du mode "test".
:::

## Mise à jour des stocks produits de Magistor vers Shopify

Dès qu'un fichier STK d'image de stock est déposé par Magistor sur le serveur SFTP du magasin, l'application Ensapp va le récupérer et le traiter.

### Calcul du stock

Le stock est calculé de la manière suivante pour chaque produit / variant :

**stock final = stock réel indiqué par Magistor - stock déjà vendus (commandes non traitées)***



Si le stock final est différent du stock calculé par Shopify**, ce dernier est mis à jour dans Shopify avec le montant du stock final.

*pour Aventure Bio, le stock déjà vendus tient compte des commandes en attentes dans le magasin Shopify Aventure Bio + les magasins D2C concernés par le produit. Si le D2C en question n'est pas sur ENSAPP mais sur le HUB (ex: Piques Assiette) un call API est générer entre les deux apps. Pour plus d'information sur ce call API voici le lien (page en cours de construction).
Pour le calcul des stock lié au commandes non traité nous allons prendre en considération les `unfulfilled_quantity` des line_items qui sont liés à des commandes non traités par ensovo.
Pour ENSAPP les commandes avec le status `initial` et `sent_to_magistor` et pour le HUB les commandes avec le statut `unfulfilled` et `transmit_to_logistician`.

**dans le cas où Ensovo a réceptionné une commande dans la journée ou a supprimé des produits expirés

