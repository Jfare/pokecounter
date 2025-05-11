import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../utils/supabase";

// Beräkning av kortens storlek.
const { width } = Dimensions.get("window");
const cardWidth = width / 3 - 10;

interface PokemonCardProps {
  pokemonId: number;
  pokemonName: string;
}

interface DbPokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: any;
  abilities: any;
  stats: any;
  sprite_default: string | null;
  sprite_official: string | null;
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemonId,
  pokemonName,
}) => {
  const router = useRouter();
  const [details, setDetails] = useState<DbPokemonDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hämta detaljer för den specifika Pokemon från Supabase när komponenten laddas eller ID ändras
  useEffect(() => {
    const fetchDetailsFromDb = async () => {
      setLoadingDetails(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("pokemons")
          .select("*")
          .eq("id", pokemonId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("No Pokemons where found in the database.");

        setDetails(data);
      } catch (err: any) {
        console.error(
          `Kunde inte hämta detaljer för ID ${pokemonId} från DB:`,
          err
        );
        setError("Could not load Pokemon details.");
      } finally {
        setLoadingDetails(false);
      }
    };

    if (pokemonId) {
      fetchDetailsFromDb();
    }
  }, [pokemonId]);

  // Hantera klick på kortet
  const handlePress = () => {
    router.push(`/pokemon/${pokemonId}`);
  };

  if (loadingDetails) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, styles.errorCard]}>
        <Text style={styles.errorText}>Fel</Text>
      </View>
    );
  }

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      {details?.sprite_official ? (
        <Image
          style={styles.image}
          source={{ uri: details.sprite_official }}
          resizeMode="contain"
        />
      ) : details?.sprite_default ? (
        <Image
          style={styles.image}
          source={{ uri: details.sprite_default }}
          resizeMode="contain"
        />
      ) : (
        // Visa en placeholder om ingen bild finns
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>Ingen bild</Text>
        </View>
      )}

      {/* Pokemon-nummer */}
      {details?.id && <Text style={styles.number}>#{details.id}</Text>}
      {/* Pokemon-namn - Använd namnet från details om det finns, annars från prop */}
      <Text style={styles.name}>{details?.name || pokemonName}</Text>
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
    minHeight: cardWidth + 40,
    justifyContent: "space-between",
  },
  loadingCard: {
    justifyContent: "center",
  },
  errorCard: {
    justifyContent: "center",
    backgroundColor: "#ffcccc",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    textAlign: "center",
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
