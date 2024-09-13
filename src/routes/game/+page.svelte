<script lang="ts">
    import { onMount } from 'svelte';
    import type { GameData } from '$lib/gamedata';

    let g : GameData = {
      player1Hand: [],
      player2Hand: [],
      commonCards: [],
      role: undefined
    }
  
    onMount(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = urlParams.get('hash');

      if (hash) {
      const gameDataString = localStorage.getItem(`game-${hash}`);

      if (gameDataString) {
        try {
          const gameData = JSON.parse(gameDataString);
          g.player1Hand = gameData.player1Hand;
          g.player2Hand = gameData.player2Hand;
          g.commonCards = gameData.commonCards;
          g.role = gameData.role;
        } catch (error) {
          console.error("Error parsing game data:", error);
        }
      } else {
        console.error("Game data not found for hash:", hash);
      }
    } else {
      console.error("Hash not provided in URL");
    }
    });
  </script>
  
  {#if g.player1Hand.length && g.player2Hand.length && g.commonCards.length}
    {#if g.role == 'player1'}
        <h2>Your hand: {g.player1Hand.join(', ')}</h2>
        <h2>Opponents hand: {g.player2Hand.join(', ')}</h2>
        <h2>Common cards: {g.commonCards.join(', ')}</h2>
    {:else if g.role == 'player2'}
        <h2>Your hand: {g.player2Hand.join(', ')}</h2>
        <h2>Challengers hand: {g.player1Hand.join(', ')}</h2>
        <h2>Common cards: {g.commonCards.join(', ')}</h2>
    {:else}
        <h1>No role!</h1>
    {/if}
  {/if}