import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'axios';
import { API_URL } from '../constants';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
// import ToggleButton from '@material-ui/lab/ToggleButton';
// import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Switch from '@material-ui/core/Switch';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import Tooltip from '@material-ui/core/Tooltip';
// import Divider from '@material-ui/core/Divider';
import RouteSuggestion from './RouteSuggestion';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LinearProgress from '@material-ui/core/LinearProgress';
import Card from '@material-ui/core/Card';
import CloudRoundedIcon from '@material-ui/icons/CloudRounded';
import WbSunnyRoundedIcon from '@material-ui/icons/WbSunnyRounded';
import GrainRoundedIcon from '@material-ui/icons/GrainRounded';
import AcUnitRoundedIcon from '@material-ui/icons/AcUnitRounded';
import FlashOnRoundedIcon from '@material-ui/icons/FlashOnRounded';
import Chip from '@material-ui/core/Chip';

const google = window.google;
const markersInfoWindow = [];
const markersOnMap = [];
var sourceMarker = null;
var destinationMarker = null;
var mapObj;
var directionRendererArray = [];
var routeDataArray = [];
var allBusStopsArray = [];

const closeAllOtherInfo = () => {
    for (var i = 0; i < markersInfoWindow.length; i++) {
        markersInfoWindow[i].close();
    }
}

const clearAllMarkersForStart = () => {
    if (destinationMarker === null) {
        for (var i = 0; i < markersOnMap.length; i++) {
            markersOnMap[i].setMap(null);
        }
    } else {
        for (var j = 0; j < markersOnMap.length; j++) {
            if (markersOnMap[j].get("stop_id") !== destinationMarker.get('stop_id')) {
                markersOnMap[j].setMap(null);
            }
        }
    }
}

const clearAllMarkersExceptStart = () => {

    if (sourceMarker != null && destinationMarker != null) {
        for (var j = 0; j < markersOnMap.length; j++) {
            if (markersOnMap[j].get("stop_id") !== sourceMarker.get('stop_id')
                && markersOnMap[j].get("stop_id") !== destinationMarker.get('stop_id')) {
                markersOnMap[j].setMap(null);
            }
        }
    } else {
        for (var i = 0; i < markersOnMap.length; i++) {
            if (markersOnMap[i].get("stop_id") !== sourceMarker.get('stop_id')) {
                markersOnMap[i].setMap(null);
            }
        }
    }
}

const clearAllMarkersExceptDestination = () => {
    if (sourceMarker != null && destinationMarker != null) {
        for (var j = 0; j < markersOnMap.length; j++) {
            if (markersOnMap[j].get("stop_id") !== sourceMarker.get('stop_id')
                && markersOnMap[j].get("stop_id") !== destinationMarker.get('stop_id')) {
                markersOnMap[j].setMap(null);
            }
        }
    } else {
        for (var i = 0; i < markersOnMap.length; i++) {
            if (markersOnMap[i].get("stop_id") !== destinationMarker.get('stop_id')) {
                markersOnMap[i].setMap(null);
            }
        }
    }
}

const clearAllMarkersForDestination = () => {
    if (sourceMarker === null) {
        for (var i = 0; i < markersOnMap.length; i++) {
            markersOnMap[i].setMap(null);
        }
    } else {
        for (var j = 0; j < markersOnMap.length; j++) {
            if (markersOnMap[j].get("stop_id") !== sourceMarker.get('stop_id')) {
                markersOnMap[j].setMap(null);
            }
        }
    }
}

class GoogleMap extends React.Component {

    constructor(props) {
        super();
        this.state = {
            dateTimeValue: moment(),
            startBusStopSearchedValues: [],
            startBusStopValue: null,
            destinationBusStopSearchedValues: [],
            destinationBusStopValue: null,
            busToggleButton: '',
            busArrivingAtMarkers: [],
            routeDataArrayForStepper: [],
            isBusNoVisible: false,
            isDestinationToggled: true,
            searchValue: 'Search destination stop',
            isAlertOpen: false,
            latestRoutesForUser: [],
            activeIdForUsers: 0,
            isLatestRoutesDisabled: false,
            isFetchingPrediction: false,
            weatherDetails: {
                temp: "NA",
                temp_min: "NA",
                temp_max: "NA",
                weather_main: "NA",
                feels_like: "NA",
                wind_speed: "NA"
            },
            error: {
                isErrorAlertOpen: false,
                message: "Something went wrong"
            },
            showMarkerPickingInfo: false,
            multipleMarkersFromGoogle: false,
            isClickedFromRecentRoutes: false
        }
        // this.mapObject = null;
        this.map = React.createRef();
        sourceMarker = null;
        destinationMarker = null;
        directionRendererArray = [];
        routeDataArray = [];
        allBusStopsArray = [];
    }

    initMap = () => {
        mapObj = new google.maps.Map(this.map.current, {
            zoom: 12,
            center: {
                lat: 53.346519,
                lng: -6.268644
            }
        });
    }

    getLatestRoutes = () => {
        axios.get(API_URL + "api/routes/getall/latest/" + this.props.user.user_id).then(
            res => this.setState({ latestRoutesForUser: res.data }),
            err => { 
                console.log("error in getLatestRoutes", err) 
                this.setState({ 
                    error: {
                        isErrorAlertOpen: true,
                        message: "Error in getting latest routes"
                    }
                })
            }
        )
    }

    componentWillUnmount() {
        sourceMarker = null;
        destinationMarker = null;
        directionRendererArray = [];
        routeDataArray = [];
        allBusStopsArray = [];
    }

    componentDidMount() {
        this.initMap();
        if (this.props.isAuthenticated) {
            this.getLatestRoutes();
        }
    }

    getGoogleMapsAutocomplete = (query) => {
        return axios.get(API_URL + "api/google/get/places", {
            params: { query }
        })
    }

    getGoogleMapsNearestStops = (place_id) => {
        return axios.get(API_URL + "api/google/get/place/coordinates", {
            params: { place_id }
        })
    }

    handleSourceMarkerOnclick = (marker) => {
        if (!this.state.isDestinationToggled) {
            if (sourceMarker != null && sourceMarker.get('stop_id') === marker.get('stop_id')) {
                return;
            }
            if (sourceMarker != null) {
                sourceMarker.setIcon(require('../images/marker_red.png'));
                sourceMarker = null;
            };
            sourceMarker = marker;
            marker.setIcon(require('../images/marker_black.png'));

            clearAllMarkersExceptStart();

            let newState = { ...this.state };
            newState.startBusStopSearchedValues = [];
            newState.startBusStopValue = {
                title: marker.get('stop_name')
                    + " (" + marker.get('stop_id') + ")"
            };
            newState.busArrivingAtMarkers = marker.get('all_bus_numbers');
            newState.isBusNoVisible = true;
            newState.multipleMarkersFromGoogle = false;
            this.setState(newState);
        } else {
            if (destinationMarker != null && destinationMarker.get('stop_id') === marker.get('stop_id')) {
                return;
            }
            if (destinationMarker != null) {
                destinationMarker.setIcon(require('../images/marker_red.png'));
                destinationMarker = null;
            };
            destinationMarker = marker;
            marker.setIcon(require('../images/marker_green.png'));

            clearAllMarkersExceptDestination();

            let newState = { ...this.state };
            newState.startBusStopSearchedValues = [];
            newState.startBusStopValue = {
                title: marker.get('stop_name')
                    + " (" + marker.get('stop_id') + ")"
            };
            newState.busArrivingAtMarkers = marker.get('all_bus_numbers');
            newState.isBusNoVisible = true;
            newState.multipleMarkersFromGoogle = false;
            this.setState(newState);
        }
    }

