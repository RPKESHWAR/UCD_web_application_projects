// global variables:

// It will show all markers
var map;

//Use for direction api
var directionsService;
var directionsRenderer;

// all static data from database
var station_data;
var all_station_data;

//User starting location
var source_station;

//User end location
var destination_station;


// User departure and destination time
var dept_hr;
var dept_min;
var dept_timezone;
var destination_hr;
var destination_min;
var destination_timezone;

// Current system time
var current_hr;
var current_min;
var current_timezone;
var current_address;
var current_year;
var current_date;
var current_month;

var station_number;
var current_marker_val;


//lat long value
var lat1;
var lat2;
var lon1;
var lon2;

//Alert box
var is_alert = false;

// Initialize google map
function initMap() {

    //Map options
    var options = {
        zoom:14,
        center:{lat: 53.35677, lng: -6.26814},
    }

    //Direction services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();


    // New map
    map = new google.maps.Map(document.getElementById('map'), options);
    directionsRenderer.setMap(map);
}


// On System load call
$(document).ready(function () {

    //comment all console call
    console.log = function() {}


    //Hide toaster
    $('#toaster_block_search_result').hide();

    // Get all stations
    $.ajax({
        type: "GET",
        url: '/get_data',
        dataType: 'json',
        data: {},
        error: function(xhr, error){
            console.log(xhr); console.log(error);

        },
        success: ((data)=>{
            console.log('data', data);
            // Show the stations
            $('#main_content').show();
            // Hide loading
            $('#station_div').hide();
            // save the response in variable
            all_station_data = data;
            //call respective method
            get_static_data(data);
            load_all_station(data);
        })
    });

    // Get current weather data
    $.ajax({
        type: "GET",
        url: '/current_weather',
        dataType: 'json',
        data: {},
        error: function(xhr, error){
            console.log(xhr); console.log(error);
        },
        success: ((data)=>{
            // send response to weather function
            get_current_weather(data)
        })
    });
});

// This function update current weather on weather card
function get_current_weather(weather_data) {
    console.log(weather_data);
    // If weather is rainy update the icon
    if(weather_data[0].weather_main === 'Rain' ){
        $('#is_rain').show();
    }
    // If weather is Clear update the icon
    else if(weather_data[0].weather_main === 'Clear'){
        $('#is_cloud').show();
    }
    // If weather is Drizzle update the icon
    else if(weather_data[0].weather_main === 'Drizzle' ){
        $('#is_thunder').show();
    }
    // Update the cloud icon
    else{
        $('#is_cloud').show();
    }
    // Update inner html of respective weather card
    document.getElementById('main_temp').innerHTML = weather_data[0].main_temp + '&deg;C';
    document.getElementById('weather_current_time').innerHTML = current_hr + ":"+ current_min;
}

// load the markers
function get_static_data(staticData){

    //Array of markers
    var markers = staticData;

    //Loop through the marker
    for(var i = 0; i < markers.length; i++){
        var m = markers[i];
        (function (myMarker) {
            setTimeout(function() {
                // each marker in been added
                addMarker(myMarker );
            }, i * 15);
        }(m));

    }


    //Add Marker Function
    function addMarker(data) {
        if(!data){
            console.log('data not found');
            alert('Sorry data not found');
        }

        //Marker configuration
        var marker = new google.maps.Marker({
            position: {lat: data.position_lat, lng: data.position_lng},
            map: map,
            animation: google.maps.Animation.DROP,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8.5,
                fillColor: "#F00",
                fillOpacity: 0.8,
                strokeWeight: 0.4
            },
        });


        if (!marker){
            console.log('Not found')
            alert('Sorry Marker cannot be set')
        }

        marker.addListener('click', function () {
            // Update Marker station data
            get_station_data(data,marker);
        })
    }
}

// Get on click station data
function get_station_data(station,marker) {
    // Store respective station number
    station_number = station.number;
    // create object for post call with data as station number
    var data = {station_number: station.number}
    $.ajax({
        url: '/station_data',
        data: JSON.stringify(data),
        type: 'POST',
        success: function (response) {
            // Save the data about station in variable
            station_data = response;
            // Call the add bike function
            add_bike_info(station.name,station_data[0],marker);
        },
        error: function (error) {
            alert("Error, while loading data");
            console.log(error);
        },
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
    });

}

