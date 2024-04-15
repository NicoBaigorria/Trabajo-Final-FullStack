from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List, Union
import jwt
import datetime
from datetime import timedelta, datetime


# Create FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can replace "*" with specific origins if needed
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

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

# Define User model
class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

# Define Book model
class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    descripcion = Column(String)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))

# Create the database tables
Base.metadata.create_all(engine)

# Create a Session class to use throughout the app
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency to get the current session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic model for user creation request body
class UserCreate(BaseModel):
    email: str
    password: str

# Pydantic model for user update request body
class UserUpdate(BaseModel):
    email: str
    password: str

# Pydantic model for user response
class UserResponse(BaseModel):
    id: int
    email: str

# Pydantic model for book creation request body
class BookCreate(BaseModel):
    nombre: str
    descripcion: str

# Pydantic model for book response
class BookResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    usuario_id: int


SECRET_KEY = "secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, time_expire: Union[datetime, None] = None):
    to_encode = data.copy()
    if time_expire is None:
        expires = datetime.utcnow() + timedelta(minutes=15)
    else:
        expires = datetime.utcnow() + time_expire
    to_encode.update({"exp": expires})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(token)
    return token

def verify_password(plain_password, hashed_password):
    verify = pwd_context.verify(
        plain_password, hashed_password)
    return verify

def authenticate_user(db, username: str, password: str):
    user = db.query(User).filter(User.email == username).first()
    if not user or not verify_password(password, user.password):
        return False
    return user


# Define tags for users endpoints
tags = ["Users"]

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = next(get_db())
    print(form_data)
    print("data entry", form_data.username, form_data.password)
    user = authenticate_user(db, form_data.username, form_data.password)
    print(form_data.username, form_data.password, user)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        {"email": user.email, "id": user.id}, access_token_expires
        )
    return {"access_token": access_token, "token_type": "bearer"}
    
    # Assuming you have a function to get the current user's email from the JWT token
def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id = payload.get("id")
        if id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Route to create a new user
@app.post("/users/", response_model=UserResponse, tags=tags)
def create_user(user: UserCreate):
    db = SessionLocal()
    try:
        db_user = User(email=user.email, password=pwd_context.hash(user.password))
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create user")
    finally:
        db.close()

# Route to retrieve all users
@app.get("/users/", response_model=List[UserResponse], tags=tags)
def get_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch users")
    finally:
        db.close()

# Route to update a user
@app.put("/users/{user_id}/", response_model=UserResponse, tags=tags)
def update_user(user_id: int, user: UserUpdate):
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        db_user.email = user.email
        db_user.password = pwd_context.hash(user.password)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update user")
    finally:
        db.close()

# Route to delete a user
@app.delete("/users/{user_id}/", response_model=UserResponse, tags=tags)
def delete_user(user_id: int):
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        db.delete(db_user)
        db.commit()
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete user")
    finally:
        db.close()

# Define tags for users endpoints
tags = ["Books"]

# Route to save a new book
@app.post("/books/", response_model=BookResponse, tags=tags)
def save_book(book: BookCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    db = SessionLocal()
    try:
        db_book = Book(**book.dict(), usuario_id=user_id)
        db.add(db_book)
        db.commit()
        db.refresh(db_book)
        return db_book
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save book")
    finally:
        db.close()

# Route to retrieve all books
@app.get("/books/", response_model=List[BookResponse], tags=tags)
def get_books(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    db = SessionLocal()
    try:
        books = db.query(Book).filter(Book.usuario_id == user_id).all()
        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch books")
    finally:
        db.close()

# Route to update a book
@app.put("/books/{book_id}/", response_model=BookResponse, tags=tags)
def update_book(book_id: int, book: BookCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    db = SessionLocal()
    try:
        db_book = db.query(Book).filter(Book.id == book_id).first()
        if db_book is None:
            raise HTTPException(status_code=404, detail="Book not found")
        db_book.nombre = book.nombre
        db_book.descripcion = book.descripcion
        db_book.usuario_id = user_id
        db.commit()
        db.refresh(db_book)
        return db_book
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Failed to update book")
    finally:
        db.close()

# Route to delete a book
@app.delete("/books/{book_id}/", response_model=BookResponse, tags=tags)
def delete_book(book_id: int, token: str = Depends(oauth2_scheme)):
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
