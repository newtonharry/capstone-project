import logging
from utility import spotify_data, itunes_data
from database import Session, Base, engine

# Configure the logger
logging.basicConfig(
    filename="DATABASE_HANDLER",
    filemode="a",
    format="%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
    level=logging.DEBUG,
)


if __name__ == "__main__":
    # Make the database if it isn't already
    Base.metadata.create_all(engine)

    # Indicate the database scheduler is running
    logging.info("Running Database Handler")

    with Session() as session:
        # TODO: Need to implement feature which allows to re-download all reports, because of new artists which join GYRO and have streams before joining
        # NOTE: Need to commit session within each function as the to_sql funciton cannot be executed due to the session locking the databse
        spotify_data(session)
        itunes_data(session)

        # TODO: Might need to accont for spotify or itunes failing
        # logging.info("Itunes and Spotify data has been inserted into the database")
