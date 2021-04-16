# Import pandas, numpy, matplotlib, seaborn libraries
import pandas as pd
from pandas.api.types import is_numeric_dtype
import datetime
import pickle

path = './RandomForest/'
# path = ''

## ************************************************************************************************************ ##

## Make Predictions on Test Data
def predictRandomForest(rf, test_features):
    try:

        # Use the forest's predict method on the test data
        predictions = rf.predict(test_features).tolist()
        return predictions

    except Exeption as e:
        print("Error in predictRandomForest", e)

## ************************************************************************************************************ ##

# ML Models needs time parameters for input [i.e. test_features] in specific format :
# dateInput = [date hour minute year month1 month2 month3 .. month12]

# get_TimeInputs() generates a dataframe congruent with ML model input format for next 5 hours by 30 minute interval w.r.t. datetimeIn
# DayOfWeek is optionally included in returned dataframe. It is required for getBike() function.

def get_TimeInputs(ts = datetime.datetime.now(), dayOfWeek = False, tStampRet = False, perHrs = 5, intervals = 30):
    try:
        tStampRetVal=[]
        data_entry_timestamp_In = ts
        ts =  pd.DataFrame([ts], columns = ['ts'])
        data_entry_timestamp_In = pd.Timestamp(data_entry_timestamp_In)
        data_entry_timestamp = data_entry_timestamp_In

        # Logic to find nearest value divisible by 10
        minutes = data_entry_timestamp_In.minute
        minutes = minutes + (30-(minutes%30))

        data_entry_timestamp = data_entry_timestamp.replace(minute = minutes) if (minutes != 60)\
                                 else  data_entry_timestamp.round('H')

         # obtain datetime range spacing 30 minutes for next "perHrs" hours by spacing of "intervals" minutes per hour
        dateRange = pd.DataFrame(pd.date_range(data_entry_timestamp, periods=perHrs*int(60/intervals), freq= str(intervals)+'min'), columns = ['ts'])
        dateRange = pd.concat([ts, dateRange]).reset_index(drop = True)
        dateRange['ts'] = pd.to_datetime(dateRange['ts'])

        # Sort datetime into dataframe
        dateRange['date'] = dateRange.ts.dt.day
        dateRange['hour'] = dateRange.ts.dt.hour
        dateRange['minute'] = dateRange.ts.dt.minute
        dateRange['year'] = dateRange.ts.dt.year
        dateRange['month'] = dateRange.ts.dt.month
        dateRange['dayOfWeek'] = dateRange.ts.dt.weekday

        # prepare onhot encodes for year and month
        mask = dateRange.year == 2020
        column_name = 'year'
        dateRange.loc[mask, column_name] = 1

        # Models is trained with month data onehot encoded for all 12 months; hence similar data
        # is introduced inorganically dataframe
        for m in range(1,13):
            mask = dateRange.month == m
            column_name = 'month'+str(m)
            dateRange[column_name] = 0
            dateRange.loc[mask, column_name] = 1

        dateRange = dateRange.drop(['month'], axis=1)

        if dayOfWeek:
            for d in range(7):
                mask = dateRange.dayOfWeek == d
                column_name = 'dayOfWeek'+str(d)
                dateRange[column_name] = 0
                dateRange.loc[mask, column_name] = 1

        dateRange = dateRange.drop(['dayOfWeek'], axis=1)

        if tStampRet:
            tStampRetVal = dateRange.ts.dt.strftime("%I:%M %p")

        dateRange = dateRange.drop(['ts'], axis=1)

        return dateRange, tStampRetVal

    except Exeption as e:
        print("Error in get_TimeInputs", e)


## ************************************************************************************************************ ##
# Dataframe of all default targetCols are returned when getWeather() is called by getBike().
# Dataframe of All targetCols is used as input to ML model for predicting station availability