// all clicked markers info
var all_marker_val = [];
function add_bike_info(address,data,marker) {
    // Save station name
    current_address = address;
    //Check content:
    if (data) {

        // Updated Information popup
        var updated_content = " <p>Station Name: "+address + "<br/> "+"Available Bikes: "+ data.available_bikes+"<br/>"+" Available Bike stands: "+ data.available_bike_stands+"</p>"+`<button class="get_history" onClick="get_history(event)">Station Info</button>`
        marker.infoWindow = new google.maps.InfoWindow({
            content: updated_content
        })


        if (marker.getAnimation() !== null) {
            all_marker_val.forEach((marker)=>{data
                marker.setAnimation(null);
            })

        } else {
            all_marker_val.forEach((marker)=>{
                marker.setAnimation(null);
                console.log('switihing');
                $('#all_history').hide();
                marker.infoWindow.close()
            })
            all_marker_val.push(marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
        // Open info window
        marker.infoWindow.open(map, marker);
        current_marker_val = marker;


    }else{
        alert("Please try again later")
    }
    // Infowindow click function
    google.maps.event.addListener(marker.infoWindow,'closeclick',function(){
        console.log('close click called');
        $('#all_history').hide();
        marker.setAnimation(null);
    })

}


// Load station data in select box
function load_all_station(station_data){

    // Source stations
    var ul = document.getElementById("station_depart");
    for (var i = 0; i < station_data.length; i++) {
        var name = station_data[i].name;
        var li = document.createElement('li');


        var att2 = document.createAttribute("onclick");       // Create a "Click" attribute
        att2.value = "get_source_val(event)";
        li.setAttributeNode(att2);

        li.appendChild(document.createTextNode(name));
        ul.appendChild(li);
    }

    // Destination stations
    var ul_recieved = document.getElementById("station_received");
    for (var i = 0; i < station_data.length; i++) {
        var name = station_data[i].name;
        var li_received = document.createElement('li');

        var att = document.createAttribute("onclick");       // Create a "Click" attribute
        att.value = "get_destination_val(event)";
        li_received.setAttributeNode(att);

        li_received.appendChild(document.createTextNode(name));
        ul_recieved.appendChild(li_received);
    }
}



//get_history
function get_history(event) {

    console.log('current_address',current_address);
    // Check if chart exist, If found destroy previous chart

    if(chart_bike_history){
        chart_bike_history.destroy();
    }
    if(chart_bike_history_stand){
        chart_bike_history_stand.destroy();
    }

    if(chart_bike_history_avl_daily){
        chart_bike_history_avl_daily.destroy();
    }

    if(chart_bike_history_avl_stand){
        chart_bike_history_avl_stand.destroy();
    }

    console.log('station_number',station_number);

    // Show loader
    $('#station_history_check').show();

    // Ajax request for station history
    var data = {station_number: station_number,type:"bikes"};
    $.ajax({
        url: '/get_station_history',
        data: JSON.stringify(data),
        type: 'POST',
        success: function (response) {
            console.log('Station history', response);
            // Stop the loader
            $('#station_history_check').hide();

            $("#all_history").animate({ scrollTop: $('#all_history').prop("scrollHeight")}, 1000);

            var chart_history = document.getElementsByClassName("station_history");
            for (var i=0; i<chart_history.length; i++) {
                chart_history[i].style.display = "block";
            }

            bike_history(response[0],response[1],response[2],response[3],response[4],response[5],response[6],response[7])
        },
        error: function (error) {
            $('#station_history_check').hide();
            alert("Error, while loading data");
            console.log(error);
        },
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
    });

}


// Bike History chart with Apexjs:
function bike_history(xaxis, yaxis,chart2_1,chart2_2,chart3_1,chart3_2,chart4_1,chart4_2) {

    // Remove animation and info window
    // current_marker_val.infoWindow.close();
    // current_marker_val.setAnimation(null);


    // First Chart
    document.getElementById('weekly_bike_val').innerHTML = 'Weekly Available bikes at :'+ current_address;

    // Chart
    var options_bike = {
        chart: {
            type: 'bar'
        },
        colors:['#7ed56f'],
        series: [{
            name: 'Average Available bikes',
            data: yaxis
        }],
        xaxis: {
            categories: xaxis,

        }
    }


    chart_bike_history_stand = new ApexCharts(document.querySelector("#chart_bike_history"), options_bike);
    chart_bike_history_stand.render();

    // Second chart

    document.getElementById('daily_bike_val_avl').innerHTML = 'Last 24 hours available bikes at :'+ current_address;
    document.getElementById('daily_bike_val_avl').style['color'] = '#7ed56f';


    // Chart
    var options_bike_daily_avl = {
        chart: {
            type: 'area'
        },
        stroke: {
            curve: 'smooth',
        },
        colors:['#7ed56f'],
        series: [{
            name: 'Available bikes',
            data: chart2_2
        }],
        xaxis: {
            categories: chart2_1

        }
    }


    chart_bike_history_avl_daily = new ApexCharts(document.querySelector("#chart_bike_history_avl_daily"), options_bike_daily_avl);
    chart_bike_history_avl_daily.render();


    // Third chart

    document.getElementById('weekly_bike_stand').innerHTML = 'Weekly available Stands at :'+ current_address;
    document.getElementById('weekly_bike_stand').style['color'] = '#00BFFF';


    // Chart
    var options_bike_stands_avl = {
        chart: {
            type: 'bar'
        },
        colors:['#00BFFF'],
        series: [{
            name: 'Average Available stands',
            data: chart3_2
        }],
        xaxis: {
            categories: chart3_1

        }
    }


    chart_bike_history_stand = new ApexCharts(document.querySelector("#chart_bike_history_stands"), options_bike_stands_avl);
    chart_bike_history_stand.render();


    // Fourth chart

    document.getElementById('daily_bike_val_stand').innerHTML = 'Last 24 hours available Stands at :'+ current_address;
    document.getElementById('daily_bike_val_stand').style['color'] = '#00BFFF';


    // Chart
    var options_bike_stands_daily_avl = {
        chart: {
            type: 'area'
        },
        stroke: {
            curve: 'smooth',
        },
        colors:['#00BFFF'],
        series: [{
            name: 'Available stands',
            data: chart4_2
        }],
        xaxis: {
            categories: chart4_1

        }
    }


    chart_bike_history_avl_stand = new ApexCharts(document.querySelector("#chart_bike_history_stand_daily"), options_bike_stands_daily_avl);
    chart_bike_history_avl_stand.render();


}





function get_source_val(event) {
    source_station = event.target.innerHTML;
    document.getElementById('source_station').innerHTML = event.target.innerHTML;
}

function get_destination_val(event){
    destination_station = event.target.innerHTML;
    document.getElementById('destination_station').innerHTML = event.target.innerHTML;
}

// Time picker from source
$(document).ready(function(){

    // This function will split the respective time and update the the hour and minutes block with new data
    var c_time=ct(new Date());
    var hr=parseInt(c_time.split(':')[0]);
    var min=parseInt(c_time.split(':')[1]);
    var meridiem=c_time.split(':')[2];
    $('.tp-min>span').html(min<10?'0'+min:min);
    $('.tp-hr>span').html(hr);
    $('.tp-am-pm').html(meridiem);
    $('.tp-hr>.tp-up-arrow').click(function(){
        hr=parseInt($('.tp-hr>span').html());
        hr=(hr==1?12:hr-=1);
        $('.tp-hr>span').html(hr);
    });
    $('.tp-min>.tp-up-arrow').click(function(){
        min=parseInt($('.tp-min>span').html());
        min=(min==0?59:min-=1);
        $('.tp-min>span').html(min<10?'0'+min:min);
    });
    $('.tp-hr>.tp-down-arrow').click(function(){
        hr=parseInt($('.tp-hr>span').html());
        hr=(hr==12?1:hr+=1);
        $('.tp-hr>span').html(hr);
    });
    $('.tp-min>.tp-down-arrow').click(function(){
        min=parseInt($('.tp-min>span').html());
        min=(min==59?0:min+=1);
        $('.tp-min>span').html(min<10?'0'+min:min);
    });
    $('.tp-am-pm').click(function(){
        meridiem=meridiem=='AM'?'PM':'AM';
        $('.tp-am-pm').html(meridiem);
    });
    $('.tp-hr').on('wheel', function(event){
        var oEvent = event.originalEvent,
            delta  = oEvent.deltaY || oEvent.wheelDelta;
        if (delta > 0) {
            hr=(hr==12?1:hr+=1);
        } else {
            hr=(hr==1?12:hr-=1);
        }
        $('.tp-hr>span').html(hr);
    });
    $('.tp-min').on('wheel', function(event){
        var oEvent = event.originalEvent,
            delta  = oEvent.deltaY || oEvent.wheelDelta;
        if (delta > 0) {
            min=(min==59?0:min+=1);
        } else {
            min=(min==0?59:min-=1);
        }
        $('.tp-min>span').html(min<10?'0'+min:min);
    });
    $(".tp-hr>span").click(function() {
        this.focus();
        $('.tp-hr>span').html('&nbsp;');
        $(this).keyup(function(e) {
            console.log(e.keyCode);
            $('.tp-hr>span').html();
            if(/[0-9]/.test(e.key)) {
                var cVal=$('.tp-hr>span').html();
                if(cVal=='&nbsp;') {
                    $('.tp-hr>span').html(e.key);
                } else {
                    if(cVal==0) {
                        $('.tp-hr>span').append(e.key);
                        exitHr(this,$(this));
                    } else if(cVal==1) {
                        if(/[0-2/]/.test(e.key)) {
                            $('.tp-hr>span').append(e.key);
                            exitHr(this,$(this));
                        } else {
                            $('.tp-hr>span').html(e.key);
                        }
                    } else {
                        $('.tp-hr>span').html(e.key);
                    }
                }
            } else if((/13|9/.test(e.keyCode))||(/:/.test(e.key))) {
                exitHr(this,$(this));
            }
        });
    });

    $(".tp-min>span").click(function() {
        this.focus();
        $('.tp-min>span').html('&nbsp;');
        $(this).keyup(function(e) {
            $('.tp-min>span').html();
            if(/[0-9]/.test(e.key)) {
                var cVal=$('.tp-min>span').html();
                if((cVal=='&nbsp;')&&(/[0-5]/.test(e.key))) {
                    $('.tp-min>span').html(e.key);
                } else {
                    $('.tp-min>span').append(e.key);
                    exitMin(this,$(this));
                }
            } else if((/13|9/.test(e.keyCode))||(/:/.test(e.key))) {
                exitMin(this,$(this));
            }
        });
    });
    $('.tp-hr>span').blur(function(){
        var a=$('.tp-hr>span').html();
        if((a=='')||(a=='&nbsp;')) {
            var hr=parseInt(ct(new Date()).split(':')[0]);
            $('.tp-hr>span').html(hr);
        }
    });
    $('.tp-min>span').blur(function(){
        var a=$('.tp-min>span').html();
        if((a=='')||(a=='&nbsp;')) {
            var min=parseInt(ct(new Date()).split(':')[1]);
            $('.tp-min>span').html(min);
        }
    });
});

// Time picker for destination [ This method is same as above only it will affect on destination time]
$(document).ready(function(){
    var c_time=ct(new Date());
    var hr=parseInt(c_time.split(':')[0]);
    var min=parseInt(c_time.split(':')[1]);
    var meridiem=c_time.split(':')[2];
    $('.tp-min-destination>span').html(min<10?'0'+min:min);
    $('.tp-hr-destination>span').html(hr);
    $('.tp-am-pm-destination').html(meridiem);
    $('.tp-hr-destination>.tp-up-arrow-destination').click(function(){
        hr=parseInt($('.tp-hr-destination>span').html());
        hr=(hr==1?12:hr-=1);
        $('.tp-hr-destination>span').html(hr);
    });
    $('.tp-min-destination>.tp-up-arrow-destination').click(function(){
        min=parseInt($('.tp-min-destination>span').html());
        min=(min==0?59:min-=1);
        $('.tp-min-destination>span').html(min<10?'0'+min:min);
    });
    $('.tp-hr-destination>.tp-down-arrow-destination').click(function(){
        hr=parseInt($('.tp-hr-destination>span').html());
        hr=(hr==12?1:hr+=1);
        $('.tp-hr-destination>span').html(hr);
    });
    $('.tp-min-destination>.tp-down-arrow-destination').click(function(){
        min=parseInt($('.tp-min-destination>span').html());
        min=(min==59?0:min+=1);
        $('.tp-min-destination>span').html(min<10?'0'+min:min);
    });
    $('.tp-am-pm-destination').click(function(){
        meridiem=meridiem=='AM'?'PM':'AM';
        $('.tp-am-pm-destination').html(meridiem);
    });
    $('.tp-hr-destination').on('wheel', function(event){
        var oEvent = event.originalEvent,
            delta  = oEvent.deltaY || oEvent.wheelDelta;
        if (delta > 0) {
            hr=(hr==12?1:hr+=1);
        } else {
            hr=(hr==1?12:hr-=1);
        }
        $('.tp-hr-destination>span').html(hr);
    });
    $('.tp-min-destination').on('wheel', function(event){
        var oEvent = event.originalEvent,
            delta  = oEvent.deltaY || oEvent.wheelDelta;
        if (delta > 0) {
            min=(min==59?0:min+=1);
        } else {
            min=(min==0?59:min-=1);
        }
        $('.tp-min-destination>span').html(min<10?'0'+min:min);
    });
    $(".tp-hr-destination>span").click(function() {
        this.focus();
        $('.tp-hr-destination>span').html('&nbsp;');
        $(this).keyup(function(e) {
            console.log(e.keyCode);
            $('.tp-hr-destination>span').html();
            if(/[0-9]/.test(e.key)) {
                var cVal=$('.tp-hr-destination>span').html();
                if(cVal=='&nbsp;') {
                    $('.tp-hr-destination>span').html(e.key);
                } else {
                    if(cVal==0) {
                        $('.tp-hr-destination>span').append(e.key);
                        exitHr_destination(this,$(this));
                    } else if(cVal==1) {
                        if(/[0-2/]/.test(e.key)) {
                            $('.tp-hr-destination>span').append(e.key);
                            exitHr_destination(this,$(this));
                        } else {
                            $('.tp-hr-destination>span').html(e.key);
                        }
                    } else {
                        $('.tp-hr-destination>span').html(e.key);
                    }
                }
            } else if((/13|9/.test(e.keyCode))||(/:/.test(e.key))) {
                exitHr_destination(this,$(this));
            }
        });
    });

    $(".tp-min-destination>span").click(function() {
        this.focus();
        $('.tp-min-destination>span').html('&nbsp;');
        $(this).keyup(function(e) {
            $('.tp-min-destination>span').html();
            if(/[0-9]/.test(e.key)) {
                var cVal=$('.tp-min-destination>span').html();
                if((cVal=='&nbsp;')&&(/[0-5]/.test(e.key))) {
                    $('.tp-min-destination>span').html(e.key);
                } else {
                    $('.tp-min-destination>span').append(e.key);
                    exitMin_destination(this,$(this));
                }
            } else if((/13|9/.test(e.keyCode))||(/:/.test(e.key))) {
                exitMin_destination(this,$(this));
            }
        });
    });
    $('.tp-hr-destination>span').blur(function(){
        var a=$('.tp-hr-destination>span').html();
        if((a=='')||(a=='&nbsp;')) {
            var hr=parseInt(ct(new Date()).split(':')[0]);
            $('.tp-hr-destination>span').html(hr);
        }
    });
    $('.tp-min-destination>span').blur(function(){
        var a=$('.tp-min-destination>span').html();
        if((a=='')||(a=='&nbsp;')) {
            var min=parseInt(ct(new Date()).split(':')[1]);
            $('.tp-min-destination>span').html(min);
        }
    });
});

// Source Value
function exitHr(a,b) {
    a.blur();
    b.off('keyup');
    $(".tp-min>span").trigger( "click" );
}
function exitMin(a,b) {
    a.blur();
    b.off('keyup');
}


// To destination
function exitHr_destination(a,b) {
    a.blur();
    b.off('keyup');
    $(".tp-min-destination>span").trigger( "click" );
}
function exitMin_destination(a,b) {
    a.blur();
    b.off('keyup');
}

// Function that will convert in 12 hour format
function ct(date) {
    var hrs = date.getHours();
    var mns = date.getMinutes();
    var mer = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    mns = mns < 10 ? '0'+mns : mns;
    console.log(hrs);
    current_hr = hrs;
    current_min = mns;
    current_timezone = mer;
    console.log(mns);
    console.log(mer);

    current_year = date.getFullYear();
    current_month = date.getMonth();
    current_date = date.getDate();
    return (hrs + ':' + mns + ':' + mer);
}



// Dropdown Menu For Source and Destination
$('.dropdown').click(function () {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);
});
$('.dropdown').focusout(function () {
    $(this).removeClass('active');
    $(this).find('.dropdown-menu').slideUp(300);
});
$('.dropdown .dropdown-menu li').click(function () {
    console.log( $(this).parents('.dropdown').find('span').text($(this).text()));
    console.log($(this).parents('.dropdown').find('input').attr('value', $(this).attr('id')))
    $(this).parents('.dropdown').find('span').text($(this).text());
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
});
/*End Dropdown Menu*/


$('.dropdown-menu li').click(function () {
    console.log('drop value');
    var input = '<strong>' + $(this).parents('.dropdown').find('input').val() + '</strong>',
        msg = '<span class="msg">Hidden input value: ';
    $('.msg').html(msg + input + '</span>');
});

//Update departure time
function get_depart_time() {
    dept_hr = document.getElementsByClassName('tp-hr')[0].innerText;
    dept_min = document.getElementsByClassName('tp-min')[0].innerText;
    dept_timezone = document.getElementsByClassName('tp-am-pm')[0].innerText;

}

//Update destination time
function get_destination_time() {
    destination_hr = document.getElementsByClassName('tp-hr-destination')[0].innerText;
    destination_min = document.getElementsByClassName('tp-min-destination')[0].innerText;
    destination_timezone = document.getElementsByClassName('tp-am-pm-destination')[0].innerText;

}

// Initialize chart value
var chart_bike_avl;
var chart_bike_stand;
var chart_bike_history;
var chart_bike_history_stand;
var chart_bike_history_avl_daily;
var chart_bike_history_avl_stand;

//Get Latitude and lon
function get_lat_long(){
    // Filter the data based on station name
    var filtered_source_station_data = all_station_data.filter((station)=>{
        return station.name === source_station
    });
    //Update the lat and long for source
    if(filtered_source_station_data){
        lat1 = filtered_source_station_data[0].position_lat;
        lon1 = filtered_source_station_data[0].position_lng;
    }
    // Filter the data based on station name
    var filtered_destination_station_data = all_station_data.filter((station)=>{
        return station.name === destination_station
    });
    //Update the lat and long for destination

    if(filtered_source_station_data){
        lat2 = filtered_destination_station_data[0].position_lat;
        lon2 = filtered_destination_station_data[0].position_lng;
    }

}


//Search button result
function get_search_result(){
    // Hide Error toaster
    $('#toaster_block_search_result').hide();

    // Update respective departure and destination time with lat and long
    ct(new Date());
    get_depart_time();
    get_destination_time();
    get_lat_long();


    // Remove previous chart for search bike
    if(chart_bike_avl){
        chart_bike_avl.destroy();
    }

    if(chart_bike_stand){
        chart_bike_stand.destroy();
    }

    console.log('source_station',source_station);

    // Variable for authentication
    var isVerified = false;
    var time_varified = false;

    //Check if source and destination station should not be same value or undefined
    if(source_station !== destination_station && source_station !== undefined && destination_station !== undefined){
        isVerified = true;
    }else{
        //Error alert
        is_alert = true;
        document.getElementById('toast_search_error').innerHTML = "Please check source and destination";
        $('#toaster_block_search_result').show();
    }

    // Once verified proceed further
    if(isVerified){
        //convert all time in numbers
        dept_min = parseInt(dept_min);
        destination_min = parseInt(destination_min);
        current_min = parseInt(current_min);
        dept_hr = parseInt(dept_hr);
        destination_hr = parseInt(destination_hr);
        current_hr = parseInt(current_hr);
        console.log("current_hr",current_hr);

        // During PM update the hour in 24 hr clock
        if(current_timezone === 'PM' && current_hr !== 12){
            current_hr = 12 + parseInt(current_hr);
        }

        if(dept_timezone === 'PM'){
            dept_hr = 12 + parseInt(dept_hr);``
        }
        if(destination_timezone === 'PM'){
            destination_hr = 12 + parseInt(destination_hr);
        }

        // Create Unix time stamp for API request
        var departure_date_api = new Date(current_year,current_month,current_date,dept_hr,dept_min).getTime() / 1000;
        var destination_date_api = new Date(current_year,current_month,current_date,destination_hr,destination_min).getTime() / 1000;

        // Departure time hour should be greater than or equal to current system hour
        if(dept_hr >= current_hr){
            console.log('part1');
            time_varified = true;
            if(dept_hr === current_hr && dept_min < current_min){
                time_varified = false;
                console.log('Checking1');
            }
            // If above condition satisfies the  go ahead
            if(time_varified === true){
                // Check if departure hour is less or equal to destination time
                if(dept_hr <= destination_hr){
                    if(dept_hr === destination_hr && dept_min >= destination_min){
                        time_varified = false;
                    }
                    // If above all conditions satisfies
                    if(time_varified){
                        console.log('all conditions checked');
                        // Show loader
                        $('#book_bike_result').show();


                        // Ajax call to get search information
                        var data = {
                            source_station_number: 4,
                            destination_station_number:42,
                            departure_date_api:departure_date_api,
                            destination_date_api:destination_date_api,
                        };
                        $.ajax({
                            url: '/get_prediction',
                            data: JSON.stringify(data),
                            type: 'POST',
                            success: function (response) {
                                console.log('Station Prediction', response);

                                //Update direction between two markers
                                calc_route_map()

                                // Hide loader
                                $('#book_bike_result').hide();

                                // Display chart
                                var chart = document.getElementsByClassName("show_chart");
                                for (var i=0; i<chart.length; i++) {
                                    chart[i].style.display = "block";
                                }
                                // send information to chart
                                get_bike_chart(response)
                            },
                            error: function (error) {
                                // Show alert
                                if(!is_alert){
                                    document.getElementById('toast_search_error').innerHTML = "Error, while loading data";
                                    $('#toaster_block_search_result').show();
                                }
                                console.log(error);
                            },
                            dataType: "json",
                            contentType: 'application/json;charset=UTF-8',
                        });

                    }else{
                        if(!is_alert){
                            document.getElementById('toast_search_error').innerHTML = "Please check your departure or destination time";
                            $('#toaster_block_search_result').show();
                        }
                    }

                } else {
                    if(!is_alert){
                        document.getElementById('toast_search_error').innerHTML = "Please check your destination hour'";
                        $('#toaster_block_search_result').show();
                    }
                }
            }else{
                console.log('Problem');
                if(!is_alert){
                    document.getElementById('toast_search_error').innerHTML = "Your departure time should be greater than or equal to current time";
                    $('#toaster_block_search_result').show();
                }
            }

        }else {
            if(!is_alert){
                document.getElementById('toast_search_error').innerHTML = "Your departure time is les than current time";
                $('#toaster_block_search_result').show();
            }
        }
    }else {
        if(!is_alert){
            document.getElementById('toast_search_error').innerHTML = "Please check source and destination";
            $('#toaster_block_search_result').show();
        }
    }

    // Hide block
    if(!time_varified || !isVerified){
        var chart_val = document.getElementsByClassName("show_chart");
        for (var i=0; i<chart_val.length; i++) {
            chart_val[i].style.display = "none";
        }
    }

}

// Get directions
function calc_route_map() {
    var start;
    var end;

    // If latitude and longitude value found
    if(lat1 && lat2 && lon1 && lon2){
        start = new google.maps.LatLng(lat1, lon1);
        end = new google.maps.LatLng(lat2, lon2);
    }else{
        start = source_station+', ie';
        end = destination_station+', ie';
    }

    var request = {
        origin: start,
        destination: end,
        travelMode: 'BICYCLING'
    };
    // Direction initialization
    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
            directionsRenderer.setOptions( { suppressMarkers: true } );

        }
    });


}


