import java.util.ArrayList;

public class Library {
    ArrayList<Book> books;

    public Library() {
        books = new ArrayList<>();
    }

    public void addBook(Book book, int count) {
        for (int i = 0; i < count; i++) {
            book = Clone(book);
            books.add(book);
        }
        System.out.println(count + " copies of " + book.title + " added to the library.");
    }

    public Book getBook(String title) {
        for (Book book : books) {
            if (book.title.equalsIgnoreCase(title) && book.isAvailable) {
                book.isAvailable = false;
                System.out.println("Book '" + title + "' has been borrowed.");
                return book;
            }
        }
        System.out.println("Book '" + title + "' not found or not available.");
        return null;
    }

    public Book comebackBook(String title) {
        for (Book book : books) {
            if (book.title.equalsIgnoreCase(title) && !book.isAvailable) {
                book.isAvailable = true;
                System.out.println("Book '" + title + "' is now available.");
                return book;
            }
        }
        System.out.println("Book '" + title + "' not found or was not borrowed.");
        return null;
    }

    public Book Clone(Book book) {
        Book clonedBook = new Book();
        clonedBook.title = book.title;
        clonedBook.author = book.author;
        clonedBook.genre = book.genre;
        clonedBook.price = book.price;
        clonedBook.isAvailable = true;
        return clonedBook;
    }
}
