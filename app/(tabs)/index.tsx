import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Pokemon {
  name: string;
  url: string;
}

export default function Page() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // Funktion för att hämta Pokemons från API:t
  const fetchPokemons = async () => {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon/?limit=151"
      );
      const data = await response.json();
      setPokemons(data.results);
    } catch (error) {
      console.error("Kunde inte hämta Pokemons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemons();
  }, []);

  const renderPokemonItem = ({ item }: { item: Pokemon }) => (
    <View style={styles.pokemonItem}>
      <Text style={styles.pokemonName}>{item.name}</Text>
    </View>
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
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF7043"
          style={styles.loadingIndicator}
        />
      ) : (
        <FlatList
          data={pokemons}
          renderItem={renderPokemonItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 10,
  },
  pokemonItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pokemonName: {
    fontSize: 18,
    color: "#333",
    textTransform: "capitalize",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
