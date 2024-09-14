<script lang="ts">
    import { onMount } from 'svelte';
    import type { GameData } from '$lib/gamedata';
    import { compareHands, createHand } from '$lib/poker';
    import type { Hand } from '$lib/poker'

    let g : GameData = {
      player1Hand: [],
      player2Hand: [],
      commonCards: [],
      role: undefined
    }

    let resultString = "";
    let yourHand = "";
    let opponentHand = "";

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
          
          if (g.role == "player1") {
            const playerHand = createHand(g.player1Hand, g.commonCards);
            yourHand = playerHand.type.toString();
            const player2Hand = createHand(g.player2Hand, g.commonCards);
            opponentHand = player2Hand.type.toString();
            resultString = compareHands(playerHand, player2Hand).toString();
          } else if (g.role == "player2") {
            const playerHand = createHand(g.player2Hand, g.commonCards);
            yourHand = playerHand.type.toString();
            const player2Hand = createHand(g.player1Hand, g.commonCards);
            opponentHand = player2Hand.type.toString();
            resultString = compareHands(playerHand, player2Hand).toString();
          } else {
            console.error("The message does not contain role!");
          }
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
        <h2> Your hand type: {yourHand}</h2>
        <h2>Opponents hand: {g.player2Hand.join(', ')}</h2>
        <h2> Your opponent hand type: {opponentHand}</h2>
        <h2>Common cards: {g.commonCards.join(', ')}</h2>
    {:else if g.role == 'player2'}
        <h2>Your hand: {g.player2Hand.join(', ')}</h2>
        <h2>Your hand type: {yourHand}</h2>
        <h2>Challengers hand: {g.player1Hand.join(', ')}</h2>
        <h2> Your challengers hand type: {opponentHand}</h2>
        <h2>Common cards: {g.commonCards.join(', ')}</h2>
    {:else}
        <h1>No role!</h1>
    {/if}
        <h2>Result: {resultString}</h2>
  {/if}