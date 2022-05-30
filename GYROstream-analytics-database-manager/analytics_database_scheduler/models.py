# create a Session
from sqlalchemy import Column, Date, Float, Integer, Text, BigInteger
from database import Base


class SpotifyAggregatedStreams(Base):
    __tablename__ = "spotify_aggregated_streams"

    index = Column(Integer, primary_key=True)
    date = Column(Date)
    country = Column(Text)
    streams = Column(Integer)
    skips = Column(Integer)
    track_name = Column(Text)
    album_name = Column(Text)
    track_href = Column(Text)
    album_href = Column(Text)
    isrc = Column(Text)


class ItunesContentReport(Base):
    __tablename__ = "itunes_content_report"

    id = Column(Integer, primary_key=True)
    apple_identifier = Column(Integer)
    isrc = Column(Text)
    title = Column(Text)
    artist = Column(Text)
    artist_id = Column(Text)
    item_type = Column(Integer)
    media_type = Column(Integer)
    media_duration = Column(Integer)
    vendor_identifier = Column(Text)
    label_studio_network = Column(Text)
    grid = Column(Float)


class ItunesStreamsReport(Base):
    __tablename__ = "itunes_streams_report"

    id = Column(Integer, primary_key=True)
    datestamp = Column(Date)
    ingest_datestamp = Column(Date)
    ingest_timestamp = Column(Integer)
    apple_identifier = Column(Integer)
    storefront_name = Column(Text)
    anonymized_person_id = Column(Text)
    membership_type = Column(Text)
    membership_mode = Column(Text)
    membership_partner = Column(Text)
    postal_code = Column(Text)
    device_type = Column(Integer)
    operating_system = Column(Integer)
    action_type = Column(Integer)
    end_reason_type = Column(Integer)
    offline = Column(Integer)
    source_of_stream = Column(Integer)
    container_type = Column(Integer)
    container_sub_type = Column(Integer)
    container_id = Column(Text)
    container_name = Column(Text)
    stream_timestamp = Column(Integer)
    stream_start_position = Column(Integer)
    stream_duration = Column(Integer)


class ItunesShazamReport(Base):
    __tablename__ = "itunes_shazams_report"

    id = Column(Integer, primary_key=True)
    ingest_datestamp = Column(Date)
    title = Column(Text)
    artist = Column(Text)
    country = Column(Text)
    city = Column(Text)
    stream_duration = Column(Integer)


class ItunesSalesReport(Base):
    __tablename__ = "itunes_sales_report"

    id = Column(Integer, primary_key=True)
    provider = Column(Text)
    provider_country = Column(Text)
    vendor_identifier = Column(Text)
    upc = Column(BigInteger)
    isrc = Column(Text)
    artist_show = Column(Text)
    title = Column(Text)
    label_studio_network = Column(Text)
    product_type_identifier = Column(Text)
    units = Column(Integer)
    royalty_price = Column(Integer)
    begin_date = Column(Date)
    end_date = Column(Date)
    customer_currency = Column(Text)
    country_code = Column(Text)
    royalty_currency = Column(Text)
    preorder = Column(Text)
    isan = Column(Text)  # NOTE: May be incorrect type
    apple_identifier = Column(BigInteger)
    customer_price = Column(Float)
    cma = Column(Text)  # NOTE: May be incorrect type
    asset_conent_flavor = Column(Text)  # NOTE: May be incorrect type
    vendor_offer_code = Column(Text)
    grid = Column(Text)  # NOTE: May be incorrect type
    promo_code = Column(Text)  # NOTE: May be incorrect type
    parent_identifier = Column(Text())
    parent_type_id = Column(Text)
    primary_genre = Column(Text)
