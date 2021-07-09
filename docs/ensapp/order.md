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

La synchronisation des commandes s'effectue avec la tache `shopify_to_magistor:transmit_orders_to_magistor` qui peut être déclenchée de 2 manières :
- Toutes les 10 minutes;
- A des créneaux horaires précis.

### Toutes les 10 minutes

Si le magasin souhaite transmettre les commandes de manière continue et qu'il coche l'option _Envoyer automatiquement les commandes à Magistor_ (`automatically_send_orders_to_magistor`), les commandes seront transmises à Magistor toutes les 10 minutes si elles sont transmissibles.

### A des créneaux horaires précis

Si le magasin ne souhaite pas cocher l'option _Envoyer automatiquement les commandes à Magistor_, il a la possibilité de choisir *N* créneaux horaires (`order_sync_times`) différents pour le déclenchement de la synchronisation des commandes.

::: warning Attention
Un magasin ne peut pas cocher l'option _Envoyer automatiquement les commandes à Magistor_ **ET** par ailleurs choisir des créneaux horaires précis pour la synchronisation.
:::

En pratique, c'est la même tâche `shopify_to_magistor:transmit_orders_to_magistor` qui est déclenchée automatiquement toutes les 10 minutes mais, dans ce cas, elle vérifie en amont si :
- l'heure actuelle (au moment où tourne la tache) est postérieure au créneau horaire choisi pour le magasin 
- le déclenchement n'a pas encore été fait pour le créneau horaires en question.
Dans ce cas où ces deux conditions sont vraies, les commandes sont transmises à Magistor. Et ainsi de suite pour tous les créneaux horaires choisis.

Le magasin peut ajouter autant de créneaux horaires qu'il le souhaite.

::: details Infos complémentaires pour les développeurs 
Côté base de données, la relation entre la table `shops` et la table `order_sync_times` est une relation N:1. 
Un magasin peut avoir *N* heures de synchronisation mais une heure de synchronisation peut seulement appartenir à un magasin.

Pour savoir si la synchronisation a déjà eu lieu pour un créneau horaire choisi, on utilise une troisième table `order_sync_time_sent_dates` qui conserve la **date** de la synchronisation.
La relation entre la table `order_sync_times` et `order_sync_time_sent_dates` est de N:1. Une heure de synchronisation peut avoir *N* dates d'envoi. Mais une date d'envoi peut seulement appartenir à une heure de synchronisation.

<p align="center">
  <img :src="$withBase('/images/ea_order_sync_times.png')">
</p>
:::
