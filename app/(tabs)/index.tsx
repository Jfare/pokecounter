import { PokemonSearch } from "@/utils/PokemonSearch";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import PokemonCard from "../../components/PokemonCard";
import { supabase } from "../../utils/supabase";

interface PokemonListItem {
  id: number;
  name: string;
}

export default function Page() {
  //Set states.
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Funktion för att synkronisera Pokemons med Supabase
  const synchronizePokemons = async () => {
    setSyncing(true);
    setError(null);
    try {
      // Kontrollera Supabase-tabellen.
      const { count, error: countError } = await supabase
        .from("pokemons")
        .select("*", { count: "exact", head: true });

      if (countError) {
        // Vid fel, dvs tabellen är tom. Fortsätt
        console.error(
          "Error fetching pokemon count from Supabase:",
          countError
        );
      }

      const pokemonCountInDb = count ?? 0;

      // Om tabellen är tom eller har färre än 151 Pokemons, hämta från API och infoga/uppdatera
      // Går säkert att göra snyggare än att ha en massa if-satser...
      // Denna funktion skulle antagligen behöva brytas ut till en egen klass, men jag hinner inte med det nu.
      if (pokemonCountInDb === 0 || pokemonCountInDb < 151) {
        console.log(
          "Supabase pokemons table is empty or incomplete. Fetching from API..."
        );
        // Hämta de första 151 från PokeAPI
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon/?limit=151"
        );
        if (!response.ok) throw new Error("Could not fetch list from PokeAPI");
        const apiData = await response.json();
        const apiPokemons = apiData.results;

        // Hämta detaljerad info för varje Pokemon för att få ID, sprites, typer, etc.
        const detailedPokemons = await Promise.all(
          apiPokemons.map(async (p: { name: string; url: string }) => {
            const detailRes = await fetch(p.url);
            if (!detailRes.ok)
              throw new Error(`Could not fetch details for ${p.name}`);
            return detailRes.json();
          })
        );

        // Förbered data för infogning/uppdatering i Supabase
        const insertData = detailedPokemons.map((p) => ({
          id: p.id,
          name: p.name,
          height: p.height,
          weight: p.weight,
          types: p.types,
          abilities: p.abilities,
          stats: p.stats,
          sprite_default: p.sprites.front_default,
          sprite_official:
            p.sprites.other?.["official-artwork"]?.front_default || null,
        }));

        // Infoga eller uppdatera (upsert) data i Supabase.
        // onConflict: 'id' säger åt Supabase att om en rad med samma 'id' redan finns, uppdatera den istället för att kasta ett fel.
        const { error: upsertError } = await supabase
          .from("pokemons")
          .upsert(insertData, { onConflict: "id" });

        if (upsertError) throw upsertError;
        console.log("Supabase pokemons table synchronized.");
      } else {
        console.log("Supabase pokemons table already populated.");
      }

      const { data: dbPokemons, error: fetchError } = await supabase
        .from("pokemons")
        .select("id, name")
        .order("id", { ascending: true });

      if (fetchError) throw fetchError;

      setPokemons(dbPokemons as PokemonListItem[]); // Uppdatera state med data från DB
    } catch (err: any) {
      console.error("Synchronization or Fetching error:", err);
      setError("Could not load Pokemons. Please try again later.");
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  // Använd useEffect för att köra synkroniseringen när komponenten mountas
  useEffect(() => {
    synchronizePokemons();
  }, []); // Den tomma beroende-arrayen [] gör att effekten bara körs en gång vid mount

  // Använd useMemo för att filtrera Pokemons baserat på söktexten
  const filteredPokemons = useMemo(() => {
    return PokemonSearch.filterPokemons(pokemons, searchText);
  }, [pokemons, searchText]); // Filtrera om 'pokemons' listan eller 'searchText' ändras

  const renderPokemonItem = ({ item }: { item: PokemonListItem }) => (
    <PokemonCard pokemonId={item.id} pokemonName={item.name} />
  );

  return (
    <View style={styles.container}>
      {/* Header-vy */}
      <View style={styles.header}>
        {/* Titel */}
        <Text style={styles.headerTitle}>PokeCounter</Text>
        {/* Sökruta */}
        <TextInput
          style={styles.searchBar}
          placeholder="Sök Pokemon..."
          placeholderTextColor="#fff"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Huvudinnehåll */}
      {/* Visa laddnings/synkroniseringsindikator eller felmeddelande */}
      {loading || syncing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7043" />
          <Text style={styles.loadingText}>
            {syncing ? "Synkroniserar Pokemons..." : "Laddar Pokemons..."}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        // Visa listan med Pokemons om inte laddar/synkroniserar och inga fel
        <FlatList
          data={filteredPokemons}
          renderItem={renderPokemonItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>
                Inga Pokemons matchade din sökning.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    backgroundColor: "#FF7043",
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  searchBar: {
    width: "90%",
    height: 40,
    backgroundColor: "#E65100",
    borderRadius: 20,
    paddingHorizontal: 15,
    color: "#fff",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 5,
    paddingBottom: 20,
    paddingTop: 10,
  },
  row: {
    flex: 1,
    justifyContent: "space-around",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
});
