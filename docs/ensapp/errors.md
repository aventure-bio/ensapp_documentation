# Erreurs / Anomalies

## Import des commandes Shopify dans Ensapp

#### OBJET: *[ENSAPP-Erreur] XXX - La commande AXXXX ne s'est pas enregistrée correctement*

____

::: details Infos pour les développeurs - Vérifier la création de la commande
Si la commande est bien créée dans Ensapp, elle peut être trouvée en console en saisissant `order = Order.find_by_name('AXXXX')`
:::

#### ERREUR "Certaines données ne sont pas disponibles" (hors shopify_id)

:question: Problème : Shopify a transmis à Ensapp des données manquantes

:heavy_check_mark: Solution : 
- si dans les minutes qui suivent, la commande a bien été créée correctement dans Ensapp, le problème s'est résolu "de lui même" (Shopify a regénéré correctement la transmission d'information)
- si le probleme persiste avec de nouveaux messages d'erreur et que la commande ne parvient à se créer dans Ensapp :
  - investiguer la commande créée dans Shopify pour s'assurer qu'elle n'est pas d'anomalie
  - discuter avec l'équipe Business si besoin pour mettre à jour les données manquantes si possible directement dans Shopify (pour générer une nouvelle tentative de création)

#### ERREUR "Shopify_id n'est pas disponible"

:question: Problème : Shopify a transmis à Ensapp des données manquantes => anomalie de fonctionnement de Shopify

:heavy_check_mark: Solution : 
- dans les minutes qui suivent, la commande devrait s'être créée correctement dans Ensapp. Le problème s'est résolu "de lui même" (Shopify a regénéré correctement la transmission d'information)


## Expédition / Traitement de la commande via CRP

#### OBJET: *[ENSAPP-Erreur] XXX - Le traitement de la commande AXXXX ne s'est pas fait correctement*

____

::: details Infos pour les développeurs - Récupérer le CRP
Le CRP transmis par Ensovo peut-être récupéré de plusieurs manières :
- en pièce-joint de l'email d'erreur
- en console / terminal en saisissant :
```
order = Order.find_by_name('AXXXX')
puts order.shipping_receipt.download # CRP = shipping_receipt
```
:::

::: details Infos pour les développeurs - Traiter manuellement la commande
Pour qu'une commande soit traitée comme expédiée dans Ensapp, lancer la tache `heroku run rake fulfill_blocked_orders\['AXXXX']` (remplacer "AXXXX" par le numéro de la commande)
:::

#### ERREUR "Problème avec le package_data"

:question: Problème : une anomalie a eu lieu pendant le traitement des lignes du CRP par Ensapp

:heavy_check_mark: Solution : 

- si dans les minutes qui suivent, les informations du CRP ont bien été transmises à Shopify MAIS la commande reste "*sent_to_magistor*" dans Ensapp, traiter manuellement la commande (*[infos pour les développeurs](https://documentation-ensapp.netlify.app/ensapp/errors.html#expedition-traitement-de-la-commande-via-crp)*) et ajouter la balise/tag "*ensovo_fulfilled*" dans Shopify
- si le probleme persiste avec de nouveaux messages d'erreur et qu'aucune information n'est transmise à Shopify, investiguer le CRP reçu

#### ERREUR "Le lien du suivi n'est pas présent"

:question: Problème : le lien de suivi n'est pas présent ou le mode de livraison n'est pas connu pour ce magasin

:heavy_check_mark: Solution : 

- vérifier si le CRP contient un numéro de suivi (correpond à l'avant dernière série de chiffres)
- vérifier si le magasin a bien ce mode de livraison rattaché

::: details Infos pour les développeurs - Rattacher un mode de livraison à un magasin
```
shop = Shop.find(....)
shop.shipping_methods.map(&:code) # vérifier si le mode de livraison est déjà rattaché au magasin
shipping_method = ShippingMethod.find_by(code: ....) # rechercher le code de livraison utilisé dans le CRP (ex: COLISSIMO_ABIO)

# ou si besoin, créer le mode de livraison
shipping_method = ShippingMethod.create(name: ...., code: ...., ...)

shop.shipping_methods << shipping_method # ajouter le mode de livraison au magasin
```
:::

#### ERREUR "Line item '103XXXXX' is already fulfilled"

:question: Problème : la quantité indiquée comme expédiée par Ensovo ne correspont pas avec la quantité à traiter dans Shopify

:heavy_check_mark: Solution : 

- vérifier les quantités à traiter dans Shopify (dans les articles "à traiter" et "supprimés")
- investiguer le CRP reçu et les quantités indiquées comme expédiées par Ensovo


::: details Infos pour les développeurs - Analyser le CRP
Le CRP transmis par Ensovo peut-être analysé en console en saisissant les lignes :
```
order = Order.find_by_name('AXXXX') # récupérer la commande concernée
line_item = order.line_items.find_by(shopify_id: '103XXXXX') # récupérer l'article en utilisant l'ID du LineItem mentionné dans l'email d'erreur
sku = line_item.variant.sku # trouver le SKU de l'article
```
Récupérer le CRP comme indiqué en note plus haut *[infos pour les développeurs](https://documentation-ensapp.netlify.app/ensapp/errors.html#objet-ensapp-erreur-xxx-le-traitement-de-la-commande-axxxx-ne-s-est-pas-fait-correctement)*.

Faire une recherche via `CTRL` + `F` pour trouver dans le CRP l'article concerné. La quantité correspond au nombre mentionné juste après le SKU (à sa droite).
:::

- si le CRP était erroné, modifier le CRP avec les bonnes informations (validées par l'équipe Business) et redéposer le fichier corrigé sur le serveur SFTP avec une copie vide de ce fichier ayant l'extension .bal (ex: 'CRP...0001.dat' + 'CRP...0001.bal')
- si les quantités ont été supprimées à tord dans Shopify, voir si l'équipe Business peut les rajouter manuellement à la commande Shopify et relancer le traitement du CRP (comme indiqué au dessus) en modifiant ses données si besoin

#### ERREUR "Fulfilled quantity for line item 'XXXX' must be less than or equal to the fulfillable line item quantity X"

:question: Problème : Parfois le CRP envoyé peut diviser une ligne de la commande en deux lignes dans le CRP ce qui cause un problème.

:heavy_check_mark: Solution : 

- Première chose à faire est de vérifier dans la DB si la commande à bien le statut `sent_to_magistor`
- Deuxième chose à faire est de controller si les infos du CRP sont correctes. Il faut donc ouvrir le CRP en pièce jointe du mail et ouvrir la commande sur shopify. En suite il faut comparer les quantités.
![](/images/shopify_order_li.png)
![](/images/CRP_quantities.png)

**NOTE: Si la commande est un bundle c’est normal que la ligne du panier (dans l’exemple la première ligne) n’apparaisse pas dans le CRP**

- Si tout est OK avec le CRP on peut donc traiter la commande sur Shopify en ajoutant le numéro de suivi. L’avant dernière collonne dans le CRP. Dans l’exemple `250059803396849149`

- Toujours sur Shopify ajouter le tag `ensovo_fulfilled` sur la commande

::: details Infos pour les développeurs - Lancer rake task
Lancer la rake task `heroku run rake fulfill_blocked_orders\['AXXXX']` en console. AXXXX etant le número de la commande. Pour la commande utilisé au dessus comme exemple la rake serait: 
`heroku run rake fulfill_blocked_orders\['BD1048']`
:::
