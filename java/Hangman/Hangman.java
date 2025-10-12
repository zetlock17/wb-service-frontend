package Hangman;

import java.util.random.*;

public class Hangman {

    public static void main(String[] args) {
        Hangman game = new Hangman();
        game.Game();
    }

    String[] words = {"джава", "питон", "виселица", "программирование", "разработчик"};
    int maxWrongGuesses = 6;

    public String getRandomWord() {
        RandomGenerator randomGen = RandomGenerator.getDefault();
        int index = randomGen.nextInt(words.length);
        return words[index];
    }

    public String printStage(int wrongGuesses) {
        String[] stages = {
            """
               -----
               |   |
               |   O
               |  /|\\
               |  / \\
               |
            ---------
            """,
            """
               -----
               |   |
               |   O
               |  /|\\
               |  /
               |
            ---------
            """,
            """
               -----
               |   |
               |   O
               |  /|
               |
               |
            ---------
            """,
            """
               -----
               |   |
               |   O
               |   |
               |
               |
            ---------
            """,
            """
               -----
               |   |
               |   O
               |
               |
               |
            ---------
            """,
            """
               -----
               |   |
               |
               |
               |
               |
            ---------
            """,
            """
               
               
               
               
               
               
            ---------
            """
        };
        return stages[maxWrongGuesses - wrongGuesses];
    }

    public void Game() {
        String wordToGuess = getRandomWord();
        StringBuilder currentGuess = new StringBuilder("_".repeat(wordToGuess.length()));
        int wrongGuesses = 0;
        java.util.Scanner scanner = new java.util.Scanner(System.in, "cp866");

        while (wrongGuesses < maxWrongGuesses && currentGuess.toString().contains("_")) {
            
            System.out.println(printStage(wrongGuesses));
            System.out.println("Слово: " + currentGuess);
            System.out.print("Введите вашу догадку (одна буква): ");
            String guessStr = scanner.nextLine().toLowerCase();
            if (guessStr.isEmpty()) continue;
            char guess = guessStr.charAt(0);
            
            if (wordToGuess.contains(guessStr)) {
                for (int i = 0; i < wordToGuess.length(); i++) {
                    if (wordToGuess.charAt(i) == guess) {
                        currentGuess.setCharAt(i, guess);
                    }
                }
            } else {
                wrongGuesses++;
            }
        }
        
        if (!currentGuess.toString().contains("_")) {
            System.out.println("Поздравляю! Вы выиграли! Загаданное слово: " + wordToGuess);
        }

        if (wrongGuesses == maxWrongGuesses) {
            System.out.println(printStage(wrongGuesses));
            System.out.println("Вы проиграли! Загаданное слово было: " + wordToGuess);
        }
        scanner.close();
    }
}
