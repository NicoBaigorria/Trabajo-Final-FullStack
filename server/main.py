from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import List

# Create FastAPI app
app = FastAPI()

# PostgreSQL database URL
user = "postgres"
password = "Naics111194"
host = "localhost"
port = "5432"
db = "BooksStore"

SQLALCHEMY_DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{db}"

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a base class for declarative class definitions
Base = declarative_base()

# Define Book model
class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    descripcion = Column(String)
    usuario_id = Column(Integer)

# Create the database tables
Base.metadata.create_all(engine)

# Create a Session class to use throughout the app
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Pydantic model for request body
class BookCreate(BaseModel):
    nombre: str
    descripcion: str
    usuario_id: int

# Pydantic model for response
class BookResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    usuario_id: int

# Route to save a new book
@app.post("/books/", response_model=BookResponse)
def save_book(book: BookCreate):
    db = SessionLocal()
    try:
        db_book = Book(**book.model_dump())
        db.add(db_book)
        db.commit()
        db.refresh(db_book)
        return db_book
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=e)
    finally:
        db.close()

# Route to retrieve all books
@app.get("/books/", response_model=List[BookResponse])
def get_books():
    db = SessionLocal()
    try:
        books = db.query(Book).all()
        return [BookResponse(id=book.id, nombre=book.nombre, descripcion=book.descripcion, usuario_id=book.usuario_id) for book in books]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch books")
    finally:
        db.close()

# Route to update a book
@app.put("/books/{book_id}/", response_model=BookResponse)
def update_book(book_id: int, book: BookCreate):
    db = SessionLocal()
    try:
        db_book = db.query(Book).filter(Book.id == book_id).first()
        if db_book is None:
            raise HTTPException(status_code=404, detail="Book not found")
        db_book.nombre = book.nombre
        db_book.descripcion = book.descripcion
        db_book.usuario_id = book.usuario_id
        db.commit()
        db.refresh(db_book)
        return db_book
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update book")
    finally:
        db.close()

# Route to delete a book
@app.delete("/books/{book_id}/", response_model=BookResponse)
def delete_book(book_id: int):
    db = SessionLocal()
    try:
        db_book = db.query(Book).filter(Book.id == book_id).first()
        if db_book is None:
            raise HTTPException(status_code=404, detail="Book not found")
        db.delete(db_book)
        db.commit()
        return db_book
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete book")
    finally:
        db.close()