def getWeather(datetimeIn = datetime.datetime.now(),targetCols = ['main_temp','main_feels_like', 'main_pressure', 'main_humidity', \
                 'main_temp_min', 'main_temp_max', 'wind_speed', 'wind_deg'],tStampReturn = False):

    try:

        test_features,tStampRetVal = get_TimeInputs(datetimeIn,tStampRet = tStampReturn)
        result = pd.DataFrame()

        for targetC in targetCols:
            # load the model
            filename = path + targetC+'.pkl'
            rfWeatherModel_loaded = pickle.load(open(filename, 'rb'))

            predictions = predictRandomForest(rfWeatherModel_loaded,test_features)
            result[targetC] = predictions

        for col in result.columns:
            if not is_numeric_dtype(result[col]):
                result[col] = result[col].astype('category')
            else:
                result[col] = result[col].astype('int')

        return result, tStampRetVal

    except Exeption as e:
        print("Error in getWeather", e)



## ************************************************************************************************************ ##

# Function which returns array of station parameters for next 5 hours by 30 minute interval w.r.t. datetimeIn
def getBike(station = 42, datetimeIn = datetime.datetime.now(), targetC = "bikes"):

    try:

        targetCols = {'bikes' : 'available_bikes', "stands" : 'available_bike_stands'}
        # datetimeIn = datetime.datetime.fromtimestamp(datetimeIn)

        weatherFeatures, tStampRetVal  = getWeather(datetimeIn)
        bikeFeatures,tStampRetVal = get_TimeInputs(ts = datetimeIn, dayOfWeek = True, tStampRet= True)
        test_features = weatherFeatures.join(bikeFeatures).values.tolist()

        result = pd.DataFrame()

        # load the model
        filename = path + 'stn'+str(station)+"_"+targetCols[targetC]+'.pkl'
        rfWeatherModel_loaded = pickle.load(open(filename, 'rb'))

        # Predict station availability for all input timestamps and predicted weather parameters
        predictions = predictRandomForest(rfWeatherModel_loaded,test_features)
        result[targetCols[targetC]] = predictions
        # Cast results as integer values
        result = result.astype(int)

        return [result[targetCols[targetC]].values.tolist(),list(tStampRetVal)]

    except Exeption as e:
        print("Error in getBike", e)



## ************************************************************************************************************ ##
# Support function which returns requested weather predictions as a list of lists

def retWeather(datetimeIn = datetime.datetime.now(),targetCols =['main_temp']):
    try:

        result = []
        # datetimeIn = datetime.datetime.fromtimestamp(datetimeIn)
        weatherFeatures,tStampRet = getWeather(datetimeIn = datetimeIn,targetCols = targetCols, tStampReturn = True)
        for col in weatherFeatures.columns:
            result.append(weatherFeatures[col].values.tolist())
        result.append(tStampRet.values.tolist())
        return result

    except Exeption as e:
        print("Error in retWeather", e)


## ************************************************************************************************************ ##
# Driver function retBikeWeather() returns list of lists consisting:

# [[Bikes Soruce], [main weather Source],[main temperature Source],\
# [Bike_stands Destination], [main weather Destination], [main_temperature Destination]]

def retBikeWeather(stations = [42,43], datetimeIP = [datetime.datetime.now(), datetime.datetime.now()], targetC = ["bikes", "stands"]):
    try:

        result = []
        # datetimeIn = datetime.datetime.fromtimestamp(datetimeIn)
        for (station,datetimeIn, targetC) in zip(stations, datetimeIP, targetC):
            datetimeIn = datetime.datetime.fromtimestamp(datetimeIn)
            bData = getBike(station = station, datetimeIn = datetimeIn, targetC = targetC)
            result.append(bData)
            wData = retWeather(datetimeIn = datetimeIn,targetCols =['weather_main'])
            result.append(wData)
            tData = retWeather(datetimeIn = datetimeIn, targetCols =['main_temp'])
            result.append(tData)

        return result

    except Exeption as e:
        print("Error in retBikeWeather", e)
