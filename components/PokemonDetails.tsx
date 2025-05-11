import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../utils/supabase";

interface PokemonDetailsProps {
  pokemonId: number;
  panHandlers?: any;
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

interface Encounter {
  id: string;
  created_at: string;
  description: string;
  pokemon_id: number;
  location?: string;
  latitude?: number;
  longitude?: number;
}

interface NewEncounter {
  pokemon_id: number;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

const PokemonDetails: React.FC<PokemonDetailsProps> = ({
  pokemonId,
  panHandlers,
}) => {
  const [details, setDetails] = useState<DbPokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddingEncounter, setIsAddingEncounter] = useState(false);
  const [encounterDescription, setEncounterDescription] = useState("");
  const [isSavingEncounter, setIsSavingEncounter] = useState(false);

  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loadingEncounters, setLoadingEncounters] = useState(true);

  useEffect(() => {
    const fetchFullDetailsFromDb = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("pokemons")
          .select("*")
          .eq("id", pokemonId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Ingen Pokemon hittades i databasen.");

        setDetails(data as DbPokemonDetails);
      } catch (err: any) {
        console.error(
          `Kunde inte hämta fullständiga detaljer för ID ${pokemonId} från DB:`,
          err
        );
        setError("Kunde inte ladda Pokemon-detaljer.");
      } finally {
        setLoading(false);
      }
    };

    if (pokemonId) {
      fetchFullDetailsFromDb();
    }
  }, [pokemonId]);

  useEffect(() => {
    const fetchEncounters = async () => {
      setLoadingEncounters(true);
      try {
        const { data, error } = await supabase
          .from("encounters")
          .select("*")
          .eq("pokemon_id", pokemonId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setEncounters(data as Encounter[]);
      } catch (err: any) {
        console.error(
          `Kunde inte hämta encounters för Pokemon ID ${pokemonId}:`,
          err
        );
      } finally {
        setLoadingEncounters(false);
      }
    };

    if (pokemonId) {
      fetchEncounters();
    }
  }, [pokemonId]);

  const handleAddEncounterPress = () => {
    setIsAddingEncounter(true);
  };

  const handleSaveEncounter = async () => {
    if (!encounterDescription.trim()) {
      Alert.alert(
        "Tom beskrivning",
        "Vänligen skriv en beskrivning för encountern."
      );
      return;
    }
    if (!details) {
      Alert.alert(
        "Fel",
        "Kunde inte spara encounter, Pokemon-detaljer saknas."
      );
      return;
    }

    setIsSavingEncounter(true);
    try {
      const newEncounter: NewEncounter = {
        pokemon_id: details.id,
        description: encounterDescription.trim(),
        location: "Mariehamn",
        latitude: 60.1,
        longitude: 19.9333,
      };

      const { data: savedEncounter, error: insertError } = await supabase
        .from("encounters")
        .insert([newEncounter])
        .select("*")
        .single();

      if (insertError) throw insertError;
      if (!savedEncounter)
        throw new Error("Kunde inte hämta sparad encounter.");

      Alert.alert("Encounter sparad", "Din encounter har sparats!");
      setEncounterDescription("");
      setIsAddingEncounter(false);

      setEncounters((prevEncounters) => [
        savedEncounter as Encounter,
        ...prevEncounters,
      ]);
    } catch (err: any) {
      console.error("Kunde inte spara encounter:", err);
      Alert.alert(
        "Sparningsfel",
        `Kunde inte spara encountern: ${err.message}`
      );
    } finally {
      setIsSavingEncounter(false);
    }
  };

  const handleCancelEncounter = () => {
    setEncounterDescription("");
    setIsAddingEncounter(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF7043" />
        <Text style={styles.loadingText}>
          Laddar detaljer från databasen...
        </Text>
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
    // Får inte denna att funka, och jag begriper int varför.
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollViewContainer} {...panHandlers}>
        <Text style={styles.name}>{details.name}</Text>
        <Text style={styles.number}>#{details.id}</Text>

        {details.sprite_official ? (
          <Image
            style={styles.image}
            source={{ uri: details.sprite_official }}
            resizeMode="contain"
          />
        ) : details.sprite_default ? (
          <Image
            style={styles.image}
            source={{ uri: details.sprite_default }}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Ingen bild tillgänglig</Text>
          </View>
        )}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Typer:</Text>
          {details.types &&
            Array.isArray(details.types) &&
            details.types.map((typeInfo: any, index: number) => (
              <Text key={index} style={styles.detailText}>
                {typeInfo.type.name}
              </Text>
            ))}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Förmågor:</Text>
          {details.abilities &&
            Array.isArray(details.abilities) &&
            details.abilities.map((abilityInfo: any, index: number) => (
              <Text key={index} style={styles.detailText}>
                {abilityInfo.ability.name}
              </Text>
            ))}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Stats:</Text>
          {details.stats &&
            Array.isArray(details.stats) &&
            details.stats.map((statInfo: any, index: number) => (
              <Text key={index} style={styles.detailText}>
                {statInfo.stat.name}: {statInfo.base_stat}
              </Text>
            ))}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Höjd:</Text>
          <Text style={styles.detailText}>
            {details.height ? details.height / 10 : "N/A"} m
          </Text>{" "}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Vikt:</Text>
          <Text style={styles.detailText}>
            {details.weight ? details.weight / 10 : "N/A"} kg
          </Text>{" "}
        </View>

        {!isAddingEncounter && !isSavingEncounter && (
          <Pressable
            style={styles.addEncounterButton}
            onPress={handleAddEncounterPress}
          >
            <Text style={styles.addEncounterButtonText}>
              Lägg till Encounter
            </Text>
          </Pressable>
        )}

        {isAddingEncounter && (
          <View style={styles.addEncounterContainer}>
            <TextInput
              style={styles.encounterTextInput}
              placeholder="Beskriv din encounter..."
              multiline={true}
              value={encounterDescription}
              onChangeText={setEncounterDescription}
              editable={!isSavingEncounter}
            />
            <View style={styles.encounterButtons}>
              <Pressable
                style={[styles.encounterButton, styles.saveButton]}
                onPress={handleSaveEncounter}
                disabled={isSavingEncounter}
              >
                {isSavingEncounter ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.encounterButtonText}>Spara</Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.encounterButton, styles.cancelButton]}
                onPress={handleCancelEncounter}
                disabled={isSavingEncounter}
              >
                <Text style={styles.encounterButtonText}>Avbryt</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.encounterListSection}>
          <Text style={styles.sectionTitle}>Encounters:</Text>
          {loadingEncounters ? (
            <ActivityIndicator size="small" color="#666" />
          ) : encounters.length === 0 ? (
            <Text style={styles.noEncountersText}>
              Inga encounters sparade ännu.
            </Text>
          ) : (
            encounters.map((encounter) => (
              <View key={encounter.id} style={styles.encounterItem}>
                <Text style={styles.encounterDate}>
                  {new Date(encounter.created_at).toLocaleDateString()}{" "}
                </Text>
                {encounter.location && (
                  <Text style={styles.encounterLocation}>
                    Plats: {encounter.location}
                  </Text>
                )}
                <Text style={styles.encounterDescription}>
                  {encounter.description}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollViewContainer: {
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
  addEncounterButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  addEncounterButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  addEncounterContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  encounterTextInput: {
    minHeight: 80,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    textAlignVertical: "top",
  },
  encounterButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  encounterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  encounterButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  encounterListSection: {
    marginTop: 20,
  },
  noEncountersText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  encounterItem: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  encounterDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    fontStyle: "italic",
  },
  encounterLocation: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  encounterDescription: {
    fontSize: 16,
    color: "#333",
  },
});

export default PokemonDetails;
