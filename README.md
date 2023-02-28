# Projet Borne vidéo pour Adidas
## Installation
Il faut d'abord installer electron

    npm install -g electron 

puis les dépendances (dans le dossier du projet)

    npm install

et enfin lancer le projet (toujours dans le dossier du projet)

    electron .
  
## Utilisation/ Choses à savoir

* Les vidéos sont stockées dans le dossier *video* en format webM. Le programme essayera de les convertir automatiquement en mp4,
mais je n'ai pas pu tester cette fonction sous mac.  
* Les métadonnées (commentaires) sont stockées dans un format human-readable dans le fichier *metas.json* 
* La prise de son ne fonctionne par sur l'ordinateur ou j'ai codé cela, je ne sais pas pourquoi car la piste son est bien présente
dans le fichier créé. Je planche donc sur ce bug.
