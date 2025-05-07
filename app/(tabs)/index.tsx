import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import PokemonCard from "../../components/PokemonCard";

interface Pokemon {
  name: string;
  url: string;
}

export default function Page() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

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
    <PokemonCard pokemon={item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
          numColumns={3}
          columnWrapperStyle={styles.row}
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
    paddingHorizontal: 5,
    paddingBottom: 20,
    paddingTop: 10,
  },
  row: {
    flex: 1,
    justifyContent: "space-around",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
