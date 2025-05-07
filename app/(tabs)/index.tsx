import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import PokemonCard from "../../components/PokemonCard"; // Importera PokemonCard-komponenten

// Definiera en enkel typ för Pokemon-objekten vi förväntar oss från API:t
interface Pokemon {
  name: string;
  url: string;
}

export default function Page() {
  // State för att lagra listan med Pokemons
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  // State för att indikera om vi laddar data
  const [loading, setLoading] = useState(true);
  // State för söktext (inte implementerad funktionalitet än)
  const [searchText, setSearchText] = useState("");

  // Funktion för att hämta Pokemons från API:t
  const fetchPokemons = async () => {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon/?limit=151"
      );
      const data = await response.json();
      setPokemons(data.results); // Sätt listan med Pokemons
    } catch (error) {
      console.error("Kunde inte hämta Pokemons:", error);
      // Här kan man lägga till visuell feedback till användaren om ett fel inträffar
    } finally {
      setLoading(false); // Avsluta laddningsindikatorn oavsett resultat
    }
  };

  // Använd useEffect för att hämta Pokemons när komponenten laddas
  useEffect(() => {
    fetchPokemons();
  }, []); // Den tomma arrayen [] gör att effekten bara körs en gång vid mount

  // Funktion för att rendera varje enskild Pokemon i listan med PokemonCard-komponenten
  const renderPokemonItem = ({ item }: { item: Pokemon }) => (
    <PokemonCard pokemon={item} /> // Använd PokemonCard och skicka Pokemon-objektet som prop
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
          onChangeText={setSearchText} // Uppdatera searchText state när texten ändras
        />
      </View>

      {/* Huvudinnehåll */}
      {loading ? (
        // Visa laddningsindikator om loading är true
        <ActivityIndicator
          size="large"
          color="#FF7043"
          style={styles.loadingIndicator}
        />
      ) : (
        // Visa listan med Pokemons om loading är false
        <FlatList
          data={pokemons} // Datakällan för listan
          renderItem={renderPokemonItem} // Använd renderPokemonItem som renderar PokemonCard
          keyExtractor={(item) => item.name} // Unik nyckel för varje objekt
          numColumns={3}
          columnWrapperStyle={styles.row} // Stil för raderna i rutnätet
          contentContainerStyle={styles.listContent} // Stil för innehållet i listan
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
    paddingHorizontal: 5, // Justera padding för att matcha kortens marginal
    paddingBottom: 20,
    paddingTop: 10,
  },
  row: {
    flex: 1, // Gör att raden fyller tillgängligt utrymme
    justifyContent: "space-around", // Fördela utrymmet jämnt mellan kolumnerna
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Vi tar bort pokemonItem och pokemonName stilar härifrån då de nu hanteras i PokemonCard
});
