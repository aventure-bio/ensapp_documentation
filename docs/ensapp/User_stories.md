# User Stories

## Envoi des produits de Shopify vers Magistor

Toutes les 10 minutes, un job est déclanché `ShopifyToMagistor::ProductsJob` pour les magasins pout lesquelles la synchronisation doit être faite. Elle est déclanchée si:

- Une heure de synchronisation est précisée pour le magasin;  
**et si**
- Les produits n'ont pas encore été envoyés le même jour et que l'heure de synchronisation n'est pas encore passée.

Une fois ce job déclanché, un fichier avec tous les produits Shopify du magasin est envoyé sur le serveur SFTP lié au magasin. En cas de produits "incomplets" sur Shopify (pas de codebarre ou de titre), ils ne sont pas intégrés au fichier et un email est envoyé à l'email de support lié au magasin avec des informations plus précises.

Ce job peut être déclanché manuellement aussi en clickant sur le bouton 'Synchroniser les produits' dans l'application ENSAPP du magasin. 

::: details Note
Ce job peut être aussi lancé en mode *test* depuis la console en lui passant le boolean `true`. Par exemple
```ruby
  ShopifyToMagistor::ProductsJob.perform_now(36, true)
```
Par défau cette valeur est mise en `false` donc pas besoin de la passer quand apellée sans être en mode *test*
:::

::: warning Important
  Après avoir télécharger le document des produits sur le serveur SFTP (qui termine par l'extension `.dat`), un autre fichier **vide** est téléchargé avec l'extension `.bal`. Ce fichier est utilisé pour indiquer que le fichier précédent (`.dat`) à terminé d'être téléchargé. Cette même stratégie est utilisée au moment de télécharger des documents de Magistor vers Shopify.
:::

## Envoi des commandes de Shopify vers Magistor

4 fois par jour (au maximum) aux heures de synchronisation des commandes, un fichier avec les commandes et line_items 
du jour précédent est envoyé sur le serveur SFTP lié au magasin. En cas de commandes "incomplètes" sur Shopify (pas de 
numéro de commande, de code de méthode de livraison, d'adresse de livraison complète, de quantité), elles ne sont pas 
intégrées au fichier et un email est envoyé à l'email de support lié au magasin avec des informations plus précises. 
Les méthodes de livraison possibles doivent préalablement être configurées dans l'application Ensapp.

## Envoi des commandes traitées de Magistor à Shopify

Dès qu'un fichier de commandes traitées apparait sur le serveur SFTP lié au shop, il est traité par l'app. 2 cas sont 
possibles:

- Le fichier est un CRE: dans ce cas, chaque commande est passée à "Traitée" dans Shopify et le numéro de tracking est 
mis à jour

- Le fichier est un CRP (avec un ligne par produit dans la commande), les produits traités sont notés comme "Traités" 
dans Shopify. Si certains produits de la commande ne sont pas traités, le client est prévenu par email Dans tous les 
cas, en cas de commandes "incomplètes" dans le fichier sur le serveur SFTP (pas de numéro de commande ou de lien de 
tracking), elles ne sont pas traitées et un email est envoyé à l'email de support lié au magasin avec des informations 
plus précises

## Mise à jour du stock des produits dans Shopify

Dès qu'une image de stock apparait sur le serveur SFTP lié au shop, elle est traitée par l'app Le stock supposé est 
calculé (stock réel indiqué sur le fichier - stock en instance de sorties dans les commandes encore non traitées) et, 
s'il est différent du stock indiqué sur Shopify, ce dernier est mis à jour En cas de produits "incomplets" dans le 
fichier sur le serveur SFTP (pas d'identifiant ou de quantité), leur stock n'est pas mis à jour et un email est envoyé 
à l'email de support lié au magasin avec des informations plus précises
