const { createApp } = Vue;

createApp({
  data() {
    return {
      search: "",                 // Suchbegriff
      selectedType: "",           // Ausgewählter Pokémon-Typ
      sortOrder: "asc",           // Sortierrichtung (asc oder desc)
      allPokemon: [],             // Alle geladenen Pokémon
      availableTypes: [],         // Alle verfügbaren Typen (für Dropdown)
      selectedPokemon: null,      // Pokémon für Detail-Modal
      offset: 0,                  // Start-Index für nächste Pokémon-Ladung
      limit: 25                   // Wie viele Pokémon pro Ladung
    };
  },

  computed: {
    filteredPokemon() {
      // Filtert nach Name und Typ
      let result = this.allPokemon.filter(p => {
        const nameMatches = p.name.toLowerCase().includes(this.search.toLowerCase());
const typeMatches = this.selectedType === "" || 
  p.types.map(t => t.toLowerCase()).includes(this.selectedType.toLowerCase());
        return nameMatches && typeMatches;
      });

      // Sortiert A-Z oder Z-A
      return result.sort((a, b) =>
        this.sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    }
  },

  mounted() {
    // Beim Laden der Seite: erste Pokémon laden
    this.loadMorePokemon();
  },

  methods: {
async loadMorePokemon() {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${this.offset}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    this.offset += this.limit;

    for (const pokemon of data.results) {
      const res = await fetch(pokemon.url);
      const fullData = await res.json();
const types = fullData.types.map(t => t.type.name.toLowerCase());
      const attackStat = fullData.stats.find(s => s.stat.name === "attack")?.base_stat || 0;

      types.forEach(t => {
  if (!this.availableTypes.includes(t.toLowerCase())) {
    this.availableTypes.push(t.toLowerCase());
  }
});

      this.allPokemon.push({
        name: fullData.name,
        image: fullData.sprites.other['official-artwork'].front_default || '',
        types: types,
        attack: attackStat,
        fullData: fullData,
        animate: true // ⚡ Neue Eigenschaft zur Animation
      });
    }

    this.availableTypes.sort();
  } catch (error) {
    console.error("Fehler beim Laden der Pokémon:", error);
  }
}
,

    // Öffnet Modal mit Detailinfos zum Pokémon
    showDetails(pokemon) {
      this.selectedPokemon = pokemon.fullData;
    }
  }
}).mount("#app");