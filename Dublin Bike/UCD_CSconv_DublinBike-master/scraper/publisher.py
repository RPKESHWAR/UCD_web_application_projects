import pymysql
import cryptography
from datetime import datetime
import sys


sys.stdout = open("logfile.txt", "a+")

DB = {"dBikeS" : "dublin_bike_staticdata", "dBikeD" : "dublin_bike_dynamicdata", "dWeatherD" : "open_weather_dynamicdata"}
arg = {"dBikeS" : " VALUES (%s, %s, %s, %s, %s, %s,%s, %s)", "dBikeD" : " VALUES (%s, %s, %s, %s, %s, %s)",\
        "dWeatherD" : " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,\
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"}

# Connection handle to database
def connectDB():

    try:
        #Local connection
        # return pymysql.connect(host="localhost", user="root", password="", database="test", port=3306,\
        #                               cursorclass=pymysql.cursors.DictCursor)

        # Server local connection:
        return pymysql.connect(host="dublinbikes.cpj6pmkzrors.eu-west-1.rds.amazonaws.com", user="dublinbikes",
                               password="dba94w5p7", database="dublin_bike_schema", port=3306, \
                               cursorclass=pymysql.cursors.DictCursor)
    except Exception as e:
        print("Error", e, datetime.now())

# Push data to a database table
def publish(atr, val, table):

    global DB, arg
    try:
        dublinBike_connect = connectDB()

        with dublinBike_connect.cursor() as cursor:

            sql = "INSERT INTO " + DB[table] + atr + arg[table]
            cursor.executemany(sql,val)

        dublinBike_connect.commit()
        dublinBike_connect.close()
    except Exception as e:
        print("Error", e, datetime.now())

# Check if a station entry is made in static database or not
def Check_StaticEntry(attr, table):

    global DB
    try:
        dublinBike_connect = connectDB()
        with dublinBike_connect.cursor() as cursor:
            sql = "SELECT number from " + DB[table] + " where number = %s"
            cursor.execute(sql,attr)
            dublinBike_connect.close()
            return cursor.rowcount == 1
    except Exception as e:
        print("Error", e, datetime.now())

# Return count of entries into a database table
def check_Entry(table):

    global DB
    try:
        dublinBike_connect = connectDB()
        with dublinBike_connect.cursor() as cursor:
            sql = "SELECT count(*) from " + DB[table]
            cursor.execute(sql)
            rows = cursor.fetchone()
            dublinBike_connect.close()
            return rows['count(*)']
            # return cursor.rowcount
    except Exception as e:
        print("Error", e, datetime.now())
