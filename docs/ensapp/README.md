# Contexte
## Elodie 

L'application ENSAPP a pour but de **connecter des boutiques Shopify et Magistor** (WMS d'Ensovo).

Elle permet entre autres de :
- transmettre à Magistor les nouvelles commandes Shopify à expédier
- communiquer à Shopify les informations d'expédition et les quantités expédiées par Magistor
- transmettre à Magistor l'inventaire des produits en vente sur Shopify
- mettre à jour les stocks de produits dans Shopify à partir des stocks réels dans Magistor.

Les flux d'informations transitent entre les deux interfaces via Ensapp et le dépôt de fichiers dans un serveur SFTP dédié à chaque magasin.

![](/images/summary_schema.png)

Quotidiennement et plusieurs fois par jour, de nombreux process (aussi appelés 'jobs') fonctionnent de manière synchrone et asynchrone pour réaliser toutes ces tâches.

