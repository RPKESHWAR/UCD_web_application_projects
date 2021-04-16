import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { LOGOUT_ACTION } from '../constants';
import { logout } from '../actions/action'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import logo from '../images/logo.png';
import Divider from '@material-ui/core/Divider';


class Navbar extends React.Component {

    logoutUser = (e) => {
        e.preventDefault();
        this.props.logout().then(res => this.props.history.push('/login'))
    }

    render() {
        return (
            <AppBar position="static">
                <Toolbar style={{ backgroundColor: "rgb(19,19,19)" }}>
                    <div style={{ flex: 1 }}>
                        <Link to="/"><img src={logo} alt="logo" /></Link>
                    </div>
                    <Link to="/check-leap-balance" style={{ color: 'inherit', textDecoration: 'inherit' }}>
                        <Button color="inherit">Leap Card</Button>
                    </Link>
                    <Divider orientation="vertical" variant="middle" style={{ backgroundColor: "gray", height: "45px" }} />
                    {this.props.isAuthenticated ? (
                        <Button color="inherit" variant="outlined" onClick={this.logoutUser.bind(this)}>Logout</Button>
                    ) : (
                            <Link to="/login" style={{ color: 'inherit', textDecoration: 'inherit' }}>
                                <Button color="inherit" variant="outlined">Login</Button>
                            </Link>
                        )}
                </Toolbar>
            </AppBar>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.isAuthenticated
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logout: () => dispatch(logout({ type: LOGOUT_ACTION }))
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navbar));