    startBusStopOnInputChange = (event, value, reason) => {
        if (!value) {
            let newState = { ...this.state };
            newState.startBusStopSearchedValues = [];
            newState.startBusStopValue = null;
            newState.busArrivingAtMarkers = [];
            newState.busToggleButton = '';
            newState.routeDataArrayForStepper = [];
            newState.isBusNoVisible = false;
            newState.isLatestRoutesDisabled = false;
            newState.activeIdForUsers = 0;
            newState.isFetchingPrediction = false;
            newState.showMarkerPickingInfo = false;
            newState.multipleMarkersFromGoogle = false;
            newState.isClickedFromRecentRoutes = false;
            this.setState(newState);
            sourceMarker = null;
            destinationMarker = null;
            clearAllMarkersForStart();
            this.removeRoute();
            routeDataArray = [];
            allBusStopsArray = [];
        } else {
            if (value.length > 2) {
                this.getGoogleMapsAutocomplete(value).then(
                    res => {
                        let newState = { ...this.state };
                        newState.startBusStopSearchedValues = res.data;
                        newState.isLatestRoutesDisabled = true;
                        if (this.state.activeIdForUsers !== 0) {
                            newState.startBusStopSearchedValues = [];
                            newState.startBusStopValue = null;
                            newState.busArrivingAtMarkers = [];
                            newState.busToggleButton = '';
                            newState.routeDataArrayForStepper = [];
                            newState.isBusNoVisible = false;
                            newState.activeIdForUsers = 0;
                            newState.isFetchingPrediction = false;
                            sourceMarker = null;
                            destinationMarker = null;
                            newState.showMarkerPickingInfo = false;
                            newState.multipleMarkersFromGoogle = false;
                            newState.isClickedFromRecentRoutes = false;
                            clearAllMarkersForStart();
                            this.removeRoute();
                            routeDataArray = [];
                            allBusStopsArray = [];
                        }
                        this.setState(newState);
                    }, err => {
                        console.log('error in startBusStopOnInputChange', err)
                        this.setState({ 
                            error: {
                                isErrorAlertOpen: true,
                                message: "Error in getting bus stop suggestions"
                            },
                            multipleMarkersFromGoogle: false,
                            showMarkerPickingInfo: false
                        })
                    })
            } else {
                let newState = { ...this.state };
                newState.startBusStopSearchedValues = [];
                newState.startBusStopValue = null;
                newState.busArrivingAtMarkers = [];
                newState.busToggleButton = '';
                newState.routeDataArrayForStepper = [];
                newState.isBusNoVisible = false;
                newState.isLatestRoutesDisabled = false;
                newState.activeIdForUsers = 0;
                newState.isFetchingPrediction = false;
                newState.showMarkerPickingInfo = false;
                newState.multipleMarkersFromGoogle = false;
                newState.isClickedFromRecentRoutes = false;
                this.setState(newState);
                sourceMarker = null;
                destinationMarker = null;
                clearAllMarkersForStart();
                this.removeRoute();
                routeDataArray = [];
                allBusStopsArray = [];
            }
        }
    }

    startBusStopOnSelect = (event, value, reason) => {
        if (!!value) {
            let newState = { ...this.state };
            newState.startBusStopSearchedValues = [];
            newState.startBusStopValue = null;
            newState.busArrivingAtMarkers = [];
            newState.busToggleButton = '';
            newState.routeDataArrayForStepper = [];
            newState.isBusNoVisible = false;
            newState.isLatestRoutesDisabled = true;
            newState.activeIdForUsers = 0;
            newState.isFetchingPrediction = false;
            newState.showMarkerPickingInfo = false;
            newState.multipleMarkersFromGoogle = false;
            newState.isClickedFromRecentRoutes = false;
            this.setState(newState);
            sourceMarker = null;
            destinationMarker = null;
            clearAllMarkersForStart();
            this.removeRoute();
            routeDataArray = [];
            allBusStopsArray = [];
            if (!value.fromDB) {
                this.getGoogleMapsNearestStops(value.id).then(
                    res => {
                        if (!this.state.isDestinationToggled) {
                            clearAllMarkersForStart();
                        } else {
                            clearAllMarkersForDestination();
                        }
                        this.markersOnMap = [];
                        var markerBounds = new google.maps.LatLngBounds();
                        for (var i = 0; i < res.data.length; i++) {
                            if (sourceMarker != null && res.data[i].stop_id === sourceMarker.get('stop_id')) {
                                continue;
                            }
                            if (destinationMarker != null && res.data[i].stop_id === destinationMarker.get('stop_id')) {
                                continue;
                            }
                            const marker = new google.maps.Marker({
                                position: { lat: parseFloat(res.data[i].stop_lat), lng: parseFloat(res.data[i].stop_lng) },
                                map: mapObj,
                                icon: require('../images/marker_red.png'),
                                animation: google.maps.Animation.DROP,
                                stop_id: res.data[i].stop_id,
                                stop_name: res.data[i].stop_name,
                                all_bus_numbers: res.data[i].all_bus_numbers
                            });

                            markerBounds.extend({ lat: parseFloat(res.data[i].stop_lat), lng: parseFloat(res.data[i].stop_lng) })

                            marker.addListener('click', this.handleSourceMarkerOnclick.bind(this, marker));

                            marker.addListener('mouseover', function () {
                                const busNoAndDirections = marker.get('all_bus_numbers');
                                let allBusNoArray = [];
                                for (var i = 0; i < busNoAndDirections.length; i++) {
                                    allBusNoArray.push(busNoAndDirections[i].bus_number
                                        + "(" + busNoAndDirections[i].direction + ")");
                                }

                                const infowindow = new google.maps.InfoWindow({
                                    content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                                        + "Stop No: <b>" + marker.get('stop_id') + "</b><br>"
                                        + "Bus No: <b>" + allBusNoArray.join(" | ")
                                });
                                markersInfoWindow.push(infowindow);
                                infowindow.open(marker.get('map'), marker);
                            });

                            marker.addListener('mouseout', function () {
                                closeAllOtherInfo()
                            })

                            markersOnMap.push(marker);
                        }
                        mapObj.fitBounds(markerBounds);
                        if(res.data.length > 0) {
                            this.setState({ multipleMarkersFromGoogle: true })
                        }
                    },
                    err => {
                        console.log('error in startBusStopOnSelect', err)
                        this.setState({ 
                            error: {
                                isErrorAlertOpen: true,
                                message: "Error in selecting bus stop"
                            },
                            multipleMarkersFromGoogle: false,
                            showMarkerPickingInfo: false
                        })
                    })
            } else {
                if (!this.state.isDestinationToggled) {
                    clearAllMarkersForStart();
                } else {
                    clearAllMarkersForDestination();
                }

                var markerBounds = new google.maps.LatLngBounds();
                let marker = null;
                if (!this.state.isDestinationToggled) {
                    marker = new google.maps.Marker({
                        position: { lat: parseFloat(value.stop_lat), lng: parseFloat(value.stop_lng) },
                        map: mapObj,
                        icon: require('../images/marker_black.png'),
                        animation: google.maps.Animation.DROP,
                        stop_id: value.id,
                        stop_name: value.title,
                        all_bus_numbers: value.all_bus_numbers
                    });
                } else {
                    marker = new google.maps.Marker({
                        position: { lat: parseFloat(value.stop_lat), lng: parseFloat(value.stop_lng) },
                        map: mapObj,
                        icon: require('../images/marker_green.png'),
                        animation: google.maps.Animation.DROP,
                        stop_id: value.id,
                        stop_name: value.title,
                        all_bus_numbers: value.all_bus_numbers
                    });
                }

                markerBounds.extend({ lat: parseFloat(value.stop_lat), lng: parseFloat(value.stop_lng) })

                this.markersOnMap = [];
                markersOnMap.push(marker);

                if (!this.state.isDestinationToggled) {
                    sourceMarker = marker;
                } else {
                    destinationMarker = marker;
                }

                mapObj.fitBounds(markerBounds);

                this.setState({
                    busArrivingAtMarkers: marker.get('all_bus_numbers'),
                    isBusNoVisible: true,
                    multipleMarkersFromGoogle: false,
                    showMarkerPickingInfo: false
                });
            }
        }
    }

