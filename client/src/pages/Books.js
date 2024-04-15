import React, { useState, useEffect } from 'react';
import axios from 'axios';

const initialBookData = { nombre: '', descripcion: '', usuario_id: '' };

const Books = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [books, setBooks] = useState([]);
  const [editBookId, setEditBookId] = useState(null);
  const [newBookData, setNewBookData] = useState(initialBookData);
  const [bookToDeleteId, setBookToDeleteId] = useState(null);

  const url = "http://localhost:8000/books";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(url);
        setBooks(response.data); // Update the books state with data from the server
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    console.log(document.cookie)

    // Cleanup function not needed since there are no dependencies
  }, []);

  // Axios interceptor to include bearer token from cookie in requests
  axios.interceptors.request.use(
    (config) => {
      const token = document.cookie;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(token)
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

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

  const addBook = async () => {
    try {
      const response = await axios.post(url, newBookData);
      setBooks([...books, response.data]);
      setNewBookData(initialBookData);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const editBook = id => {
    setEditBookId(id);
    const bookToEdit = books.find(book => book.id === id);
    setNewBookData({ nombre: bookToEdit.nombre, descripcion: bookToEdit.descripcion, usuario_id: 4 });
    setShowModal(true);
  };

  const updateBook = async () => {
    try {
      await axios.put(`${url}/${editBookId}`, newBookData);
      const updatedBooks = books.map(book =>
        book.id === editBookId ? { ...book, nombre: newBookData.nombre, descripcion: newBookData.descripcion, usuario_id: 4 } : book
      );
      setBooks(updatedBooks);
      setNewBookData(initialBookData);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const confirmDelete = id => {
    setBookToDeleteId(id);
    setConfirmDeleteModal(true);
  };

  const deleteBook = async () => {
    try {
      await axios.delete(`${url}/${bookToDeleteId}`);
      const updatedBooks = books.filter(book => book.id !== bookToDeleteId);
      setBooks(updatedBooks);
      setBookToDeleteId(null);
      setConfirmDeleteModal(false);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div>
      <button onClick={() => { setShowModal(true); setEditBookId(null); }}>Agregar Libro</button>
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

export default Books;
