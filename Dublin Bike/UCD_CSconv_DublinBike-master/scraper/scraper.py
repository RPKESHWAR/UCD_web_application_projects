import json
import requests
from publisher import *
from datetime import datetime
import time
import sys

# Save all print statements into logfile.txt instead of printing on console
sys.stdout = open("logfile.txt", "a+")

## ******************************************************************************************************************************************************##

# Names for features in database tables are arrnaged int odictionaries to avoid hardcoding and code maintainance
dBike_StaticAttribute = ['number', 'contract_name', 'name', 'address', 'position_lat', 'position_lng', 'bonus', 'banking']
dBike_DynamicAttribute = ['number', 'status', 'bike_stands', 'available_bike_stands', 'available_bikes']
dWeather_DynamicAttribute = ['coord_lat', 'coord_lon', 'weather_id', 'weather_main', 'weather_description', 'weather_icon', 'base',\
                    'main_sea_level', 'main_grnd_level',\
                    'main_pressure','main_humidity','visibility', 'rain_1h', 'rain_3h', 'snow_1h', 'snow_3h','wind_speed','wind_deg','wind_gust',\
                    'clouds_all', 'sys_type', 'sys_id', 'sys_country', 'sys_message','timezone', 'id', 'name', 'cod']
timeStampDy = {'dBike' : ['last_update'], 'dWeather' : ['dt', 'sys_sunrise', 'sys_sunset']}
tempDy = {'dWeather' : ['main_temp','main_feels_like','main_temp_max','main_temp_min']}
timeStampDevider = {'dBike' : 1000, 'dWeather' : 1}
contract = {"dBike" : "dublin", "dWeather" : "2964574" }
api_Key = {"dBike" : "dc66b92bfcdbe203fea9a98416b4924fde76145a", "dWeather" : "4896209d0bdece9b7668a4fb4e8a9c03" }
credential_Files = {"dBike" : "apiKey_dBike.txt", "dWeather" : "apiKey_openWeather.txt" }
credential_APIstr = {"dBike" : "https://api.jcdecaux.com/vls/v1/stations?contract=", "dWeather" : "https://api.openweathermap.org/data/2.5/weather?id=" }
credential_KEYstr = {"dBike" : "&apiKey=", "dWeather" : "&appid=" }

## ******************************************************************************************************************************************************##

# File handling with python https://www.w3schools.com/python/python_file_open.asp
def api_URL(apiName):
    api_dBike_URL = credential_APIstr[apiName] + contract[apiName] + credential_KEYstr[apiName] + api_Key[apiName]
    return api_dBike_URL

# flatten dictionary https://medium.com/better-programming/how-to-flatten-a-dictionary-with-nested-lists-and-dictionaries-in-python-524fd236365
def flatten(collection_input,sep="_"):
    dictionary = {}

    def recurse(coll_in,parent_key=""):

        if isinstance(coll_in,list):
            for itr in range(len(coll_in)):
                recurse(coll_in[itr],parent_key)

        elif isinstance(coll_in,dict):
            for key,val in coll_in.items():
                recurse(val,parent_key+sep+key if parent_key else key)
        else:
            dictionary[parent_key] = coll_in
    recurse(collection_input)
    return dictionary

## ******************************************************************************************************************************************************##

# insert_DataI() accepts json response from JCDecaux and openweathermap API along with key for table name in database
# Fuction arranges all data, processes temperature data entry into celcius scale and publishes the data
def insert_Data(api_Resp_json, api):
    att_st_final, val_st_final,att_dy_final, val_dy_final = '',[],'',[]
    DB_dict = {}


    if api == "dBike":
        dynamicAttribute = dBike_DynamicAttribute
        staticAttribute = dBike_StaticAttribute
    elif api == "dWeather":
        temp = [1]
        dynamicAttribute = dWeather_DynamicAttribute
        staticAttribute = None
        temp[0] = api_Resp_json
        api_Resp_json = temp



    for stations in range(len(api_Resp_json)):
        val_st, val_dy =[],[]

        # seriealise nested directory entries creating new columns whereever necessary
        DB_dict = flatten(api_Resp_json[stations])

        for attributeDy in dynamicAttribute:
            try:
                val_dy.append(DB_dict[attributeDy])
            except KeyError:
                val_dy.append(None)

        for itr in range(len(timeStampDy[api])):
            try:
                val_dy.append(datetime.fromtimestamp(int(DB_dict[timeStampDy[api][itr]] / timeStampDevider[api])))
            except KeyError:
                val_dy.append(None)

        # Normalise temperature related entries to degree celsius before logging in weather database
        if api == "dWeather":
            for itr in range(len(tempDy[api])):
                try:
                    val_dy.append(int(round(DB_dict[tempDy[api][itr]]) - 273.15))
                except KeyError:
                    val_dy.append(None)

        val_dy_final.append(val_dy)

        # Check if entry exists for a station in static data. If station entry exists, do not update static data
        if staticAttribute and not Check_StaticEntry(DB_dict['number'], api+"S"):
            for attributeSt in staticAttribute:
                try:
                    val_st.append(DB_dict[attributeSt])
                except KeyError:
                    val_st.append(None)
            val_st_final.append(val_st)
        else:
            continue

    # Create string of attribute names in format suitable for sql entry
    if staticAttribute:
        att_st_final = "(`" + '`,`'.join(str(sAtt) for sAtt in staticAttribute) +  "`)"
    att_dy_final = "(`" + '`,`'.join(str(dAtt) for dAtt in dynamicAttribute) + "`,`" +'`,`'.join(str(tsDy) for tsDy in timeStampDy[api])+"`)" if api == "dBike" else\
    "(`" + '`,`'.join(str(dAtt) for dAtt in dynamicAttribute) + "`,`" +'`,`'.join(str(tsDy) for tsDy in timeStampDy[api])+ "`,`" +'`,`'.join(str(tmpDy) for tmpDy in tempDy[api])+ "`)"

    if val_st_final:
        publish(att_st_final,val_st_final,api+"S")
    publish(att_dy_final,val_dy_final,api+"D")

## ******************************************************************************************************************************************************##

# Obtain API response from JCDecaux dublin bike API and insert it to RDS database
def dBike_call():
    api_dBike_Resp = requests.get(api_URL("dBike"))
    if api_dBike_Resp.status_code == 200 :
        insert_Data(api_dBike_Resp.json(),"dBike")

# Obtain API response from openweathermap API and insert it to RDS database
def dWeather_call():
    api_dBike_Resp = requests.get(api_URL("dWeather"))
    if api_dBike_Resp.status_code == 200 :
        insert_Data(api_dBike_Resp.json(),"dWeather")

def main():
    try:
        dBike_call()
        dWeather_call()
        print('Last Data entry    : at {}'.format(time.ctime()), "\ndBikeSt entries", check_Entry("dBikeS"),
              "dBikeSDy entries", check_Entry("dBikeD"), "dWeatherDy entries", check_Entry("dWeatherD"))
    except Exception as e:
        print("Error", e, datetime.now())



if __name__ == '__main__':
    main()
## ******************************************************************************************************************************************************##
