public class Book {
    String title;
    String author;
    String genre;
    double price;
    boolean isAvailable;

    public Book() {
        this.isAvailable = true;
    }

    public Book(String title, String author, String genre, double price) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.price = price;
        this.isAvailable = true;
    }
}
