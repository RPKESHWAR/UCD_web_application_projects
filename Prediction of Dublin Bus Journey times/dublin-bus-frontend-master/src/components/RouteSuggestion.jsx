import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
// import ArrowRightAltSharpIcon from '@material-ui/icons/ArrowRightAltSharp';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { Timeline } from 'react-twitter-widgets';

const welcomeMessageAndSuggestion = (props) => {

    const currentHrs = new Date().getHours();
    let welcomeMsg = null;
    if (currentHrs < 12) {
        welcomeMsg = "Good Morning, ";
    } else if (currentHrs < 18) {
        welcomeMsg = "Good Afternoon, ";
    } else {
        welcomeMsg = "Good Evening, ";
    }

    return (
        <div>
            <Grid container spacing={2}
                direction="row"
                justify="space-between"
                alignItems="flex-start"
            >
                <Grid item xs={12} sm={12} lg={8} md={12} xl={8}>
                    <Typography style={{ color: "black", fontFamily: "Tahoma", fontSize: "40px" }}>
                        {welcomeMsg}{props.user.first_name}
                    </Typography>
                    {props.latestRoutesForUser.length !== 0 ? (
                        <>
                            <Paper elevation={0} style={{ padding: "10px", backgroundColor: "transparent" }}>
                                <div style={{ overflow: "auto" }}>
                                    <Typography color="textSecondary">
                                        Recent Routes
                                    </Typography>
                                    {props.isLatestRoutesDisabled && !props.isClickedFromRecentRoutes && (
                                        <>
                                            <Typography variant="caption" style={{ color: "red" }}>
                                                Note: Clear search box or toggle source-destination to view recent routes
                                            </Typography>
                                            <br />
                                        </>
                                    )}
                                    <ButtonGroup disableElevation variant="text">
                                        {props.latestRoutesForUser.map((route, index) =>
                                            <Button
                                                key={index}
                                                disabled={props.isLatestRoutesDisabled}
                                                onClick={() => props.handleOnclickForLatestRoutes(route.id, route.route, route.direction)}
                                                style={{ textTransform: "none" }}
                                            >
                                                {/* {route.route}<br/>
                                                {route.from}<br/><ArrowRightAltSharpIcon fontSize="small" />{route.to} */}
                                                Bus No. {route.route}({route.direction})<br />
                                                {route.from} → {route.to}
                                            </Button>
                                        )}
                                    </ButtonGroup>
                                </div>
                            </Paper>
                        </>
                    ) : (
                            <>
                                <Typography color="textSecondary" style={{ padding: "5px" }}>
                                    No Recent Routes available. Try searching for different destinations!
                                </Typography>
                            </>
                        )}
                </Grid>
                <Grid item xs={12} sm={12} lg={4} md={12} xl={4}>
                    <Typography variant="subtitle1" style={{ color: "black", fontFamily: "Tahoma" }}>
                        Latest Tweets
                    </Typography>
                    <Timeline
                        dataSource={{ sourceType: "profile", screenName: "DublinBusNews" }}
                        options={{ chrome: "nofooter,noheader", width: "100%", height: "inherit" }}
                    />
                </Grid>
            </Grid>
            <br />
        </div>
    )
}

export default welcomeMessageAndSuggestion;