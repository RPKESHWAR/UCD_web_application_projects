import React from 'react';
import { login } from '../actions/action';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import avatar_img from '../images/login_logo.png';
import CssBaseline from '@material-ui/core/CssBaseline';
import login_banner from '../images/login_banner.jpg';
import Alert from '@material-ui/lab/Alert';
import { InputAdornment, IconButton } from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

class Login extends React.Component {
    constructor(props) {
        super(props)
        if (this.props.isAuthenticated) {
            this.props.history.push('/')
        }
        this.state = {
            credentials: { username: '', password: '' },
            disabled: false,
            isCredentialInvalid: false,
            isPasswordVisible: false
        }
    }

    loginUser = (e) => {
        e.preventDefault();
        this.setState({ disabled: true })
        this.props.login(this.state.credentials.username, this.state.credentials.password).then(
            (res) => {
                this.setState({ disabled: false })
                this.props.history.push('/')
            }, (err) => {
                this.setState({
                    disabled: false,
                    isCredentialInvalid: true
                })
            }
        );
    }

    handleLoginFormValues = (event) => {
        let newState = { ...this.state };
        newState.credentials[event.target.name] = event.target.value;
        newState.isCredentialInvalid = false;
        this.setState(newState);
    }

    render() {
        return (
            <div style={{
                width: "100%",
                height: "100vh",
                backgroundImage: `url(${login_banner})`,
                backgroundSize: 'cover',
                padding: "10px"
            }}>
                <Container component="main" maxWidth="xs">
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="center"
                        style={{ minHeight: '75vh' }}
                    >
                        <Grid item>
                            <CssBaseline />
                            <Paper elevation={2} style={{ padding: "30px", height: "auto" }}>
                                <Avatar style={{ marginLeft: "auto", marginRight: "auto", width: "40px", height: "40px" }} src={avatar_img} />
                                <Typography variant="h6" align="center" style={{ fontFamily: "Tahoma" }}>
                                    Login to Dublin Bus
                                </Typography>
                                {this.state.isCredentialInvalid && (
                                    <Alert severity="error">Invalid credentials!</Alert>
                                )}
                                <form onSubmit={this.loginUser.bind(this)}>
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
                                    <br />
                                    <br />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        // style={{ backgroundColor: '#1c8715', color: 'white' }}
                                        size="large"
                                        disableElevation
                                        disabled={this.state.disabled}
                                    >
                                        Login
                                    </Button>
                                    <br />
                                    <br />
                                    <Link to="/signup" style={{ color: 'inherit', textDecoration: 'inherit' }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            disableElevation
                                        >
                                            Register
                                        </Button>
                                    </Link>
                                </form>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.isAuthenticated
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        login: (username, password) => dispatch(login({ username, password }))
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));