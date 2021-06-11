# Ensapp 📦

Cette application a été dévelopée comme connecteur entre Shopify et le WMS Magistor d'Ensovo
pour gérer les commandes et produits.

![](/images/summary_schema.png)

Tout les jours plusieurs tâches (dorénavant apellées 'jobs') tournent en asynchrone pour déposer
les commandes dans le serveur SFTP d'ENSOVO, pour mettre à jour les stocks des différents produits
dans shopify ou recevoir le fichier de traitement de commandes par ENSOVO.
