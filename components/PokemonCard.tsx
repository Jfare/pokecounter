import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = width / 3 - 10;

interface PokemonCardProps {
  pokemon: {
    name: string;
    url: string;
  };
}

interface PokemonDetails {
  id: number;
  sprites: {
    front_default: string;
  };
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
  const router = useRouter();

  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(pokemon.url);
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error(`Kunde inte hämta detaljer för ${pokemon.name}:`, error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [pokemon.name, pokemon.url]);

  const handlePress = () => {
    if (details) {
      router.push(`/pokemon/${details.id}`);
    }
  };

  if (loadingDetails || !details) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <Text>Laddar...</Text>
      </View>
    );
  }

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      {/* Pokemon-bild */}
      {details.sprites.front_default ? (
        <Image
          style={styles.image}
          source={{ uri: details.sprites.front_default }}
          resizeMode="contain"
        />
      ) : (
        // Visa en placeholder om ingen bild finns
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>Ingen bild</Text>
        </View>
      )}

      {/* Pokemon-nummer */}
      <Text style={styles.number}>#{details.id}</Text>
      {/* Pokemon-namn */}
      <Text style={styles.name}>{pokemon.name}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    margin: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  loadingCard: {
    justifyContent: "center",
  },
  image: {
    width: cardWidth - 20,
    height: cardWidth - 20,
    marginBottom: 5,
  },
  imagePlaceholder: {
    width: cardWidth - 20,
    height: cardWidth - 20,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    borderRadius: 4,
  },
  placeholderText: {
    fontSize: 12,
    color: "#666",
  },
  number: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "capitalize",
    textAlign: "center",
    flexShrink: 1,
  },
});

export default PokemonCard;
