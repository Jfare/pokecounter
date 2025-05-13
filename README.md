# PokeCounter App!

Det här en app som man kan skriva en kommentar om en Pokemon..
Men det är egentligen ganska ointressant.

Appen hämtar information om de 151 första Pokemons som fanns med då Pokemon lanserades.

Informationen hämtas från https://pokeapi.co och lagras därefter i Supabase.
Appen använder därefter Supabase istället för Pokeapi för att hämta data om diverse Pokemons.

En sökfunktion har implenterats

Det går även att skriva kommentarer om diverse Pokemons i form av "encounters".
Även dessa lagras på Supabase.

Här nedanför kommer en lista med funktioner som appen använder:

## Databas

Istället för att använda telefonens egen lagring så har jag valt att implementera Supabase som databas.

Med mera tid så hade Supabase även gett mig möjligheten att även kunna implementera ett system med olika användare och inloggning.

Databasen har två syften i denna app.

### SynchronizePokemons

Jag har en funktion i index.tsx som heter synchronizePokemons.
Den kommer först att kontrollera om tabellen för Pokemons är tom eller innehåller färre än 151 Pokemons.
Om så är fallet, kommer den göra en fetch till pokeapi.co och hämta all information, för att sedan lagra infon i Supabase.

På de viset kan jag sedan göra förfrågningar till min egen databas istället för att förlita mig på en API som jag själv inte kan kontrollera.
Supabase visade sig dessutom vara betydligt snabbare än APIn, vilket gjorde att appen blev mera behaglig att använda.

Värt att notera för denna är att jag blev tvungen att installera och hantera ett antal beroenden som saknas i React Native.
Dessa hanteras via filen metro.config.js

### Encounters

Andra syftet är att lagra "encounters" som jag kallar det, man kan skriva kommentarer om en Pokemon.

Detta hanteras i PokemonDetails.tsx genom följande funktioner:

fetchEncounters
handleAddEncounterPress
handleSaveEncounter
setEncounter
handleCancelEncounter

samt tillhörande "states"