// Not in use now
function get_current_search() {
    $('#search_result').show();
    document.getElementById('avl_bike_search').innerHTML = "Available Bikes: 14";
    document.getElementById('avl_bike_weather_search').innerHTML = "Current Weather: 14 &deg;C";
    document.getElementById('avl_bike_stand_search').innerHTML = "Available Bikes Stands: 20";
    document.getElementById('avl_bike_stand_weather_search').innerHTML = " Current Weather: 14 &deg;C";
}


// Bike chart
function get_bike_chart(prediction_data) {

    // Update inner html data name
    document.getElementById('heading-bikes_avl').innerHTML = 'Available Bikes at: '+source_station;
    document.getElementById('heading-bikes_stand').innerHTML = 'Available Bike stands at: '+destination_station;

    // Available Bikes
    var current_bike_val = prediction_data[0][0][0];
    var current_bike_time =prediction_data[0][1][0];
    var avl_bikes_val = prediction_data[0][0];
    // Removed first element in array as this value already stored and not required for future prediction
    avl_bikes_val.splice(0,1);
    // Removed first element in array as this value already stored and not required for future prediction
    var avl_bikes_time =prediction_data[0][1];
    avl_bikes_time.splice(0,1);

    // Available Stands
    var current_bike_val_destination = prediction_data[3][0][0];
    var current_bike_time_destination =prediction_data[3][1][0];
    var avl_stands_val = prediction_data[3][0];
    // Removed first element in array as this value already stored and not required for future prediction
    avl_stands_val.splice(0,1);
    var avl_stands_time =prediction_data[3][1];
    // Removed first element in array as this value already stored and not required for future prediction
    avl_stands_time.splice(0,1);

    console.log('avl_stands_val',avl_stands_val);
    console.log('avl_stands_time',avl_stands_time);
    console.log('avl_bikes_val',avl_bikes_val);
    console.log('avl_bikes_time',avl_bikes_time);

    // Chart for search
    var options_bike = {
        chart: {
            type: 'bar'
        },
        colors:['#7ed56f'],
        series: [{
            name: 'Available bikes',
            data: avl_bikes_val,
        }],
        xaxis: {
            categories: avl_bikes_time
        }
    }


    chart_bike_avl = new ApexCharts(document.querySelector("#chart_bike"), options_bike);
    chart_bike_avl.render();

    //Add weather for available bikes
    // Current  Weather
    var current_weather_val = prediction_data[2][0][0];
    var current_weather_val_destination = prediction_data[5][0][0];
    var current_weather_val_type = prediction_data[1][0][0];
    var current_weather_val_destination_type = prediction_data[4][0][0];




    // Get Current search result
    document.getElementById('avl_bike_search').innerHTML = "Available Bikes at "+ source_station+": "+ current_bike_val;
    document.getElementById('avl_bike_weather_search').innerHTML = "Current Weather at "+source_station+": "+ current_weather_val_type + "/"+current_weather_val+"&deg;C";
    document.getElementById('avl_bike_stand_search').innerHTML = "Available Bike Stands at "+destination_station+": "+current_bike_val_destination;
    document.getElementById('avl_bike_stand_weather_search').innerHTML = " Current Weather at "+destination_station+": "+current_weather_val_destination_type+"/"+current_weather_val_destination +"&deg;C";
    $('#search_result').show();


    var weather_prediction_source =prediction_data[1][0];
        // Removed first element in array as this value already stored and not required for future prediction
    weather_prediction_source.splice(0,1);
    var weather_prediction_destination =prediction_data[4][0];
    weather_prediction_destination.splice(0,1);

    //Temperature value
    var weather_temp_source = prediction_data[2][0];
    // Removed first element in array as this value already stored and not required for future prediction
    weather_temp_source.splice(0,1);

    var weather_temp_destination = prediction_data[5][0];
    // Removed first element in array as this value already stored and not required for future prediction
    weather_temp_destination.splice(0,1);



    var dept_value_time;
    if(dept_min < 30){
        dept_value_time = dept_hr;
    }else {
        dept_value_time = dept_hr+0.50;
    }
    var new_predicted_dept_value = [dept_value_time,dept_value_time+0.5,dept_value_time+1,dept_value_time+1.5,dept_value_time+2,dept_value_time+2.5,dept_value_time+3,dept_value_time+3.5,dept_value_time+4,dept_value_time+4.5];
    console.log('new_predicted_dept_value',new_predicted_dept_value);

    var destination_value_time;
    if(destination_min < 30){
        destination_value_time = destination_hr;
    }else {
        destination_value_time = destination_hr+0.50;
    }

    var new_predicted_destination_value = [destination_value_time,destination_value_time+0.5,destination_value_time+1,destination_value_time+1.5,destination_value_time+2,destination_value_time+2.5,destination_value_time+3,destination_value_time+3.5,destination_value_time+4,destination_value_time+4.5];
    console.log('new_predicted_destination_value',new_predicted_destination_value);

    // Update weather card
    var weather_div ='';
    for (var i=0; i < new_predicted_dept_value.length; i++){
        if(weather_prediction_source[i] === 'Drizzle' || weather_prediction_source[i] === 'Rain' ){
            weather_div += `<div class=\"weather-card\"><div class=\"weather-icon cloud\"></div><h1>${weather_temp_source[i]}&deg;C</h1></div>`
        }else if(new_predicted_dept_value[i] < 15){
            weather_div += `<div class=\"weather-card\"><div class=\"weather-icon sun\"></div><h1>${weather_temp_source[i]}&deg;C</h1></div>`
        }else if(new_predicted_dept_value[i] >= 15 && new_predicted_dept_value[i] < 20 ){
            weather_div += `<div class=\"weather-card sunset_color\"><div class=\"weather-icon sunset\"></div><h1>${weather_temp_source[i]}&deg;C</h1></div>`
        }else {
            weather_div += `<div class=\"weather-card moon_color\"><div class=\"weather-icon moon\"></div><h1>${weather_temp_source[i]}&deg;C</h1></div>`
        }
    }

    document.getElementById('avl_weather_wrap').innerHTML = weather_div;

    var weather_destination_div='';
    console.log('weather_prediction_destination', weather_prediction_destination);
    for (var i=0; i < new_predicted_destination_value.length; i++){
        if(weather_prediction_destination[i] === 'Drizzle' || weather_prediction_destination[i] === 'Rain' ){
            weather_destination_div += `<div class=\"weather-card\"><div class=\"weather-icon cloud\"></div><h1>${weather_temp_destination[i]}&deg;C</h1></div>`

        }else if(new_predicted_destination_value[i] < 15){
            weather_destination_div += `<div class=\"weather-card\"><div class=\"weather-icon sun\"></div><h1>${weather_temp_destination[i]}&deg;C</h1></div>`

        }else if(new_predicted_destination_value[i] >= 15 && new_predicted_destination_value[i] < 20 ){
            weather_destination_div += `<div class=\"weather-card sunset_color\"><div class=\"weather-icon sunset\"></div><h1>${weather_temp_destination[i]}&deg;C</h1></div>`
        }else{
            weather_destination_div += `<div class=\"weather-card moon_color\"><div class=\"weather-icon moon\"></div><h1>${weather_temp_destination[i]}&deg;C</h1></div>`
        }
    }

    document.getElementById('destination_weather_wrap').innerHTML = weather_destination_div;





    // Bike stand
    var options_stand = {
        chart: {
            type: 'bar'
        },
        colors:['#7ed56f'],
        series: [{
            name: 'Available bike stands',
            data: avl_stands_val,
        }],
        xaxis: {
            categories: avl_stands_time
        }
    }


    chart_bike_stand = new ApexCharts(document.querySelector("#chart_stand"), options_stand);

    chart_bike_stand.render();


}



// Scroll Clicks:

//Get station

$("#map").click(function() {
    $('html, body').animate({
        scrollTop: $("#map").offset().top
    }, 2000);
});


// Book a bike

$("#book_bike").click(function() {
    $('html, body').animate({
        scrollTop: $("#book_bike").offset()
    }, 2000);
});


//Error toaster code
$('.toast__close').click(function(e){
    is_alert = false;
    console.log('is_alert',is_alert);
    e.preventDefault();
    $('#toaster_block_search_result').hide();

});


