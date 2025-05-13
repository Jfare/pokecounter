interface PokemonListItem {
  id: number;
  name: string;
}

export class PokemonSearch {
  static filterPokemons(
    pokemons: PokemonListItem[],
    searchText: string
  ): PokemonListItem[] {
    if (!searchText) {
      return pokemons;
    }
    const lowercasedSearchText = searchText.toLowerCase();

    return pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(lowercasedSearchText)
    );
  }
}
