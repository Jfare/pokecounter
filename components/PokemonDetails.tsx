import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface PokemonDetailsProps {
  pokemonId: number;
  panHandlers?: any;
}

interface FullPokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  stats: { stat: { name: string }; base_stat: number }[];
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}

const PokemonDetails: React.FC<PokemonDetailsProps> = ({
  pokemonId,
  panHandlers,
}) => {
  const [details, setDetails] = useState<FullPokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFullDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDetails(data);
      } catch (err: any) {
        console.error(
          `Kunde inte hämta fullständiga detaljer för ID ${pokemonId}:`,
          err
        );
        setError("Kunde inte ladda Pokemon-detaljer.");
      } finally {
        setLoading(false);
      }
    };

    if (pokemonId) {
      fetchFullDetails();
    }
  }, [pokemonId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF7043" />
        <Text style={styles.loadingText}>Laddar detaljer...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Inga detaljer hittades.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} {...panHandlers}>
      <Text style={styles.name}>{details.name}</Text>
      <Text style={styles.number}>#{details.id}</Text>

      {details.sprites.other["official-artwork"].front_default ? (
        <Image
          style={styles.image}
          source={{
            uri: details.sprites.other["official-artwork"].front_default,
          }}
          resizeMode="contain"
        />
      ) : details.sprites.front_default ? (
        <Image
          style={styles.image}
          source={{ uri: details.sprites.front_default }}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>Ingen bild tillgänglig</Text>
        </View>
      )}

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Typer:</Text>
        {details.types.map((typeInfo, index) => (
          <Text key={index} style={styles.detailText}>
            {typeInfo.type.name}
          </Text>
        ))}
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Förmågor:</Text>
        {details.abilities.map((abilityInfo, index) => (
          <Text key={index} style={styles.detailText}>
            {abilityInfo.ability.name}
          </Text>
        ))}
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Stats:</Text>
        {details.stats.map((statInfo, index) => (
          <Text key={index} style={styles.detailText}>
            {statInfo.stat.name}: {statInfo.base_stat}
          </Text>
        ))}
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Höjd:</Text>
        <Text style={styles.detailText}>{details.height / 10} m</Text>{" "}
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Vikt:</Text>
        <Text style={styles.detailText}>{details.weight / 10} kg</Text>{" "}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "capitalize",
    marginBottom: 5,
  },
  number: {
    fontSize: 20,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    textTransform: "capitalize",
    marginBottom: 3,
  },
});

export default PokemonDetails;