    // handleBusToggle = (event, newToggleValue) => {
    handleBusToggle = (newToggleValue) => {
        if (!!newToggleValue) {
            this.setState({
                busToggleButton: newToggleValue
            })
            let stop_id = null;
            if (!this.state.isDestinationToggled) {
                stop_id = sourceMarker.get('stop_id');
            } else {
                stop_id = destinationMarker.get('stop_id');
            }
            const busNoAndDirection = newToggleValue.split('(');
            axios.get(API_URL + "api/bus/get/routes", {
                params: {
                    bus_number: busNoAndDirection[0].trim(),
                    direction: busNoAndDirection[1].replace(")", "").trim(),
                    stop_id,
                    is_destination_toggled: this.state.isDestinationToggled
                }
            }).then(res => {
                let errMessage = null; 
                if (!this.state.isDestinationToggled) {
                    clearAllMarkersExceptStart();
                    errMessage = "The bus journey ends at this stop";
                    if(sourceMarker.get('stop_id') !== res.data[0].stop_id) {
                        this.setState({
                            error: {
                                isErrorAlertOpen: true,
                                message: "Bus route not available"
                            },
                            showMarkerPickingInfo: false
                        })
                        this.removeRoute();
                        return;
                    }
                } else {
                    clearAllMarkersExceptDestination();
                    errMessage = "The bus journey starts from this stop";
                    if(destinationMarker.get('stop_id') !== res.data[0].stop_id) {
                        this.setState({
                            error: {
                                isErrorAlertOpen: true,
                                message: "Bus route not available"
                            },
                            showMarkerPickingInfo: false
                        })
                        this.removeRoute();
                        return;
                    }
                }
                routeDataArray = []
                allBusStopsArray = res.data;
                if(res.data.length === 1) {
                    this.setState({
                        error: {
                            isErrorAlertOpen: true,
                            message: errMessage
                        },
                        showMarkerPickingInfo: false
                    })
                    this.removeRoute();
                } else {
                    this.setState({ showMarkerPickingInfo: true })
                    this.createRoute(res.data);
                }
            }, err => {
                console.log("error in handleBusToggle", err);
                this.setState({ 
                    error: {
                        isErrorAlertOpen: true,
                        message: "Error in selecting a bus"
                    }
                })
            })
        }
    }

    removeRoute = () => {
        for (var i = 0; i < directionRendererArray.length; i++) {
            directionRendererArray[i].setMap(null);
        }
        directionRendererArray = [];
    }

    deselectDestinationMarker = () => {
        if (!this.state.isDestinationToggled) {
            destinationMarker = null;
            clearAllMarkersExceptStart();
        } else {
            sourceMarker = null;
            clearAllMarkersExceptDestination();
        }
        this.setState({
            routeDataArrayForStepper: [],
            isBusNoVisible: true,
            isFetchingPrediction: false
        })
        this.createRoute(allBusStopsArray);
    }

    handleDestinationMarkerOnclick = (marker) => {
        const busNoAndDirection = this.state.busToggleButton.split('(');
        let routeDetailsObject = null;
        if (!this.state.isDestinationToggled) {
            if (destinationMarker != null && destinationMarker.get('stop_id') === marker.get('stop_id')) {
                return;
            }
            if (destinationMarker != null) {
                destinationMarker.setIcon(require('../images/marker_red.png'));
                destinationMarker = null;
            };
            destinationMarker = marker;
            marker.setIcon(require('../images/marker_green.png'));

            google.maps.event.clearInstanceListeners(marker);

            marker.addListener('mouseover', function () {
                const infowindow = new google.maps.InfoWindow({
                    content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                        + "Stop No: <b>" + marker.get('stop_id') + "</b><br>"
                        + "(Click this marker to deselect destination)"
                });
                markersInfoWindow.push(infowindow);
                infowindow.open(marker.get('map'), marker);
            });

            marker.addListener('mouseout', function () {
                closeAllOtherInfo()
            })

            marker.addListener('click', this.deselectDestinationMarker.bind(this));

            markersOnMap.push(marker);

            clearAllMarkersExceptStart();

            let newState = { ...this.state };
            newState.isBusNoVisible = false;
            newState.isFetchingPrediction = true;
            this.setState(newState)

            // let newRouteTillDest = [];
            // for (var i = 0; i < routeDataArray.length; i++) {
            //     if (routeDataArray[i].stop_id === destinationMarker.get('stop_id')) {
            //         newRouteTillDest.push(routeDataArray[i]);
            //         break;
            //     } else {
            //         newRouteTillDest.push(routeDataArray[i]);
            //     }
            // }
            // this.setState({
            //     routeDataArrayForStepper: newRouteTillDest
            // })
            // this.createRoute(newRouteTillDest);
            routeDetailsObject = {
                "route": busNoAndDirection[0].trim(),
                "direction": parseInt(busNoAndDirection[1].replace(")", "").trim()),
                "start_stop_id": sourceMarker.get('stop_id'),
                "start_program_number": routeDataArray[0].program_number,
                "dest_stop_id": destinationMarker.get('stop_id'),
                "dest_program_number": destinationMarker.get('program_number'),
                "user_id": this.props.user.user_id,
                "datetime_input": moment(this.state.dateTimeValue).format('YYYY-MM-DDTHH:mm:ss'),
                "isFromRecentRoutes": false
            }
            this.generatePrediction(routeDetailsObject);
        } else {
            if (sourceMarker != null && sourceMarker.get('stop_id') === marker.get('stop_id')) {
                return;
            }
            if (sourceMarker != null) {
                sourceMarker.setIcon(require('../images/marker_red.png'));
                sourceMarker = null;
            };
            sourceMarker = marker;
            marker.setIcon(require('../images/marker_black.png'));

            google.maps.event.clearInstanceListeners(marker);

            marker.addListener('mouseover', function () {
                const infowindow = new google.maps.InfoWindow({
                    content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                        + "Stop No: <b>" + marker.get('stop_id') + "</b><br>"
                        + "(Click this marker to deselect source)"
                });
                markersInfoWindow.push(infowindow);
                infowindow.open(marker.get('map'), marker);
            });

            marker.addListener('mouseout', function () {
                closeAllOtherInfo()
            })

            marker.addListener('click', this.deselectDestinationMarker.bind(this));

            markersOnMap.push(marker);

            clearAllMarkersExceptDestination();

            let newState = { ...this.state };
            newState.isBusNoVisible = false;
            newState.isFetchingPrediction = true;
            this.setState(newState)

            // let newRouteTillDest = [];
            // for (let i = 0; i < routeDataArray.length; i++) {
            //     if (routeDataArray[i].stop_id === sourceMarker.get('stop_id')) {
            //         newRouteTillDest.push(routeDataArray[i]);
            //         break;
            //     } else {
            //         newRouteTillDest.push(routeDataArray[i]);
            //     }
            // }
            // this.setState({
            //     routeDataArrayForStepper: newRouteTillDest.slice().reverse()
            // })
            // this.createRoute(newRouteTillDest);
            routeDetailsObject = {
                "route": busNoAndDirection[0].trim(),
                "direction": parseInt(busNoAndDirection[1].replace(")", "").trim()),
                "start_stop_id": sourceMarker.get('stop_id'),
                "start_program_number": sourceMarker.get('program_number'),
                "dest_stop_id": destinationMarker.get('stop_id'),
                "dest_program_number": routeDataArray[0].program_number,
                "user_id": this.props.user.user_id,
                "datetime_input": moment(this.state.dateTimeValue).format('YYYY-MM-DDTHH:mm:ss'),
                "isFromRecentRoutes": false
            }
            this.generatePrediction(routeDetailsObject);
        }
        if (this.props.isAuthenticated) {
            this.saveLatestRoute(routeDetailsObject);
        }
        this.getFutureWeatherPrediction(routeDetailsObject)
    }

