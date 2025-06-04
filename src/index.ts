interface Member {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isBorrowed: boolean;
  borrowedBy: string | null;
}

class BookManagementSystem {
  private members: Member[] = [];
  private books: Book[] = [];

  constructor() {
    this.loadData();
    this.initEventListeners();
    this.render();
  }

  private saveData() {
    localStorage.setItem("members", JSON.stringify(this.members));
    localStorage.setItem("books", JSON.stringify(this.books));
  }

  private loadData() {
    this.members = JSON.parse(localStorage.getItem("members") || "[]");
    this.books = JSON.parse(localStorage.getItem("books") || "[]");
  }

  private initEventListeners() {
    const memberForm = document.getElementById("member-form") as HTMLFormElement;
    const bookForm = document.getElementById("book-form") as HTMLFormElement;
    const borrowForm = document.getElementById("borrow-form") as HTMLFormElement;
    const returnForm = document.getElementById("return-form") as HTMLFormElement;

    memberForm.onsubmit = (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("member-name") as HTMLInputElement;
      this.addMember(nameInput.value.trim());
      nameInput.value = "";
    };

    bookForm.onsubmit = (e) => {
      e.preventDefault();
      const title = (document.getElementById("book-title") as HTMLInputElement).value.trim();
      const author = (document.getElementById("book-author") as HTMLInputElement).value.trim();
      this.addBook(title, author);
      bookForm.reset();
    };

    borrowForm.onsubmit = (e) => {
      e.preventDefault();
      const memberId = (document.getElementById("borrow-member") as HTMLSelectElement).value;
      const bookId = (document.getElementById("borrow-book") as HTMLSelectElement).value;
      this.borrowBook(bookId, memberId);
    };

    returnForm.onsubmit = (e) => {
      e.preventDefault();
      const bookId = (document.getElementById("return-book") as HTMLSelectElement).value;
      this.returnBook(bookId);
    };
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private addMember(name: string) {
    const newMember: Member = { id: this.generateId(), name };
    this.members.push(newMember);
    this.saveData();
    this.render();
  }

  private deleteMember(id: string) {
    const borrowed = this.books.find(b => b.borrowedBy === id);
    if (borrowed) {
      alert("Cannot delete member with borrowed books.");
      return;
    }
    this.members = this.members.filter(m => m.id !== id);
    this.saveData();
    this.render();
  }

  private addBook(title: string, author: string) {
    const newBook: Book = {
      id: this.generateId(),
      title,
      author,
      isBorrowed: false,
      borrowedBy: null,
    };
    this.books.push(newBook);
    this.saveData();
    this.render();
  }

  private deleteBook(id: string) {
    const book = this.books.find(b => b.id === id);
    if (book?.isBorrowed) {
      alert("Return the book before deleting.");
      return;
    }
    this.books = this.books.filter(b => b.id !== id);
    this.saveData();
    this.render();
  }

  private borrowBook(bookId: string, memberId: string) {
    const book = this.books.find(b => b.id === bookId);
    if (!book || book.isBorrowed) return;

    book.isBorrowed = true;
    book.borrowedBy = memberId;
    this.saveData();
    this.render();
  }

  private returnBook(bookId: string) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return;

    book.isBorrowed = false;
    book.borrowedBy = null;
    this.saveData();
    this.render();
  }

  private render() {

    const memberList = document.getElementById("member-list") as HTMLElement;
    const borrowMember = document.getElementById("borrow-member") as HTMLSelectElement;

    memberList.innerHTML = "";
    borrowMember.innerHTML = "";

    this.members.forEach((member) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${member.name}</td>
        <td>
          <button class="delete" onclick="system.deleteMember('${member.id}')">Delete</button>
        </td>`;
      memberList.appendChild(row);

      const option = document.createElement("option");
      option.value = member.id;
      option.text = member.name;
      borrowMember.appendChild(option);
    });

    const bookList = document.getElementById("book-list") as HTMLElement;
    const borrowBook = document.getElementById("borrow-book") as HTMLSelectElement;
    const returnBook = document.getElementById("return-book") as HTMLSelectElement;

    bookList.innerHTML = "";
    borrowBook.innerHTML = "";
    returnBook.innerHTML = "";

    this.books.forEach((book) => {
      const borrowedBy = this.members.find(m => m.id === book.borrowedBy)?.name || "";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isBorrowed ? "Borrowed" : "Available"}</td>
        <td>${borrowedBy}</td>
        <td>
          <button class="delete" onclick="system.deleteBook('${book.id}')">Delete</button>
        </td>`;
      bookList.appendChild(row);

      if (!book.isBorrowed) {
        const option = document.createElement("option");
        option.value = book.id;
        option.text = book.title;
        borrowBook.appendChild(option);
      } else {
        const option = document.createElement("option");
        option.value = book.id;
        option.text = book.title;
        returnBook.appendChild(option);
      }
    });
  }
}

const system = new BookManagementSystem();
(window as any).system = system;
