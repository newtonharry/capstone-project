
# create a Session
from contextlib import contextmanager
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
import logging

// Define SQLALCHEMY_DATABASE_URL here

# Create an engine to connect to the database
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

# Initalize a session with the engine
session_maker = sessionmaker(bind=engine)

# Make a context manager to use the session safely
@contextmanager
def Session(auto_commit=False):
    sess = session_maker()
    try:
        yield sess
        if auto_commit:
            sess.commit()
    except:
        sess.rollback()
        raise
    finally:
        sess.close()
    
Base = declarative_base()

# Make the database if it isn't already
Base.metadata.create_all(engine)

# Apply logging to sqlalchemy
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

