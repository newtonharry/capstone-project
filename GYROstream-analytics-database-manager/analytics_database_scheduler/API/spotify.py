import asyncio
import base64
import csv
import gzip
import io
import json
from concurrent.futures import as_completed
from datetime import datetime, timedelta
from pprint import pprint
from typing import cast
import numpy as np
from requests import Session
from requests import Response
from timeit import default_timer as timer
import pandas as pd

# API Token URL
ACCESS_TOKEN_URL = "https://accounts.spotify.com/api/token"

# API URLs
API_URL = "https://provider-api.spotify.com/v1/analytics"

# Enhanced API details
LICENSOR = "gyrostream"


class Spotify:
    def __init__(
        self, client_id, client_secret,
    ):
        self.encoded_auth_str = str(
            base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")), "utf-8"
        )
        self.access_token = ""
        self.access_token_expiry = None

        self.session = Session()  # Send synchronous requests
        self.get_access_token()  # Get access token when created

    def has_access_token_expired(self):
        if datetime.now() >= self.access_token_expiry:
            self.get_access_token()

    def get_access_token(self):
        resp = self.session.post(
            ACCESS_TOKEN_URL,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": f"Basic {self.encoded_auth_str}",
            },
            params={"grant_type": "client_credentials"},
        )
        data = resp.json()
        self.access_token = data["access_token"]
        self.access_token_expiry = datetime.now() + timedelta(hours=1)

    def get_aggregated_streams(self, date) -> pd.DataFrame:
        self.has_access_token_expired()
        response = self._get_enhanced_resource("aggregatedstreams", date)
        processed_data = self._process_compressed_streams_data(response)
        return processed_data

    def _get_enhanced_resource(self, resource, date) -> Response:
        day, month, year = (date.day, date.month, date.year)

        return self.session.get(
            f"{API_URL}/{LICENSOR}/enhanced/{resource}/{year}/{month}/{day}",
            headers={"Authorization": f"Bearer {self.access_token}"},
        )

    # STREAMS FUNCTIONS
    def _process_compressed_streams_data(self, response) -> pd.DataFrame:
        df = pd.DataFrame()

        # If the response contains data
        if response.content != b"":
            content_bytes = io.BytesIO(response.content)
            decompressed_bytes = gzip.decompress(content_bytes.read())
            records = (
                json.loads(line)
                for line in decompressed_bytes.decode().strip().split("\n")
            )  # Generator which loads the records into python readable objects

            data, columns = self.extract_data(records)
            df = pd.DataFrame(data, columns=columns)
            df = self._explode_columns(df, ["country", "streams", "skips"])

        # Fill in missing values
        df = df.fillna(0)
        return df

    def extract_data(self, records):
        # NOTE: Taken from https://stackoverflow.com/questions/28335321/how-to-convert-nested-dictionary-into-a-2d-table
        columns = [
            "date",
            "country",
            "streams",
            "skips",
            "track_name",
            "album_name",
            "track_href",
            "album_href",
            "isrc",
        ]

        value_getter = {
            "date": lambda item: datetime.strptime(item["date"], "%Y-%m-%d"),
            "country": lambda item: list(item["streams"]["country"].keys()),
            "streams": lambda item: [
                item["streams"]["country"][k]["total"]
                for (k, v) in item["streams"]["country"].items()
            ],
            "skips": lambda item: [
                item["skips"]["country"][k]["total"]
                for (k, v) in item["skips"]["country"].items()
            ],
            "track_name": lambda item: item["trackv2"]["name"],
            "album_name": lambda item: item["album"]["name"],
            "track_href": lambda item: item["trackv2"]["href"],
            "album_href": lambda item: item["album"]["href"],
            "isrc": lambda item: item["trackv2"]["isrc"],
        }

        data = {
            "date": [],
            "country": [],
            "streams": [],
            "skips": [],
            "track_name": [],
            "album_name": [],
            "track_href": [],
            "album_href": [],
            "isrc": [],
        }
        for record in records:
            for column in columns:
                data[column].append(value_getter[column](record))

        return data, columns

    # NOTE: Taken from https://stackoverflow.com/questions/45846765/efficient-way-to-unnest-explode-multiple-list-columns-in-a-pandas-dataframe
    def _explode_columns(self, df, lst_cols, fill_value="") -> pd.DataFrame:
        # make sure `lst_cols` is a list
        if lst_cols and not isinstance(lst_cols, list):
            lst_cols = [lst_cols]
        # all columns except `lst_cols`
        idx_cols = df.columns.difference(lst_cols)

        # calculate lengths of lists
        lens = df[lst_cols[0]].str.len()

        if (lens > 0).all():
            # ALL lists in cells aren't empty
            return (
                pd.DataFrame(
                    {
                        col: np.repeat(df[col].values, df[lst_cols[0]].str.len())
                        for col in idx_cols
                    }
                )
                .assign(**{col: np.concatenate(df[col].values) for col in lst_cols})
                .loc[:, df.columns]
            )
        else:
            # at least one list in cells is empty
            return (
                pd.DataFrame(
                    {
                        col: np.repeat(df[col].values, df[lst_cols[0]].str.len())
                        for col in idx_cols
                    }
                )
                .assign(**{col: np.concatenate(df[col].values) for col in lst_cols})
                .append(df.loc[lens == 0, idx_cols])
                .fillna(fill_value)
                .loc[:, df.columns]
            )



