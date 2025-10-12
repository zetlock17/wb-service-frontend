public class Main {
    public static void main(String[] args) {
        Library library = new Library();

        Book book1 = new Book("колобок", "хз", "сказка", 1000);
        Book book2 = new Book("боевой единорог", "дипсик", "какао", 5000);

        library.addBook(book1, 3);
        library.addBook(book2, 1);

        Book borrowedBook = library.getBook("колобок");
        if (borrowedBook != null) {
            System.out.println("Borrowed: " + borrowedBook.title);
        }
        library.getBook("колобок");

        library.comebackBook("колобок");
        

        library.getBook("боевой единорог");
        library.getBook("боевой единорог");

    }
}
