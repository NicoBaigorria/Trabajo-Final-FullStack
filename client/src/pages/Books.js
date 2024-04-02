import React, { useState } from 'react';

const initialBookData = { nombre: '', descripcion: '' };

const Books = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [books, setBooks] = useState([
  { id: 1, nombre: 'Book 1', descripcion: 'Description 1' },
  { id: 2, nombre: 'Book 2', descripcion: 'Description 2' },
  { id: 3, nombre: 'Book 3', descripcion: 'Description 3' },
  { id: 4, nombre: 'Book 1', descripcion: 'Description 1' },
  { id: 5, nombre: 'Book 2', descripcion: 'Description 2' },
  { id: 6, nombre: 'Book 3', descripcion: 'Description 3' },
  { id: 7, nombre: 'Book 1', descripcion: 'Description 1' },
  { id: 8, nombre: 'Book 2', descripcion: 'Description 2' },
  { id: 9, nombre: 'Book 3', descripcion: 'Description 3' },
  { id: 10, nombre: 'Book 1', descripcion: 'Description 1' },
  { id: 11, nombre: 'Book 2', descripcion: 'Description 2' },
  { id: 12, nombre: 'Book 3', descripcion: 'Description 3' },
  { id: 13, nombre: 'Book 1', descripcion: 'Description 1' },
  { id: 14, nombre: 'Book 2', descripcion: 'Description 2' },
  { id: 15, nombre: 'Book 3', descripcion: 'Description 3' },
  // Add more books here
]);
const [editBookId, setEditBookId] = useState(null);
const [newBookData, setNewBookData] = useState(initialBookData);
const [bookToDeleteId, setBookToDeleteId] = useState(null);

const booksPerPage = 10;
const totalPages = Math.ceil(books.length / booksPerPage);
const indexOfLastBook = currentPage * booksPerPage;
const indexOfFirstBook = indexOfLastBook - booksPerPage;
const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

const paginate = pageNumber => setCurrentPage(pageNumber);

const handleInputChange = event => {
  const { name, value } = event.target;
  setNewBookData({ ...newBookData, [name]: value });
};

const addBook = () => {
  if (newBookData.nombre.trim() !== '' && newBookData.descripcion.trim() !== '') {
    const newBook = {
      id: books.length + 1,
      nombre: newBookData.nombre,
      descripcion: newBookData.descripcion
    };
    setBooks([...books, newBook]);
    setNewBookData(initialBookData);
    setShowModal(false);
  }
};

const editBook = id => {
  setEditBookId(id);
  const bookToEdit = books.find(book => book.id === id);
  setNewBookData({ nombre: bookToEdit.nombre, descripcion: bookToEdit.descripcion });
  setShowModal(true);
};

const updateBook = () => {
  const updatedBooks = books.map(book =>
    book.id === editBookId ? { ...book, nombre: newBookData.nombre, descripcion: newBookData.descripcion } : book
  );
  setBooks(updatedBooks);
  setNewBookData(initialBookData);
  setShowModal(false);
};

const confirmDelete = id => {
  setBookToDeleteId(id);
  setConfirmDeleteModal(true);
};

const deleteBook = () => {
  const updatedBooks = books.filter(book => book.id !== bookToDeleteId);
  setBooks(updatedBooks);
  setBookToDeleteId(null);
  setConfirmDeleteModal(false);
};

return (
  <div>
    <button onClick={() => {setShowModal(true); setEditBookId(null);}}>Agregar Libro</button>
    {showModal && (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => setShowModal(false)}>&times;</span>
          <h2>{editBookId ? "Editar Libro" : "Agregar Libro"}</h2>
          <label>
            Nombre:
            <input type="text" name="nombre" value={newBookData.nombre} onChange={handleInputChange} />
          </label>
          <label>
            Descripcion:
            <input type="text" name="descripcion" value={newBookData.descripcion} onChange={handleInputChange} />
          </label>
          <button onClick={editBookId ? updateBook : addBook}>{editBookId ? "Editar" : "Agregar"}</button>
        </div>
      </div>
    )}
    {confirmDeleteModal && (
      <div className="modal">
        <div className="modal-content">
          <h2>Confirmar Eliminación</h2>
          <p>¿Estás seguro de que deseas eliminar este libro?</p>
          <div>
            <button onClick={deleteBook}>Eliminar</button>
            <button onClick={() => setConfirmDeleteModal(false)}>Cancelar</button>
          </div>
        </div>
      </div>
    )}
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripcion</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {currentBooks.map(book => (
          <tr key={book.id}>
            <td>{book.nombre}</td>
            <td>{book.descripcion}</td>
            <td>
              <button onClick={() => editBook(book.id)}>Editar</button>
              <button onClick={() => confirmDelete(book.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <ul>
      {Array.from({ length: totalPages }).map((_, index) => (
        <li key={index}>
          <button onClick={() => paginate(index + 1)}>{index + 1}</button>
        </li>
      ))}
    </ul>
  </div>
);
};


export default Books