    getFutureWeatherPrediction = (routeDetailsObject) => {
        axios.post(API_URL + "api/arrival/weather", routeDetailsObject).then(
            res => {
                if (res.status === 200) {
                    this.setState({
                        weatherDetails: {
                            temp: res.data[0].temp,
                            temp_min: res.data[0].temp_min,
                            temp_max: res.data[0].temp_max,
                            weather_main: res.data[0].weather_main,
                            feels_like: res.data[0].feels_like,
                            wind_speed: res.data[0].wind_speed
                        }
                    })
                } else {
                    this.setState({
                        weatherDetails: {
                            temp: "NA",
                            temp_min: "NA",
                            temp_max: "NA",
                            weather_main: "NA",
                            feels_like: "NA",
                            wind_speed: "NA"
                        }
                    })
                }
            },
            err => { 
                console.log("error in getFutureWeatherPrediction", err)
                this.setState({
                    weatherDetails: {
                        temp: "NA",
                        temp_min: "NA",
                        temp_max: "NA",
                        weather_main: "NA",
                        feels_like: "NA",
                        wind_speed: "NA"
                    }
                }) 
            }
        )
    }

    generatePrediction = (routeDetailsObject) => {
        console.log(routeDetailsObject);
        this.removeRoute();
        axios.post(API_URL + "api/arrival/predict", routeDetailsObject).then(
            res => {
                this.setState({
                    routeDataArrayForStepper: res.data,
                    isFetchingPrediction: false
                })
                if (!this.state.isDestinationToggled) {
                    this.createRoute(res.data);
                } else {
                    this.createRoute(res.data.slice().reverse());
                }
            },
            err => { 
                console.log("error in generatePrediction", err)
                this.deselectDestinationMarker()
                this.setState({ 
                    error: {
                        isErrorAlertOpen: true,
                        message: err.response ? err.response.data[0] : "Error in getting prediction" 
                    },
                    isFetchingPrediction: false
                })
            }
        )
    }

    createRoute = (res) => {
        this.removeRoute();
        routeDataArray = res;

        if (!this.state.isDestinationToggled) {
            // Create markers except source
            if (destinationMarker === null) {
                for (var m = 1; m < res.length; m++) {
                    const marker = new google.maps.Marker({
                        position: { lat: parseFloat(res[m].stop_lat), lng: parseFloat(res[m].stop_lng) },
                        map: mapObj,
                        icon: require('../images/marker_red.png'),
                        animation: google.maps.Animation.DROP,
                        stop_id: res[m].stop_id,
                        stop_name: res[m].stop_name,
                        program_number: res[m].program_number
                    });

                    marker.addListener('mouseover', function () {
                        const infowindow = new google.maps.InfoWindow({
                            content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                                + "Stop No: <b>" + marker.get('stop_id') + "</b>"
                        });
                        markersInfoWindow.push(infowindow);
                        infowindow.open(marker.get('map'), marker);
                    });

                    marker.addListener('mouseout', function () {
                        closeAllOtherInfo()
                    })

                    marker.addListener('click', this.handleDestinationMarkerOnclick.bind(this, marker));

                    markersOnMap.push(marker);
                }
            } else {
                for (var d = 1; d < res.length; d++) {
                    if (res[d].stop_id !== destinationMarker.get('stop_id')) {
                        const marker = new google.maps.Marker({
                            position: { lat: parseFloat(res[d].stop_lat), lng: parseFloat(res[d].stop_lng) },
                            map: mapObj,
                            icon: require('../images/marker_red.png'),
                            animation: google.maps.Animation.DROP,
                            stop_id: res[d].stop_id,
                            stop_name: res[d].stop_name,
                            program_number: res[d].program_number
                        });

                        marker.addListener('mouseover', function () {
                            const infowindow = new google.maps.InfoWindow({
                                content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                                    + "Stop No: <b>" + marker.get('stop_id') + "</b>"
                            });
                            markersInfoWindow.push(infowindow);
                            infowindow.open(marker.get('map'), marker);
                        });

                        marker.addListener('mouseout', function () {
                            closeAllOtherInfo()
                        })
                        markersOnMap.push(marker);
                    }
                }
            }
        } else {
            // Create markers except dest
            if (sourceMarker === null) {
                for (let m = 1; m < res.length; m++) {
                    const marker = new google.maps.Marker({
                        position: { lat: parseFloat(res[m].stop_lat), lng: parseFloat(res[m].stop_lng) },
                        map: mapObj,
                        icon: require('../images/marker_red.png'),
                        animation: google.maps.Animation.DROP,
                        stop_id: res[m].stop_id,
                        stop_name: res[m].stop_name,
                        program_number: res[m].program_number
                    });

                    marker.addListener('mouseover', function () {
                        const infowindow = new google.maps.InfoWindow({
                            content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                                + "Stop No: <b>" + marker.get('stop_id') + "</b>"
                        });
                        markersInfoWindow.push(infowindow);
                        infowindow.open(marker.get('map'), marker);
                    });

                    marker.addListener('mouseout', function () {
                        closeAllOtherInfo()
                    })

                    marker.addListener('click', this.handleDestinationMarkerOnclick.bind(this, marker));

                    markersOnMap.push(marker);
                }
            } else {
                for (let d = 1; d < res.length; d++) {
                    if (res[d].stop_id !== sourceMarker.get('stop_id')) {
                        const marker = new google.maps.Marker({
                            position: { lat: parseFloat(res[d].stop_lat), lng: parseFloat(res[d].stop_lng) },
                            map: mapObj,
                            icon: require('../images/marker_red.png'),
                            animation: google.maps.Animation.DROP,
                            stop_id: res[d].stop_id,
                            stop_name: res[d].stop_name,
                            program_number: res[d].program_number
                        });

                        marker.addListener('mouseover', function () {
                            const infowindow = new google.maps.InfoWindow({
                                content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                                    + "Stop No: <b>" + marker.get('stop_id') + "</b>"
                            });
                            markersInfoWindow.push(infowindow);
                            infowindow.open(marker.get('map'), marker);
                        });

                        marker.addListener('mouseout', function () {
                            closeAllOtherInfo()
                        })
                        markersOnMap.push(marker);
                    }
                }
            }
        }
        this.createRouteUsingMultipleWaypoints(res);
    }

