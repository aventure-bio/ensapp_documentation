# API

## Stock inventory

Au moment du dépôt du fichier des stock par ensovo, nous comparons les stocks sur shopify, sur le fichier que ENSOVO nous dépose sur le serveur et les commandes en cours, pas encore traiter par ENSOVO pour ne pas avoir de variation dans les stocks. Nous avons eu besoin de faire une point API sur le HUB pour connaitre les commandes en cours des `D2C` installer depuis le `HUB`.

### Point d'API, requète

https://api.aventure-bio.com/private/v1/variants/unfulfilled_quantity?sku=#{sku}
Pour que ce point API renvoie une info il faut d'identifier avec une API_KEY et fournir un SKU en params.

### AWS

La vérification des clé API et la creéation de celle-ci se fait via AWS API Gateway.
 Voici le lien vers [AWS](https://eu-west-3.console.aws.amazon.com/apigateway/main/apis?region=eu-west-3#)

### Réponse

Le `HUB` reçoit une SKU en params il l'app va vérifier s'il appartient à un line_item et si oui il va faire la somme des `unfulfilled_quantity`. Si jamais l'application ne trouve rien il va renvoyer `0`.

```json
# exemple du json
{
  success: true,
  data: 0
}
```
Une erreur est renvoyé en réponse si jamais il n'y a pas de SKU en params.

```json
# exemple du json
{
  success: false,
  data: "You should send the 'sku' params"
}
```

### Condition pour que ce call soit déclanché

Ce call ce base sur deux informations pour se declancher.
- Est-ce que le shop qui fait la demande a bien le code `ABIO`.
- Est-ce que la base de donnée `ENSAPP` a un `SKU` qui renvoi vers qu'un variant.

Cette condition et lié à la gestion des stocks pour les `D2C`, __Stocky__.

Le shopify Aventure Bio descent l'info au D2C (shopify enfant) pour mettre à jour les stocks.
Pour un `D2C` hébergé dans `ENSAPP` nous avons obligatoirement 2 variants avec le même `SKU` (un variant shopify Aventure Bio et un variant shopify `D2C`). S'il ni à qu'un variant pour un `SKU` ça veut dire que l'autre et peut-être dans la base de donnée du `HUB` donc on procède au call API.

>Cette conditon est à double tranchant, elle est juste mais les produits classiques (hors `D2C`) ont qu'un variant par `SKU` donc il y a beaucoup de call qui renvoie automatiquement 0 par default.
Une amélioration : un nouveau champs sur le variant pour indiqué où il est hébergé, `HUB` ou`ENSAPP`.
