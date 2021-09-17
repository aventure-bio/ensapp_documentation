# Commandes

## Import des commandes Shopify dans Ensapp

La récupération des commandes s'effectue grâce à la tache `shopify_to_magistor:import_orders_from_shopify` qui tourne **TOUTES LES 10 MINUTES**

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

La synchronisation des commandes s'effectue avec la tache `shopify_to_magistor:transmit_orders_to_magistor` qui peut être déclenchée de 2 manières :
- Toutes les 10 minutes;
- Créneaux horaires précis.

### Toutes les 10 minutes

Si le magasin souhaite transmettre les commandes de manière continue et qu'il coche l'option _Envoyer automatiquement les commandes à Magistor_ (`automatically_send_orders_to_magistor`), les commandes seront transmises à Magistor toutes les 10 minutes si elles sont transmissibles.

### Créneaux horaires précis

Si le magasin ne souhaite pas cocher l'option _Envoyer automatiquement les commandes à Magistor_, il a la possibilité de choisir *N* créneaux horaires (`order_sync_times`) différents pour le déclenchement de la synchronisation des commandes.

::: warning Attention
Un magasin ne peut pas cocher l'option _Envoyer automatiquement les commandes à Magistor_ **ET** par ailleurs choisir des créneaux horaires précis pour la synchronisation.
:::

En pratique, c'est la même tâche `shopify_to_magistor:transmit_orders_to_magistor` qui est déclenchée automatiquement toutes les 10 minutes mais, dans ce cas, elle vérifie en amont si :
- l'heure actuelle (au moment où tourne la tache) est postérieure au créneau horaire choisi pour le magasin 
- le déclenchement n'a pas encore été fait pour le créneau horaires en question.
Dans ce cas où ces deux conditions sont vraies, les commandes sont transmises à Magistor. Et ainsi de suite pour tous les créneaux horaires choisis.

Le magasin peut ajouter autant de créneaux horaires qu'il le souhaite.

::: details Infos pour les développeurs 
Côté base de données, la relation entre la table `shops` et la table `order_sync_times` est une relation N:1. 
Un magasin peut avoir *N* heures de synchronisation mais une heure de synchronisation peut seulement appartenir à un magasin.

Pour savoir si la synchronisation a déjà eu lieu pour un créneau horaire choisi, on utilise une troisième table `order_sync_time_sent_dates` qui conserve la **date** de la synchronisation.
La relation entre la table `order_sync_times` et `order_sync_time_sent_dates` est de N:1. Une heure de synchronisation peut avoir *N* dates d'envoi. Mais une date d'envoi peut seulement appartenir à une heure de synchronisation.

<p align="center">
  <img :src="$withBase('/images/ea_order_sync_times.png')">
</p>
:::

### Quand une commande est-elle transmissible ?

Une commande est considérée transmissible lorsqu'elle :
- ne nécessite pas de validation préalable par le magasin
- a le tag 'ensapp_ready' sur Shopify, si elle nécessite une validation préalable
- à un statut financier (`financial_status`) considéré comme tranmissible par le magasin : ex. "payée" (`paid`), "en attente de paiement" (`pending`)...
- n'a pas déjà été transmise à Magistor
- contient des articles transmissibles à Ensovo, c'est-à-dire :
  - ayant une quantité à traiter positive
  - étant liés à un vendeur géré par Ensovo
  - étant liés à un produit qui existe et qui n'a pas le tag 'exclure_ensovo'.

## Expédition / Traitement des commandes depuis Magistor vers Shopify

Lorsqu'une commande est expédiée/traitée par Ensovo, un fichier de traitement est automatiquement déposé par Magistor sur le serveur SFTP du magasin concerné.

Ce fichier peut être soit un CRE soit un CRP (avec une ligne par produit dans la commande).

### CRE 

Au niveau d'Ensapp :
- pour chaque article, sa quantité traitée (`fulfilled_quantity`) devient égale à sa quantité initiale (`quantity`)
- tous les articles de la commande sont considérés comme "traités" (`fulfillment_status = 'fulfilled'`)
- les informations d'expédition sont mises à jour dans la méthode de livraison de la commande (`shipping_method`)
- la commande passe au statut "traitée" (`state = 'fulfilled'`)

Au niveau de Shopify :
- tous les articles de la commande sont considérés comme "traités"
- la commande est passée au statut "traitée" (`fulfilled`)
- les informations d'expédition (numéro de tracking et url de tracking) sont ajoutées à la commande
- la balise/tag "ensovo_fulfilled' est ajouté à la commande
### CRP

Au niveau d'Ensapp :
- pour chaque article, sa quantité traitée (`fulfilled_quantity`) devient égale à la quantité traitée par Ensovo
- tous les articles de la commande sont considérés comme "traités" (`fulfillment_status = 'fulfilled'`) même si aucune quantité n'a été expédiée
- les informations d'expédition sont mises à jour dans la méthode de livraison de la commande (`shipping_method`)
- la commande change de statut :
  - "partiellement traitée" (`state = 'partially_fulfilled'`) s'il reste des articles non traitées (`unfulfilled_items`)
  - "traitée" (`state = 'fulfilled'`) s'il n'y a plus d'articles non traités.
- le client reçoit un email avec la liste des articles non traités (`unfulfilled`)

Au niveau de Shopify :
- tous les articles de la commande sont considérés comme "traités"
- la commande est passée au statut "traitée" (`fulfilled`)
- les informations d'expédition (numéro de tracking et url de tracking) sont ajoutées à la commande
- la balise/tag "ensovo_fulfilled' est ajouté à la commande

::: warning Attention
  Si le fichier CRP ou CRE est incomplet (numéro de commande ou l'url de tracking manquants), la commande ne pourra pas être traitée par Ensapp.
  
  Un email d'erreur sera transmis aux destinataires support du magasin pour signaler l'anomalie. 
  
  Le CRP ou CRE corrigé devra ensuite être redéposé sur le serveur SFTP avec une copie vide de ce fichier ayant l'extension `.bal` (ex: 'CRP...0001.dat' + 'CRP...0001.bal').
:::