    createRouteUsingMultipleWaypoints = (res) => {
        // Ref for below code: https://stackoverflow.com/questions/8779886/exceed-23-waypoint-per-request-limit-on-google-directions-api-business-work-lev
        var directionsService = new google.maps.DirectionsService();

        for (var k = 0, parts = [], max = 25 - 1; k < res.length; k = k + max) {
            parts.push(res.slice(k, k + max + 1));
        }

        // Service callback to process service results
        var service_callback = function (response, status) {
            if (status === 'OK') {
                var directionsRenderer = new google.maps.DirectionsRenderer();
                directionsRenderer.setOptions({
                    polylineOptions: {
                        strokeWeight: 7,
                        strokeOpacity: 4,
                        strokeColor: 'blue'
                    },
                    suppressMarkers: true
                });
                directionsRenderer.setDirections(response);
                directionsRenderer.setMap(mapObj);
                directionRendererArray.push(directionsRenderer);
            } else {
                console.log('Directions request failed due to ' + status);
                return;
            }
        }

        // Send requests to service to get route (for stations count <= 25 only one request will be sent)
        for (var i = 0; i < parts.length; i++) {
            // Waypoints does not include first station (origin) and last station (destination)
            var waypoints = [];
            for (var j = 1; j < parts[i].length - 1; j++) {
                waypoints.push({ location: new google.maps.LatLng(parts[i][j].stop_lat, parts[i][j].stop_lng), stopover: true });
            }

            // Service options
            var request = {
                origin: new google.maps.LatLng(parts[i][0].stop_lat, parts[i][0].stop_lng),
                destination: new google.maps.LatLng(parts[i][parts[i].length - 1].stop_lat, parts[i][parts[i].length - 1].stop_lng),
                waypoints: waypoints,
                travelMode: 'DRIVING'
            };
            // Send request
            directionsService.route(request, service_callback);
        }
    }

    handleOnchangeDateTime = (date, value) => {
        let newState = { ...this.state };
        if (sourceMarker !== null && destinationMarker !== null) {
            newState.dateTimeValue = date;
            newState.isFetchingPrediction = true;
            this.setState(newState);
            const busNoAndDirection = this.state.busToggleButton.split('(');
            let routeDetailsObject = null;
            if (!this.state.isDestinationToggled) {
                routeDetailsObject = {
                    "route": busNoAndDirection[0].trim(),
                    "direction": parseInt(busNoAndDirection[1].replace(")", "").trim()),
                    "start_stop_id": sourceMarker.get('stop_id'),
                    "start_program_number": routeDataArray[0].program_number,
                    "dest_stop_id": destinationMarker.get('stop_id'),
                    "dest_program_number": destinationMarker.get('program_number'),
                    "user_id": this.props.user.user_id,
                    "datetime_input": moment(date).format('YYYY-MM-DDTHH:mm:ss'),
                    "isFromRecentRoutes": false
                }
            } else {
                routeDetailsObject = {
                    "route": busNoAndDirection[0].trim(),
                    "direction": parseInt(busNoAndDirection[1].replace(")", "").trim()),
                    "start_stop_id": sourceMarker.get('stop_id'),
                    "start_program_number": sourceMarker.get('program_number'),
                    "dest_stop_id": destinationMarker.get('stop_id'),
                    "dest_program_number": routeDataArray[0].program_number,
                    "user_id": this.props.user.user_id,
                    "datetime_input": moment(date).format('YYYY-MM-DDTHH:mm:ss'),
                    "isFromRecentRoutes": false
                }
            }
            console.log(routeDetailsObject);
            this.getFutureWeatherPrediction(routeDetailsObject)
            axios.post(API_URL + "api/arrival/predict", routeDetailsObject).then(
                res => this.setState({
                    routeDataArrayForStepper: res.data,
                    isFetchingPrediction: false
                }),
                err => {
                    console.log("error in handleOnchangeDateTime when generating prediction", err)
                    if(this.state.activeIdForUsers !== 0) {
                        console.log("inside")
                        sourceMarker = null;
                        destinationMarker = null;
                        clearAllMarkersForStart();
                        this.removeRoute();
                        allBusStopsArray = [];
                        this.markersOnMap = [];
                        let newState = { ...this.state };
                        newState.startBusStopSearchedValues = [];
                        newState.busArrivingAtMarkers = [];
                        newState.busToggleButton = '';
                        newState.routeDataArrayForStepper = [];
                        newState.isBusNoVisible = false;
                        newState.isFetchingPrediction = false;
                        newState.isLatestRoutesDisabled = false;
                        newState.activeIdForUsers = 0;
                        newState.error = {
                            isErrorAlertOpen: true,
                            message: err.response ? err.response.data[0] : "Error in getting prediction" 
                        }
                        this.setState(newState);
                    } else {
                        this.deselectDestinationMarker()
                        this.setState({ 
                            error: {
                                isErrorAlertOpen: true,
                                message: err.response ? err.response.data[0] : "Error in getting prediction" 
                            },
                            isFetchingPrediction: false
                        })
                    }
                }
            )
        } else {
            newState.dateTimeValue = date;
            newState.isFetchingPrediction = false;
            this.setState(newState);
        }
    }

    handleOnSourceDestToggleChange = () => {
        let newState = { ...this.state };
        newState.startBusStopSearchedValues = [];
        newState.busArrivingAtMarkers = [];
        newState.busToggleButton = '';
        newState.routeDataArrayForStepper = [];
        newState.activeIdForUsers = 0;
        newState.isBusNoVisible = false;
        newState.isFetchingPrediction = false;
        newState.isDestinationToggled = !this.state.isDestinationToggled
        if (newState.isDestinationToggled) {
            newState.searchValue = "Search destination stop";
        } else {
            newState.searchValue = "Search source stop"
        }
        newState.startBusStopValue = { title: '' };
        newState.isAlertOpen = true;
        newState.isLatestRoutesDisabled = false;
        newState.showMarkerPickingInfo = false;
        newState.multipleMarkersFromGoogle = false;
        newState.isClickedFromRecentRoutes = false;
        this.setState(newState);
        sourceMarker = null;
        destinationMarker = null;
        clearAllMarkersForStart();
        this.removeRoute();
        routeDataArray = [];
        allBusStopsArray = [];
    }

    closeAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ isAlertOpen: false })
    }
    
    closeErrorAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ 
            error: {
                isErrorAlertOpen: false
            } 
        })
    }

    handleOnclickForLatestRoutes = (id, bus_number, direction) => {
        if (this.state.activeIdForUsers !== id) {
            // axios.get(API_URL + "api/routes/getall/waypoints/" + id).then(
            const routeDetailsObject = {
                "datetime_input": moment(this.state.dateTimeValue).format('YYYY-MM-DDTHH:mm:ss'),
                "isFromRecentRoutes": true,
                "id": id
            }
            console.log(routeDetailsObject);
            // Reset everything
            let newState = { ...this.state };
            newState.startBusStopSearchedValues = [];
            newState.busArrivingAtMarkers = [];
            newState.busToggleButton = '';
            newState.routeDataArrayForStepper = [];
            // newState.startBusStopValue = { title: '' };
            newState.isBusNoVisible = false;
            newState.isFetchingPrediction = true;
            newState.isLatestRoutesDisabled = true;
            newState.isClickedFromRecentRoutes = true;
            this.setState(newState);
            sourceMarker = null;
            destinationMarker = null;
            clearAllMarkersForStart();
            this.removeRoute();
            // routeDataArray = [];
            allBusStopsArray = [];
            this.markersOnMap = [];
            // this.setState({ isFetchingPrediction: true });

            this.getFutureWeatherPrediction(routeDetailsObject)

            axios.post(API_URL + "api/arrival/predict", routeDetailsObject).then(
                resp => {
                    const res = resp.data;
                    routeDataArray = res;
                    if (this.state.isDestinationToggled) {
                        routeDataArray = res.slice().reverse();
                    }

                    // create markers
                    for (let d = 0; d < res.length; d++) {
                        let marker = null;
                        if (d === 0) {
                            marker = new google.maps.Marker({
                                position: { lat: parseFloat(res[d].stop_lat), lng: parseFloat(res[d].stop_lng) },
                                map: mapObj,
                                icon: require('../images/marker_black.png'),
                                animation: google.maps.Animation.DROP,
                                stop_id: res[d].stop_id,
                                stop_name: res[d].stop_name,
                                program_number: res[d].program_number
                            });
                            sourceMarker = marker;
                        } else if (d === res.length - 1) {
                            marker = new google.maps.Marker({
                                position: { lat: parseFloat(res[d].stop_lat), lng: parseFloat(res[d].stop_lng) },
                                map: mapObj,
                                icon: require('../images/marker_green.png'),
                                animation: google.maps.Animation.DROP,
                                stop_id: res[d].stop_id,
                                stop_name: res[d].stop_name,
                                program_number: res[d].program_number
                            });
                            destinationMarker = marker;
                        } else {
                            marker = new google.maps.Marker({
                                position: { lat: parseFloat(res[d].stop_lat), lng: parseFloat(res[d].stop_lng) },
                                map: mapObj,
                                icon: require('../images/marker_red.png'),
                                animation: google.maps.Animation.DROP,
                                stop_id: res[d].stop_id,
                                stop_name: res[d].stop_name,
                                program_number: res[d].program_number
                            });
                        }
                        marker.addListener('mouseover', function () {
                            const infowindow = new google.maps.InfoWindow({
                                content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                                    + "Stop No: <b>" + marker.get('stop_id') + "</b>"
                            });
                            markersInfoWindow.push(infowindow);
                            infowindow.open(marker.get('map'), marker);
                        });

                        marker.addListener('mouseout', function () {
                            closeAllOtherInfo()
                        })
                        markersOnMap.push(marker);
                    }
                    this.setState({
                        busToggleButton: bus_number + "(" + direction + ")",
                        routeDataArrayForStepper: res,
                        activeIdForUsers: id,
                        isFetchingPrediction: false,
                        isLatestRoutesDisabled: false
                    })

                    // create route
                    this.createRouteUsingMultipleWaypoints(res);
                },
                err => { 
                    console.log("error in handleOnclickForLatestRoutes", err)
                    this.setState({ 
                        error: {
                            isErrorAlertOpen: true,
                            message: err.response ? err.response.data[0] : "Error in getting prediction"
                        },
                        isFetchingPrediction: false,
                        isLatestRoutesDisabled: false,
                        activeIdForUsers: 0
                    })
                }
            )
        }
    }

    saveLatestRoute = (routeDetailsObject) => {
        axios.post(API_URL + "api/routes/save", routeDetailsObject).then(
            res => this.getLatestRoutes(),
            err => {
                console.log("error in saveLatestRoute", err)
                this.setState({ 
                    error: {
                        isErrorAlertOpen: true,
                        message: "Error in saving latest routes"
                    }
                })
            }
        )
    }

    render() {
        let isExpressBus = false, adultCash, adultLeap, adultLeapNumeric = 0.0, childCash = "€1.30", childLeap = "€1.00", schoolHrsCash = "€1.00", schoolHrsLeap = "€0.80";
        if (sourceMarker !== null && destinationMarker !== null) {
            isExpressBus = this.state.busToggleButton.indexOf("X") !== -1;
            if (!isExpressBus) {
                const totalStops = this.state.routeDataArrayForStepper.length - 1;
                if (totalStops >= 1 && totalStops <= 3) {
                    adultCash = "€2.15";
                    adultLeap = "€1.55";
                    adultLeapNumeric = 1.55;
                } else if (totalStops >= 4 && totalStops <= 13) {
                    adultCash = "€3.00";
                    adultLeap = "€2.25";
                    adultLeapNumeric = 2.25;
                } else {
                    adultCash = "€3.30";
                    adultLeap = "€2.50";
                    adultLeapNumeric = 2.50;
                }
            } else {
                adultCash = "€3.80";
                adultLeap = "€3.00";
                adultLeapNumeric = 3.00;
                childCash = "€1.60";
                childLeap = "€1.26";
            }
        }
        return (
            <div style={{ flexGrow: 1 }}>
                {this.props.isAuthenticated && (
                    <RouteSuggestion
                        user={this.props.user}
                        latestRoutesForUser={this.state.latestRoutesForUser}
                        handleOnclickForLatestRoutes={this.handleOnclickForLatestRoutes}
                        isLatestRoutesDisabled={this.state.isLatestRoutesDisabled}
                        isClickedFromRecentRoutes={this.state.isClickedFromRecentRoutes}
                    />
                )}
                <Grid container spacing={2}
                    direction="row"
                    justify="space-between"
                    alignItems="flex-start"
                >
                    <Grid item xs={12} sm={12} lg={3} md={12} xl={3}>
                        <CssBaseline />
                        <Paper elevation={2} style={{ padding: "10px", backgroundColor: "rgb(250,251,252)" }}>
                            <Typography>
                                <b style={{ fontSize: "29px" }}>Welcome to Dublin Bus</b>
                            </Typography>
                            <br />
                            <Typography>
                                <span style={{ fontSize: "15px" }}>Fill in the below details to get travel time estimates and more!</span>
                            </Typography>

                            <Autocomplete
                                id="start_bus_stop_search"
                                freeSolo
                                autoHighlight
                                onInputChange={this.startBusStopOnInputChange.bind(this)}
                                onChange={this.startBusStopOnSelect.bind(this)}
                                size="small"
                                value={this.state.startBusStopValue}
                                options={this.state.startBusStopSearchedValues}
                                getOptionLabel={option => option.title}
                                // renderInput={(params) => <TextField {...params} label="Search for stops" margin="normal" variant="outlined" />}
                                renderInput={(params) =>
                                    <Grid container spacing={2}
                                        direction="row"
                                        justify="space-between"
                                        alignItems="center"
                                    >
                                        <Grid item xs={10} sm={11} lg={9} md={9}>
                                            <TextField
                                                {...params}
                                                label={this.state.searchValue}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            // autoFocus
                                            />
                                        </Grid>
                                        <Grid item xs={2} sm={1} lg={3} md={3} style={{ width: 'inherit' }}>
                                            <Tooltip title={<span style={{ fontSize: "12px" }}>Toggle source or destination stop</span>}>
                                                <Switch
                                                    defaultChecked
                                                    color="default"
                                                    onChange={this.handleOnSourceDestToggleChange.bind(this)}
                                                />
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                }
                            />

                            {/* {this.state.isBusNoVisible && (
                                <div style={{ width: 'inherit', overflow: 'scroll' }}>
                                    <Typography variant="caption" style={{paddingLeft: "4px", fontSize: "12px"}}>
                                        Pick a bus:
                                    </Typography>
                                    <br/>
                                    <ToggleButtonGroup
                                        value={this.state.busToggleButton}
                                        exclusive
                                        onChange={this.handleBusToggle.bind(this)}
                                    >
                                        {this.state.busArrivingAtMarkers.map((bus, index) =>
                                            <ToggleButton
                                                value={bus.bus_number + "(" + bus.direction + ")"}
                                                style={{ color: 'black' }} key={index}
                                            >
                                                <DirectionsBusIcon fontSize="small" /> {bus.bus_number + "(" + bus.direction + ")"}
                                            </ToggleButton>
                                        )}
                                    </ToggleButtonGroup>
                                </div>
                            )} */}

                            {this.state.isBusNoVisible && (
                                <div style={{
                                    padding: "3px",
                                    backgroundColor: 'transparent'
                                  }}>
                                    <Typography variant="caption" style={{paddingLeft: "4px", fontSize: "12px"}}>
                                        Pick a bus:
                                    </Typography>
                                    <br />
                                    {this.state.busArrivingAtMarkers.map((bus, index) =>
                                        <span key={index}>
                                            {this.state.busToggleButton === bus.bus_number + "(" + bus.direction + ")" ? (
                                                <Chip variant="outlined" color="primary" icon={<DirectionsBusIcon fontSize="small" />} 
                                                    label={bus.bus_number + "(" + bus.direction + ")"}
                                                    style={{margin: 2}}
                                                    onClick={this.handleBusToggle.bind(this, bus.bus_number + "(" + bus.direction + ")")}
                                                />
                                            ):(
                                                <Chip variant="outlined" icon={<DirectionsBusIcon fontSize="small" />} 
                                                    label={bus.bus_number + "(" + bus.direction + ")"}
                                                    style={{margin: 2}}
                                                    onClick={this.handleBusToggle.bind(this, bus.bus_number + "(" + bus.direction + ")")}
                                                />
                                            )}
                                        </span>        
                                    )}
                                </div>
                            )}

                            {!this.state.isDestinationToggled && !sourceMarker && !destinationMarker && this.state.multipleMarkersFromGoogle && (
                                <>  
                                    {/* <br /> */}
                                    <Alert icon={false} variant="outlined" severity="info">
                                        Pick a source by clicking on the red markers on the map
                                    </Alert>
                                    {/* <br /> */}
                                </>
                            )}

                            {this.state.isDestinationToggled && !sourceMarker && !destinationMarker && this.state.multipleMarkersFromGoogle && (
                                <>  
                                    {/* <br /> */}
                                    <Alert icon={false} variant="outlined" severity="info">
                                        Pick a destination by clicking on the red markers on the map
                                    </Alert>
                                    {/* <br /> */}
                                </>
                            )}

                            {!this.state.isDestinationToggled && sourceMarker && !destinationMarker && this.state.showMarkerPickingInfo && (
                                <>  
                                    {/* <br /> */}
                                    <Alert icon={false} variant="outlined" severity="info">
                                        Pick a destination by clicking on the red markers on the map
                                    </Alert>
                                    {/* <br /> */}
                                </>
                            )}

                            {this.state.isDestinationToggled && destinationMarker && !sourceMarker && this.state.showMarkerPickingInfo && (
                                <>
                                    {/* <br /> */}
                                    <Alert icon={false} variant="outlined" severity="info">
                                        Pick a source by clicking on the red markers on the map
                                    </Alert>
                                    {/* <br /> */}
                                </>    
                            )}

                            {/* {sourceMarker !== null && destinationMarker !== null && !this.state.isFetchingPrediction && (
                                <div style={{ width: 'inherit', overflow: 'scroll' }}>
                                    <ToggleButtonGroup
                                        value={this.state.busToggleButton}
                                        exclusive
                                        onChange={this.handleBusToggle.bind(this)}
                                    >
                                        <ToggleButton
                                            value={this.state.busToggleButton}
                                            style={{ color: 'black' }}
                                        >
                                            <DirectionsBusIcon fontSize="small" /> {this.state.busToggleButton}
                                            <span style={{textTransform: "none"}}>
                                            {Math.abs(Math.round((this.state.routeDataArrayForStepper[0].arrival_time
                                                    - moment.duration(moment(this.state.dateTimeValue).format("HH:mm")).asSeconds()) / 60)) > 60 ? (
                                                        <>
                                                            &nbsp;in {Math.abs(Math.round((this.state.routeDataArrayForStepper[0].arrival_time
                                                                - moment.duration(moment(this.state.dateTimeValue).format("HH:mm")).asSeconds()) / 3600))} hrs
                                                        </>
                                                    ):(
                                                        <>
                                                            &nbsp;in {Math.abs(Math.round((this.state.routeDataArrayForStepper[0].arrival_time
                                                                - moment.duration(moment(this.state.dateTimeValue).format("HH:mm")).asSeconds()) / 60))} min
                                                        </>
                                                    )}
                                            </span>
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </div>
                            )} */}

                            {sourceMarker !== null && destinationMarker !== null && !this.state.isFetchingPrediction && (
                                <div style={{
                                    padding: "3px",
                                    backgroundColor: 'transparent'
                                  }}>
                                      {
                                          Math.abs(Math.round((this.state.routeDataArrayForStepper[0].arrival_time
                                                    - moment.duration(moment(this.state.dateTimeValue).format("HH:mm")).asSeconds()) / 60)) > 60 ? (
                                                        <>
                                                            <Chip variant="outlined" color="primary" icon={<DirectionsBusIcon fontSize="small" />} 
                                                                    label={this.state.busToggleButton + " in "+ Math.abs(Math.round((this.state.routeDataArrayForStepper[0].arrival_time
                                                                        - moment.duration(moment(this.state.dateTimeValue).format("HH:mm")).asSeconds()) / 3600)) + " hrs"}
                                                            />    
                                                        </>
                                                    ):(
                                                        <>
                                                            <Chip variant="outlined" color="primary" icon={<DirectionsBusIcon fontSize="small" />} 
                                                                    label={this.state.busToggleButton + " in "+ Math.abs(Math.round((this.state.routeDataArrayForStepper[0].arrival_time
                                                                        - moment.duration(moment(this.state.dateTimeValue).format("HH:mm")).asSeconds()) / 60)) + " min"}
                                                            />  
                                                        </>
                                        )}
                                </div>
                            )}

                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Grid container justify="space-around">
                                    <KeyboardDatePicker
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        id="date_picker"
                                        label="Pick journey date"
                                        format="dd/MM/yyyy"
                                        maxDate={moment().add(3, 'days').format('YYYY-MM-DD')}
                                        minDate={moment().format('YYYY-MM-DD')}
                                        value={this.state.dateTimeValue}
                                        onChange={this.handleOnchangeDateTime.bind(this)}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                    <KeyboardTimePicker
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        id="time_picker"
                                        label="Pick journey time"
                                        value={this.state.dateTimeValue}
                                        onChange={this.handleOnchangeDateTime.bind(this)}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change time',
                                        }}
                                    />
                                </Grid>
                            </MuiPickersUtilsProvider>

                            {this.state.isFetchingPrediction && (
                                <LinearProgress />
                            )}

                            {sourceMarker && destinationMarker && !this.state.isFetchingPrediction && (
                                <div style={{ maxHeight: '315px', overflow: 'scroll' }}>
                                    <br />
                                    <Card style={{ padding: "10px" }} variant="outlined">
                                        <Grid container spacing={1}
                                            direction="row"
                                            justify="center"
                                            alignItems="center"
                                        >
                                            {this.state.weatherDetails.temp === "NA" ? (
                                                <>
                                                    <Typography color="textSecondary">
                                                        No future weather prediction available
                                                    </Typography>  
                                                </>
                                            ) : (
                                                    <>
                                                        <Grid item>
                                                            {(this.state.weatherDetails.weather_main === "Clouds" || 
                                                                this.state.weatherDetails.weather_main === "Mist" || 
                                                                this.state.weatherDetails.weather_main === "Fog" || 
                                                                this.state.weatherDetails.weather_main === "Smoke") && (
                                                                <CloudRoundedIcon style={{ fontSize: "50px", color: "lightblue" }} />
                                                            )}

                                                            {(this.state.weatherDetails.weather_main === "Rain" || 
                                                                this.state.weatherDetails.weather_main === "Drizzle") && (
                                                                 <>   
                                                                    <FlashOnRoundedIcon style={{fontSize:"50px", color:"yellow"}}/>
                                                                    <GrainRoundedIcon style={{fontSize:"50px", color:"lightblue"}}/>
                                                                </>
                                                            )}

                                                            {(this.state.weatherDetails.weather_main === "Clear") && (
                                                                <WbSunnyRoundedIcon style={{ fontSize: "50px", color: "orange" }} />
                                                            )}

                                                            {(this.state.weatherDetails.weather_main === "Snow") && (
                                                                <AcUnitRoundedIcon style={{ fontSize: "50px", color: "black" }} />
                                                            )}
                                                        </Grid>
                                                        <Grid item>
                                                            <Typography variant="h5" component="h2">
                                                                {this.state.weatherDetails.temp}°C {this.state.weatherDetails.weather_main}
                                                            </Typography>
                                                            <Typography color="textSecondary" style={{ fontSize: "12px" }} align="center">
                                                                {/* {this.state.weatherDetails.temp_max}°C/{this.state.weatherDetails.temp_min}°C */}
                                                                Feels Like: {this.state.weatherDetails.feels_like}°C
                                                            </Typography>
                                                        </Grid>
                                                    </>
                                                )}
                                        </Grid>
                                    </Card>
                                    <br />
                                    <Accordion>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <Typography>
                                                Total travel time: {Math.abs(Math.round((this.state.routeDataArrayForStepper[this.state.routeDataArrayForStepper.length - 1].arrival_time
                                                    - this.state.routeDataArrayForStepper[0].arrival_time) / 60))} min
    
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div style={{ height: '200px', overflow: 'scroll', width: "100%" }}>
                                                <Stepper orientation="vertical" style={{ backgroundColor: "transparent" }}>
                                                    {this.state.routeDataArrayForStepper.map((busData, index) => (
                                                        <Step key={index} active>
                                                            <StepLabel>
                                                                {busData.stop_name + " (" + busData.stop_id + ")"}: {moment.utc(busData.arrival_time * 1000).format('h:mm A')}
                                                            </StepLabel>
                                                            {this.state.routeDataArrayForStepper.length - 1 !== index && (
                                                                <StepContent>
                                                                    <Typography variant="caption">
                                                                        ETT between stations: {Math.abs(Math.round(busData.section_travel_time / 60))} min
                                                                    </Typography>
                                                                </StepContent>
                                                            )}
                                                        </Step>
                                                    ))}
                                                </Stepper>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                    <Accordion>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <Typography >Fare estimates: {adultCash}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div style={{ height: 'auto', overflow: 'scroll', width: "100%" }}>
                                                <TableContainer style={{ backgroundColor: "transparent" }}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>All Fares</TableCell>
                                                                <TableCell align="right">Price</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        {!isExpressBus ? (
                                                            <TableBody>
                                                                <TableRow hover>
                                                                    <TableCell component="th" scope="row">Adult Cash</TableCell>
                                                                    <TableCell align="right">{adultCash}</TableCell>
                                                                </TableRow>
                                                                <TableRow hover>
                                                                    <TableCell component="th" scope="row">Adult Leap</TableCell>
                                                                    <TableCell align="right">{adultLeap}</TableCell>
                                                                </TableRow>
                                                                <TableRow hover>
                                                                    <TableCell component="th" scope="row">Child Cash (Under 16)</TableCell>
                                                                    <TableCell align="right">{childCash}</TableCell>
                                                                </TableRow>
                                                                <TableRow hover>
                                                                    <TableCell component="th" scope="row">Child Leap (Under 19)</TableCell>
                                                                    <TableCell align="right">{childLeap}</TableCell>
                                                                </TableRow>
                                                                <TableRow hover>
                                                                    <TableCell component="th" scope="row">School Hours Cash</TableCell>
                                                                    <TableCell align="right">{schoolHrsCash}</TableCell>
                                                                </TableRow>
                                                                <TableRow hover>
                                                                    <TableCell component="th" scope="row">School Hours Leap</TableCell>
                                                                    <TableCell align="right">{schoolHrsLeap}</TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        ) : (
                                                                <TableBody>
                                                                    <TableRow hover>
                                                                        <TableCell component="th" scope="row">Adult Cash</TableCell>
                                                                        <TableCell align="right">{adultCash}</TableCell>
                                                                    </TableRow>
                                                                    <TableRow hover>
                                                                        <TableCell component="th" scope="row">Adult Leap</TableCell>
                                                                        <TableCell align="right">{adultLeap}</TableCell>
                                                                    </TableRow>
                                                                    <TableRow hover>
                                                                        <TableCell component="th" scope="row">Child Cash (Under 16)</TableCell>
                                                                        <TableCell align="right">{childCash}</TableCell>
                                                                    </TableRow>
                                                                    <TableRow hover>
                                                                        <TableCell component="th" scope="row">Child Leap (Under 19)</TableCell>
                                                                        <TableCell align="right">{childLeap}</TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            )}
                                                    </Table>
                                                </TableContainer>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                    <br />
                                    {this.props.leapCardAccountInfo ? (
                                        <>
                                            {this.props.leapCardAccountInfo.balance < 0 ? (
                                                <Typography variant="caption" color="textSecondary" style={{fontSize: "14px"}}>
                                                    You have negative balance. Please recharge your leap card to see remaining balance.
                                                </Typography>
                                            ):(
                                                <Typography variant="caption" color="textSecondary" style={{fontSize: "14px"}}>
                                                    Remaining Student Leap Balance: <b>€{(this.props.leapCardAccountInfo.balance - adultLeapNumeric).toFixed(2)}</b>
                                                </Typography>
                                            )}
                                        </>
                                    ):(
                                        <Typography variant="caption" color="textSecondary">
                                            Tip: Check leap card balance and search again to view remaining balance after journey!
                                        </Typography>
                                    )}
                                </div>
                            )}
                            <Snackbar
                                open={this.state.isAlertOpen}
                                autoHideDuration={3000}
                                onClose={this.closeAlert.bind(this)}
                                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                            >
                                <Alert onClose={this.closeAlert.bind(this)} severity="info">
                                    Switched to {this.state.searchValue}
                                </Alert>
                            </Snackbar>
                            <Snackbar
                                open={this.state.error.isErrorAlertOpen}
                                autoHideDuration={3000}
                                onClose={this.closeErrorAlert.bind(this)}
                                anchorOrigin={{ horizontal: "center", vertical: "top" }}
                            >
                                <Alert onClose={this.closeErrorAlert.bind(this)} severity="error">
                                    {this.state.error.message}
                                </Alert>
                            </Snackbar>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={9} md={12} xl={9}>
                        <CssBaseline />
                        <Paper elevation={2} style={{ padding: "3px", height: "inherit" }}>
                            <div id="map" ref={this.map} style={{ width: 'inherit', height: '700px' }}></div>
                        </Paper>
                    </Grid>
                </Grid>
            </div >
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        leapCardAccountInfo: state.leapCardAccountInfo
    }
}

export default withRouter(connect(mapStateToProps)(GoogleMap));