import React from 'react';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { InputAdornment, IconButton } from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import { API_URL } from '../constants';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { SAVE_LEAP_DETAILS } from '../constants';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class LeapCard extends React.Component {

    state = {
        credentials: { username: '', password: '' },
        disabled: false,
        isPasswordVisible: false,
        leapCardAccountInfo: null,
        loading: false,
        isAlertOpen: false,
        errorMessage: ''
    }

    componentDidMount() {
        if (this.props.leapCardAccountInfo) {
            this.setState({ leapCardAccountInfo: this.props.leapCardAccountInfo })
        }
    }

    handleLoginFormValues = (event) => {
        let newState = { ...this.state };
        newState.credentials[event.target.name] = event.target.value;
        this.setState(newState);
    }

    getLeapInfo = (e) => {
        e.preventDefault();
        this.setState({ disabled: true, loading: true, leapCardAccountInfo: null })
        axios.post(API_URL + "api/leapcard/get/cardinfo",
            { username: this.state.credentials.username, password: this.state.credentials.password }).then(
                res => {
                    this.setState({ leapCardAccountInfo: res.data[0], disabled: false, loading: false })
                    this.props.saveLeapCardDetails(res.data[0]);
                }, err => {
                    this.setState({ disabled: false, loading: false, errorMessage: err.response.data[0], isAlertOpen: true })
                    this.props.saveLeapCardDetails(null);
                }
            )
    }

    closeAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ isAlertOpen: false, errorMessage: '' })
    }

    render() {
        return (
            <div>
                <Container component="main" maxWidth="xs">
                    <Grid
                        container
                        direction="row"
                        spacing={2}
                        justify="center"
                        alignItems="center"
                        style={{ minHeight: '55vh' }}
                    >
                        <Paper variant="outlined" style={{ padding: "30px", height: "auto", width: "300px" }}>
                            <Typography variant="h6" align="center" style={{ fontFamily: "Tahoma" }}>
                                Leap Card
                            </Typography>
                            <Typography variant="body1" align="center" color="textSecondary" style={{ fontFamily: "Tahoma", fontSize: "12px" }}>
                                Fill in the leap card details to get account info<br />(For students only)
                            </Typography>
                            <form onSubmit={this.getLeapInfo.bind(this)}>
                                <Grid item>
                                    <TextField
                                        margin="normal"
                                        required
                                        autoFocus
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        autoComplete="email"
                                        size="small"
                                        variant="outlined"
                                        name="username"
                                        onChange={this.handleLoginFormValues.bind(this)}
                                        value={this.state.credentials.username}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        label="Password"
                                        type={this.state.isPasswordVisible ? "text" : "password"}
                                        id="password"
                                        size="small"
                                        variant="outlined"
                                        name="password"
                                        onChange={this.handleLoginFormValues.bind(this)}
                                        value={this.state.credentials.password}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => this.setState({ isPasswordVisible: !this.state.isPasswordVisible })}
                                                        onMouseDown={() => this.setState({ isPasswordVisible: !this.state.isPasswordVisible })}
                                                    >
                                                        {this.state.isPasswordVisible ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <br />
                                <Grid>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        disableElevation
                                        disabled={this.state.disabled}
                                    >
                                        Get Balance
                                    </Button>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                    {this.state.loading && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </div>
                    )}
                    {this.state.leapCardAccountInfo && (
                        <>
                            <Typography variant="h6" align="center" style={{ fontFamily: "Tahoma" }}>
                                Leap Account Info for {this.state.leapCardAccountInfo.card_label}
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow hover>
                                            <TableCell component="th" scope="row">
                                                Card Number
                                            </TableCell>
                                            <TableCell align="right">{this.state.leapCardAccountInfo.card_num}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell component="th" scope="row">
                                                Card Balance
                                            </TableCell>
                                            <TableCell align="right">€{this.state.leapCardAccountInfo.balance}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell component="th" scope="row">
                                                Card Type
                                            </TableCell>
                                            <TableCell align="right">{this.state.leapCardAccountInfo.card_type}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell component="th" scope="row">
                                                Card Status
                                            </TableCell>
                                            <TableCell align="right">{this.state.leapCardAccountInfo.card_status}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell component="th" scope="row">
                                                Credit Status
                                            </TableCell>
                                            <TableCell align="right">{this.state.leapCardAccountInfo.credit_status}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell component="th" scope="row">
                                                Auto Topup
                                            </TableCell>
                                            <TableCell align="right">{this.state.leapCardAccountInfo.auto_topup}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell component="th" scope="row">
                                                Issue Date
                                            </TableCell>
                                            <TableCell align="right">{this.state.leapCardAccountInfo.issue_date}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell component="th" scope="row">
                                                Expiry Date
                                            </TableCell>
                                            <TableCell align="right">{this.state.leapCardAccountInfo.expiry_date}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Container>
                <Snackbar
                    open={this.state.isAlertOpen}
                    autoHideDuration={5000}
                    onClose={this.closeAlert.bind(this)}
                    anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
                >
                    <Alert onClose={this.closeAlert.bind(this)} severity="error">
                        {this.state.errorMessage}
                    </Alert>
                </Snackbar>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        leapCardAccountInfo: state.leapCardAccountInfo
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        saveLeapCardDetails: (leapCardAccountInfo) => dispatch({ type: SAVE_LEAP_DETAILS, leapCardAccountInfo })
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LeapCard));