#!/usr/bin/env python3
"""
Rock Paper Scissors Game with Machine Learning
This script implements a Rock-Paper-Scissors game where the computer learns from player patterns.
"""

import random
import json
import os
from collections import defaultdict, Counter


class RPSLearner:
    """
    A machine learning model that learns patterns from Rock-Paper-Scissors games.
    """

    def __init__(self):
        self.history = []
        self.patterns = defaultdict(Counter)
        self.memory_file = 'rps_memory.json'
        self.load_memory()

    def load_memory(self):
        """Load learning memory from file"""
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, 'r') as f:
                    data = json.load(f)
                    self.patterns = defaultdict(Counter, {
                        tuple(k.split(',')): Counter(v) for k, v in data.get('patterns', {}).items()
                    })
                    self.history = data.get('history', [])
            except (json.JSONDecodeError, KeyError):
                print("Could not load memory file, starting fresh.")

    def save_memory(self):
        """Save learning memory to file"""
        data = {
            'patterns': {','.join(k): dict(v) for k, v in self.patterns.items()},
            'history': self.history[-1000:]  # Keep only last 1000 games
        }
        try:
            with open(self.memory_file, 'w') as f:
                json.dump(data, f)
        except IOError:
            print("Could not save memory file.")

    def get_prediction(self):
        """
        Predict the next move based on recent patterns.
        Returns the move that would beat the predicted player move.
        """
        if len(self.history) < 3:
            return random.choice(['rock', 'paper', 'scissors'])

        # Look at the last 3 moves as a pattern
        recent_pattern = tuple(self.history[-3:])

        if recent_pattern in self.patterns:
            next_moves = self.patterns[recent_pattern]
            if next_moves:
                # Predict the most likely next move
                predicted_move = next_moves.most_common(1)[0][0]
                # Return the move that beats the predicted move
                return self.get_counter_move(predicted_move)

        # Fallback to random if no pattern found
        return random.choice(['rock', 'paper', 'scissors'])

    def get_counter_move(self, move):
        """Get the move that beats the given move"""
        counters = {
            'rock': 'paper',      # Paper beats rock
            'paper': 'scissors',  # Scissors beats paper
            'scissors': 'rock'    # Rock beats scissors
        }
        return counters[move]

    def learn_from_game(self, player_move, computer_move, result):
        """Learn from the game result"""
        if len(self.history) >= 3:
            pattern = tuple(self.history[-3:])
            self.patterns[pattern][player_move] += 1

        self.history.append(player_move)

    def get_stats(self):
        """Get learning statistics"""
        total_games = len(self.history)
        pattern_count = len(self.patterns)

        return {
            'total_games': total_games,
            'patterns_learned': pattern_count,
            'memory_size': len(self.history)
        }


class RPSGame:
    """
    Rock Paper Scissors game interface
    """

    def __init__(self):
        self.learner = RPSLearner()
        self.moves = ['rock', 'paper', 'scissors']
        self.wins = 0
        self.losses = 0
        self.ties = 0

    def get_player_move(self):
        """Get player's move from input"""
        while True:
            move = input("Enter your move (rock/paper/scissors) or 'quit' to exit: ").lower().strip()

            if move == 'quit':
                return None
            elif move in self.moves:
                return move
            else:
                print("Invalid move. Please choose rock, paper, or scissors.")

    def determine_winner(self, player_move, computer_move):
        """Determine the winner of the game"""
        if player_move == computer_move:
            return 'tie'

        win_conditions = {
            'rock': 'scissors',     # Rock beats scissors
            'paper': 'rock',        # Paper beats rock
            'scissors': 'paper'     # Scissors beats paper
        }

        if win_conditions[player_move] == computer_move:
            return 'player'
        else:
            return 'computer'

    def play_game(self):
        """Play a single game"""
        print("\n" + "="*40)
        print("ROCK PAPER SCISSORS - MACHINE LEARNING EDITION")
        print("="*40)
        print("The computer learns from your patterns!")
        print("Enter 'quit' to exit and save learning data.\n")

        while True:
            # Get player's move
            player_move = self.get_player_move()
            if player_move is None:
                break

            # Get computer's move (with learning)
            computer_move = self.learner.get_prediction()

            print(f"\nYou chose: {player_move}")
            print(f"Computer chose: {computer_move}")

            # Determine winner
            result = self.determine_winner(player_move, computer_move)

            if result == 'player':
                print("🎉 You win!")
                self.wins += 1
            elif result == 'computer':
                print("💻 Computer wins!")
                self.losses += 1
            else:
                print("🤝 It's a tie!")
                self.ties += 1

            # Update learning
            self.learner.learn_from_game(player_move, computer_move, result)

            # Show current stats
            total_games = self.wins + self.losses + self.ties
            print(f"\nCurrent Score - You: {self.wins}, Computer: {self.losses}, Ties: {self.ties}")

            # Show learning stats
            stats = self.learner.get_stats()
            print(f"Computer has learned {stats['patterns_learned']} patterns from {stats['total_games']} games")

        # Save learning data before exit
        self.learner.save_memory()
        print("\nThanks for playing! Learning data saved.")

        # Final statistics
        total_games = self.wins + self.losses + self.ties
        if total_games > 0:
            win_rate = (self.wins / total_games) * 100
            print("
Final Statistics:")
            print(f"Games played: {total_games}")
            print(f"Your win rate: {win_rate:.1f}%")
            print(f"Wins: {self.wins}, Losses: {self.losses}, Ties: {self.ties}")


def main():
    """Main function"""
    game = RPSGame()
    game.play_game()


if __name__ == '__main__':
    main()
