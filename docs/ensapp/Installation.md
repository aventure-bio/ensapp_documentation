# Installation
1 - Se rendre sur https://shopify-magistor-connector.herokuapp.com/

2 - Rentrer l'URL de son magasin Shopify et s'y connecter. Vous serez redirigés vers votre espace administrateur

3 - Editer votre magasin dans l'app pour ajouter toutes les informations demandées (code entreprise, code du site, IP du serveur, nom d'utilisateur pour le serveur, mot de passe pour le serveur, heures de synchronisation des produits et des commandes, email de support, email de support secondaire). Ajouter des méthodes de livraison pour chacune des méthodes de livraison de Shopify. Le nom doit être le même que la dénomination sur Shopify et le code est généré par Magistor.

## User Stories
Les envois des commandes et des produits de Shopify vers Magistor peuvent aussi être déclenchés manuellement par des boutons dans l'interface.

### Envoi des produits de Shopify vers Magistor
Tous les jours à l'heure de synchronisation des produits, un fichier avec tous les produits Shopify du magasin est envoyé sur le serveur SFTP lié au magasin. En cas de produits "incomplets" sur Shopify (pas de codebarre ou de titre), ils ne sont pas intégrés au fichier et un email est envoyé à l'email de support lié au magasin avec des informations plus précises

### Envoi des commandes de Shopify vers Magistor
4 fois par jour (au maximum) aux heures de synchronisation des commandes, un fichier avec les commandes et line_items du jour précédent est envoyé sur le serveur SFTP lié au magasin. En cas de commandes "incomplètes" sur Shopify (pas de numéro de commande, de code de méthode de livraison, d'adresse de livraison complète, de quantité), elles ne sont pas intégrées au fichier et un email est envoyé à l'email de support lié au magasin avec des informations plus précises. Les méthodes de livraison possibles doivent préalablement être configurées dans l'application Ensapp.

### Envoi des commandes traitées de Magistor à Shopify
Dès qu'un fichier de commandes traitées apparait sur le serveur SFTP lié au shop, il est traité par l'app. 2 cas sont possibles:
- Le fichier est un CRE: dans ce cas, chaque commande est passée à "Traitée" dans Shopify et le numéro de tracking est mis à jour
- Le fichier est un CRP (avec un ligne par produit dans la commande), les produits traités sont notés comme "Traités" dans Shopify. Si certains produits de la commande ne sont pas traités, le client est prévenu par email Dans tous les cas, en cas de commandes "incomplètes" dans le fichier sur le serveur SFTP (pas de numéro de commande ou de lien de tracking), elles ne sont pas traitées et un email est envoyé à l'email de support lié au magasin avec des informations plus précises

### Mise à jour du stock des produits dans Shopify
Dès qu'une image de stock apparait sur le serveur SFTP lié au shop, elle est traitée par l'app Le stock supposé est calculé (stock réel indiqué sur le fichier - stock en instance de sorties dans les commandes encore non traitées) et, s'il est différent du stock indiqué sur Shopify, ce dernier est mis à jour En cas de produits "incomplets" dans le fichier sur le serveur SFTP (pas d'identifiant ou de quantité), leur stock n'est pas mis à jour et un email est envoyé à l'email de support lié au magasin avec des informations plus précises
