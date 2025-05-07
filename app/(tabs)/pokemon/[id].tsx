import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import PokemonDetails from "../../../components/PokemonDetails";

export default function PokemonDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const pokemonId = typeof id === "string" ? parseInt(id, 10) : undefined;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          gestureState.dx > 20 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2)
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 100) {
          router.back();
        }
      },
    })
  ).current;

  const handleBackPress = () => {
    router.back();
  };

  if (pokemonId === undefined || isNaN(pokemonId)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ogiltigt Pokemon ID.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>
      <PokemonDetails
        pokemonId={pokemonId}
        panHandlers={panResponder.panHandlers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 15,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 5,
  },
});
