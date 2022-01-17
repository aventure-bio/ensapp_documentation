# Commandes fournisseurs

Les fonctionnalités liées aux commandes fournisseurs / attendus de réception sont disponibles uniquement pour les magasins :
- Aventure Bio (`aventure-bio.myshopify.com`)
- Ma Vie Sans Gluten (`ma-vie-sans-gluten-x-aventure-bio.myshopify.com`)
- tous les autres D2C (via l'interface Shopify du magasin Aventure Bio : `aventure-bio.myshopify.com`)

## Transmission des attendus de réception d'achats d'Ensapp vers Magistor

Pour transmettre une commande fournisseur / attendu de réception à Ensovo, il faut se rendre dans l'interface d'Ensapp (via Shopify) et cliquer sur le bouton _Transmettre les achats_.

![](/images/supplier_order_button.png)

Il est maintenant possible de :
- transmettre une nouvelle commande fournisseurs / attendu de réception à Ensovo
- accéder à l'historique des commandes fournisseurs déjà transmises et visualiser les infos envoyées

![](/images/supplier_order_page.png)

### Transmettre une nouvelle commande

Le fichier transmis doit impérativement être au **format CSV** et l'ordre des colonnes doit être (par ordre) :
```
- Purchase Order : numéro de la commande
- Vendor/Supplier : nom du fournisseur
- Product : titre du produit
- Variant : nom du variant
- SKU
- Barcode
- Supplier Code	
- ASIN
- Text 1
- Date 1
- Weight
- Total Weight
- Weight Unit
- Status
- Received at : date de réception
- Retail Price
- In Stock : quantité en stock
- Qty Ordered : quantité commandée
- Pack Size
- Qty (packs) Ordered
- Cost (base)
- Total Cost (base)
- Cost (supplier currency)
- Total Cost (supplier currency)
```

Exemple de fichier CSV : [Télécharger l'exemple](/files/csv_example.csv)

Pour envoyer le fichier, cliquer sur _Ajouter un fichier CSV_ (voir image ci-dessus) puis _Valider la transmission_.

Si la transmission fonctionne, le message 'Transmission du fichier en cours...' s'affichera et Ensovo recevra les informations dans les minutes qui suivent.

::: details Infos pour les développeurs - Transmission des attendus de réception d'achats
Lorsqu'un CSV est chargé, Ensapp va déclencher le `StocksController #create`. 

Si le fichier inséré est au bon format et qu'il provient d'un magasin ayant accés à cette fonctionnalité, le service `::Ensovo::ProductsPurchase::Transmitter` se lancera et il va :
- créer la commande dans la DB : `create_purchase_order_in_db`
- générer le fichier '.dat' (format nécessaire à Magistor) : `generate_dat_infos + build_file_name`
- sauvegarder/rattacher le fichier '.dat' à la commande dans la DB : `attach_dat_file_to_purchase_order`
- transmettre à Magistor la dernière version de la base de données des produits (synchronisation des produits) : `sync_products`
- déposer le fichier '.dat' sur le serveur pour récupération par Magistor : `upload_purchase_dat_to_server`

La nouvelle commande / attendu de réception envoyé(e) sera maintenant visible dans l'historique des commandes fournisseurs déjà transmises (voir image ci-dessus).
:::
