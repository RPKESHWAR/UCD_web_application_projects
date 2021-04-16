from flask import Flask, render_template,request,jsonify
from flask_mysqldb import MySQL
import pandas as pd
from average_bike import getCount
from prediction import retBikeWeather
import sys


sys.stdout = open("logfile.txt", "a+")



app = Flask(__name__)
mysql = MySQL(app)



# Local Credential
# app.config['MYSQL_HOST'] = 'localhost'
# app.config['MYSQL_USER'] = 'root'
# app.config['MYSQL_PASSWORD'] = ''
# app.config['MYSQL_DB'] = 'dublin_bike_schema'
# app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

#
#Server Credential
app.config['MYSQL_HOST'] = 'dublinbikes.cpj6pmkzrors.eu-west-1.rds.amazonaws.com'
app.config['MYSQL_USER'] = 'dublinbikes'
app.config['MYSQL_PASSWORD'] = 'dba94w5p7'
app.config['MYSQL_DB'] = 'dublin_bike_schema'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'




@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_data',methods=["POST","GET"])

def get_data():
    cursor = mysql.connection.cursor()
    query = "SELECT * FROM dublin_bike_staticdata"
    cursor.execute(query)
    result = cursor.fetchall()
    return jsonify(result)


@app.route('/get_station_info/',methods=["POST","GET"])
def get_station_info(data):
    result = request.json['data']
    cursor = mysql.connection.cursor()
    query = "SELECT * FROM dublin_bike_staticdata"
    cursor.execute(query)
    result = cursor.fetchall()
    return jsonify(result)


@app.route('/station_data', methods=['POST'])
def station_data():
    # Grab token information
    station_number = request.json['station_number']
    cursor = mysql.connection.cursor()
    query = "SELECT * FROM dublin_bike_schema.dublin_bike_dynamicdata where last_update = (SELECT MAX(last_update) FROM  dublin_bike_schema.dublin_bike_dynamicdata where number="+str(station_number)+")"
    cursor.execute(query)
    result = cursor.fetchall()
    return jsonify(result)



@app.route('/get_station_history',methods=["POST"])
def get_station_history():

    try:
        station_number = request.json['station_number']
        bike_type = request.json['type']
        result = getCount(station_number)
        return jsonify(result)

    except Exception as e:
        print("Error is", e)


@app.route('/get_prediction',methods=["POST"])
def get_prediction():
    station_numbers = [request.json['source_station_number'], request.json['destination_station_number']]
    date_list = [request.json['departure_date_api'],request.json['destination_date_api']]
    result = retBikeWeather(station_numbers,date_list)
    return jsonify(result)


@app.route('/current_weather', methods=['GET'])
def current_weather():
    cursor = mysql.connection.cursor()
    query = "SELECT * FROM dublin_bike_schema.open_weather_dynamicdata ORDER BY dt DESC LIMIT 1"
    cursor.execute(query)
    result = cursor.fetchall()

    # This method will convert all tables in csv format. As all database data has already converted to csv via this method. Hence to avoid unnessasary callback this method is commented
    #toCSV('dBikeS')
    #toCSV('dBikeD')
    #toCSV('dWeatherD')
    return jsonify(result)




def toCSV(table):
    global DB,database

    DB = {"dBikeS": "dublin_bike_staticdata", "dBikeD": "dublin_bike_dynamicdata",
          "dWeatherD": "open_weather_dynamicdata"}

    database = "dublin_bike_schema"

    sql='SELECT * FROM ' + database + '.' + DB[table]

    try:
        cursor = mysql.connection.cursor()
        cursor.execute(sql)
        result = cursor.fetchall()
        df = pd.DataFrame(result)
        df.to_csv(table+".csv", index=False)

    except Exception as e:
        print("Error is", e)



if __name__ == "__main__":
    app.run(debug=True)


