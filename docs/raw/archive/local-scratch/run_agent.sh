#!/bin/bash

echo "🚀 [1/3] Gestione rami Git..."
git checkout development

# Controlla se il branch esiste già, altrimenti lo crea
if git show-ref --verify --quiet refs/heads/fix/YATF-103; then
    echo "Il branch esiste già, faccio il semplice checkout..."
    git checkout fix/YATF-103
else
    echo "Creo il nuovo branch fix/YATF-103..."
    git checkout -b fix/YATF-103
fi

echo "📝 [2/3] Preparazione della Issue per Pi..."

# Scriviamo la descrizione della issue in una variabile multilinea
read -r -d '' GITHUB_ISSUE << 'EOF'
In the /projections page we have inflation calculation and also taxes estimations.
These values are calculated on some % values, that are fixed at the moment.
I would like to have a settings where user can decide the values of taxes for the country he lived and the inflation value.
EOF

echo "🤖 [3/3] Lancio di Pi Coding Agent con Ornith:9b..."
echo "L'agente analizzerà la pagina /projections, implementerà lo stato/settings e verificherà la build."

# Abbiamo rimosso il -y alla fine e aggiunto l'istruzione di autonomia nel prompt
pi "TASK:
$GITHUB_ISSUE

ISTRUZIONI OPERATIVE:
Svolgi l'intero task in autonomia. Non fermarti a chiedere conferme all'utente, procedi applicando le modifiche necessarie direttamente sui file.

ISTRUZIONI DI VALIDAZIONE DI FINE TASK:
Una volta modificate le pagine e i componenti React/TS necessari per sbloccare i parametri di inflazione e tasse:
1. Esegui 'npm run lint' nel terminale.
2. Esegui 'npx tsc --noEmit' per verificare che TypeScript sia felice e non ci siano any impliciti o tipi rotti.
Se uno di questi controlli fallisce, correggi i file finché non è tutto verde."

echo "✅ Task completato! Pi ha finito il suo ciclo."