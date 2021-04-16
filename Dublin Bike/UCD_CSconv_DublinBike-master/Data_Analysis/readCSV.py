import pymysql
import cryptography
import sys
import csv
import pandas as pd

sys.stdout = open("logfile.txt", "a+")

DB = {"dBikeS" : "dublin_bike_staticdata", "dBikeD" : "dublin_bike_dynamicdata", "dWeatherD" : "open_weather_dynamicdata"}

# host="dublinbikes.cpj6pmkzrors.eu-west-1.rds.amazonaws.com"
# user="dublinbikes"
# password="dba94w5p7"
# database="dublin_bike_schema"
# port=3306
host="localhost"
user="root"
password="localhost"
database="dublin_bike_24_3"
port=3306

def connectDB():
    global host,user,password, database,port

    # Server local connection:
    try:
        return pymysql.connect(host=host, user=user, password=password, database=database, port=port, cursorclass=pymysql.cursors.DictCursor)
    except Exception as e:
        print("Error is", e)

def toCSV(table):
    global DB,database

    sql='SELECT * FROM ' + database + '.' + DB[table] + ';'

    try:
        dublinBike_connect = connectDB()
        results = pd.read_sql_query(sql, dublinBike_connect)
        results.to_csv(table+".csv", index=False)

    except Exception as e:
        print("Error is", e)


toCSV('dBikeS')
toCSV('dBikeD')
toCSV('dWeatherD')
