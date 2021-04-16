import React from 'react';
import Typography from '@material-ui/core/Typography';
import error_gif from '../images/bus.gif'

const ErrorPage = () => {
    return (
        <div style={{textAlign: "center"}}>
            <img alt="" src={error_gif} />
            <Typography variant="h4">
                404 Page Not Found
            </Typography>
            <Typography variant="body2" color="textSecondary">
                Sorry. This page does not exist.
            </Typography>
        </div>
    )
}

export default ErrorPage