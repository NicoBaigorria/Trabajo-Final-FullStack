from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import List

# Create FastAPI app
app = FastAPI()

# SQLite database URL (replace 'sqlite:///example.db' with your database URL)
user = "postgres"
password = "Naics111194"
host = "localhost"
port = "5432"
db = "BooksStore"

SQLALCHEMY_DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{db}"

# Create SQLAlchemy engine with option to create database if not exists
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_size=50, echo=False)

# Create a base class for declarative class definitions
Base = declarative_base()

# Create database if not exists
Base.metadata.create_all(engine)

# Create a Session class to use throughout the app
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define Book model
class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    descripcion = Column(String)

# Pydantic model for request body
class BookCreate(BaseModel):
    nombre: str
    descripcion: str

# Pydantic model for response
class BookResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str

# Route to save a new book
@app.post("/books/", response_model=BookResponse)
def save_book(book: BookCreate):
    db = SessionLocal()
    try:
        db_book = Book(**book.dict())
        db.add(db_book)
        db.commit()
        db.refresh(db_book)
        return db_book
    finally:
        db.close()

# Route to retrieve all books
@app.get("/books/", response_model=List[BookResponse])
def get_books():
    db = SessionLocal()
    try:
        books = db.query(Book).all()
        return [BookResponse(id=book.id, nombre=book.nombre, descripcion=book.descripcion) for book in books]
    finally:
        db.close()
