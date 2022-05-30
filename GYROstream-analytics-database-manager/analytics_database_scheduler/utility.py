
from API import Reporter
from API import Spotify
from models import (
    ItunesContentReport,
    ItunesSalesReport,
    ItunesShazamReport,
    ItunesStreamsReport,
    SpotifyAggregatedStreams,
)

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timedelta
from typing import Set
from database import engine

import pandas as pd
from sqlalchemy.types import Date
import logging

# Spotify credentials
client_id = "d1214f740f294757b774065a8eeba60b"
client_secret = "899fa17fea51481dbd7c0f2ea37fb135"

# Itunes credentials
VENDOR_NUMBER = "87954315"
ACCOUNT_NUMBER = "119136324"
TOKEN = "fbb5c541-6bae-40dc-83d2-9a1fc877936e"

# Initalize connection to spotify and itunes sources
spotify = Spotify(client_id, client_secret)
reporter = Reporter(access_token=TOKEN)

def drop_table(table):
    table.__table__.drop(engine)
    # SpotifyAggregatedStreams.__table__.drop(engine)
    # ItunesContentReport.__table__.drop(engine)
    # ItunesSalesReport.__table__.drop(engine)
    # ItunesStreamsReport.__table__.drop(engine)
    # ItunesShazamReport.__table__.drop(engine)

def get_distinct_dates(session, model_date_field: Date) -> Set:
    dates_needed = set(
        datetime.date()
        for datetime in pd.date_range(end=datetime.today(), periods=10)
        .to_pydatetime()
        .tolist()
    )
    existing_dates = {date[0] for date in session.query(model_date_field).distinct()}
    dates_needed -= existing_dates

    # today = datetime.today().strftime("%d-%m-%Y")
    # begining = list(dates_needed)[-1].strftime("%d-%m-%Y")  # NOTE: There is a potential index out of bounds error here
    # logging.info(f"Collecting dates from {today} to {begining}")
    return dates_needed


def spotify_data(session):
    if dates := get_distinct_dates(session, SpotifyAggregatedStreams.date):
        with ThreadPoolExecutor() as executor:
            futures = {
                executor.submit(spotify.get_aggregated_streams, date): date
                for date in dates
            }

            dfs = []
            for future in as_completed(futures):
                df = future.result()
                date = futures[future]
                if not df.empty:
                    dfs.append(df)
                    logging.info(f"Downloaded streams from {date.strftime('%d-%m-%Y')}")

        logging.info("Spotify data aggregation completed")
        if dfs:
            for df in dfs:
                session.bulk_insert_mappings(
                    SpotifyAggregatedStreams, df.to_dict(orient="records")
                )
            logging.info(
                "Spotify Aggregated Streams data has been inserted within the database"
            )
            session.commit()


def itunes_data(session):

    # Only the latest report is retrieved
    content = pd.DataFrame()

    # These reports contain multiple versions from different dates
    report_data = {
        "streams": [],
        "shazams": [],
        "sales": [],
    }

    report_to_schema = {
        "streams": ItunesStreamsReport,
        "shazams": ItunesShazamReport,
        "sales": ItunesSalesReport,
    }

    report_configs = {
        "streams": {
            "report_type": "amStreams",
            "date_type": "Daily",
            "report_subtype": "Detailed",
            "report_version": "1_2",
        },
        "shazams": {
            "report_type": "amShazam",
            "date_type": "Daily",
            "report_subtype": "Summary",
            "report_version": "1_2",
        },
        "sales": {
            "report_type": "Sales",
            "date_type": "Daily",
            "report_subtype": "Summary",
            "report_version": "1_0",
        },
    }
    # TODO: Need to account for other report date ranges and check if they exist
    if dates := get_distinct_dates(session, ItunesStreamsReport.datestamp):
        with ThreadPoolExecutor() as executor:
            futures = {
                executor.submit(
                    reporter.download_sales_report,
                    vendor=VENDOR_NUMBER,
                    date=date.strftime("%Y%m%d"),
                    **config,
                ): (report_type, date)
                for report_type, config in report_configs.items()
                for date in dates
            }
            for future in as_completed(futures):
                report_type, report_date = futures[future]
                report_content = future.result()
                if not report_content.empty:
                    report_data[report_type].append(report_content)
                    logging.info(
                        f"Downloaded {report_type} from {report_date.strftime('%d-%m-%Y')}"
                    )

            logging.info("Donwloaded Itunes Sales Reports")

        # Download Content Report (Only needs to get the latest one)
        current_date = datetime.now().date()
        while (
            report := reporter.download_sales_report(
                vendor=VENDOR_NUMBER,
                report_type="amContent",
                date_type="Daily",
                date=current_date.strftime("%Y%m%d"),
                report_subtype="Detailed",
                report_version="1_2",
            )
        ).empty:
            current_date -= timedelta(1)

        content = report
        logging.info(f"Downloaded Content Report from {current_date}")

        # Write reports to the database
        content.to_sql("itunes_content_report", engine, if_exists="replace") # NOTE: This could be converted to a normal session expression if the table is dropped beforehand
        logging.info("Inserted the content report into the database")

        for report, report_list in report_data.items():
            for dataframe in report_list:
                session.bulk_insert_mappings(
                    report_to_schema[report], dataframe.to_dict(orient="records")
                )
            logging.info(f"Inserted the {report} report into the database")

        session.commit()