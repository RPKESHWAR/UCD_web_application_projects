import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import axios from 'axios';
import { API_URL } from '../constants';


const useStyles = (theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(0),
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});

export class signup extends React.Component {

  constructor() {
    super();
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmpassword: '',
      showPassword: false,
      showConfirmPassword: false,
      isFirstNameError: false,
      isLastNameError: false,
      isEmailError: false,
      isPasswordError: false,
      isConfirmPasswordError: false,
      success: false,
      failure: false,
      firstNameErrorMessage: '',
      lastNameErrorMessage: '',
      emailErrorMessage: '',
      passwordErrorMessage: '',
      confirmPasswordErrorMessage: '',
      disabled: false
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFailureClose = this.handleFailureClose.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
    this.handleClickShowConfirmPassword = this.handleClickShowConfirmPassword.bind(this);
    this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this);
  }

  handleClickShowPassword() {
    if (this.state.showPassword) {
      this.setState({ "showPassword": false });
    } else {
      this.setState({ "showPassword": true });
    }
  }
  handleClickShowConfirmPassword() {
    if (this.state.showConfirmPassword) {
      this.setState({ "showConfirmPassword": false });
    } else {
      this.setState({ "showConfirmPassword": true });
    }
  }

  handleMouseDownPassword(event) {
    event.preventDefault();
  }

  handleChange(event, key) {
    this.setState({ [key]: event.target.value });
    this.setState({
      isFirstNameError: false, isLastNameError: false, isEmailError: false, isPasswordError: false, isConfirmPasswordError: false,
      firstNameErrorMessage: '',
      lastNameErrorMessage: '',
      emailErrorMessage: '',
      passwordErrorMessage: '',
      confirmPasswordErrorMessage: ''
    });
  }

  // Reference link: https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters
  checkForm = (fieldName, value) => {
    switch (fieldName) {
      case 'firstName':
        if (value.length > 30) {
          this.setState({ isFirstNameError: true, firstNameErrorMessage: "First name should not be greater than 30 chars" });
          return false;
        } else if (/[^a-zA-Z]/.test(value)) {
          this.setState({ isFirstNameError: true, firstNameErrorMessage: "First name should only contain letters" });
          return false
        }
        break;
      case 'lastName':
        if (value.length > 150) {
          this.setState({ isLastNameError: true, lastNameErrorMessage: "Last name should not be greater than 150 chars" });
          return false;
        } else if (/[^a-zA-Z]/.test(value)) {
          this.setState({ isLastNameError: true, lastNameErrorMessage: "Last name should only contain letters" });
          return false
        }
        break;
      case 'email':
        if (value.length > 254) {
          this.setState({ isEmailError: true, emailErrorMessage: "Email should not be greater than 254 chars" });
          return false;
        } else if (value.length < 7) {
          this.setState({ isEmailError: true, emailErrorMessage: "Email should be greater than 7 chars" });
          return false;
        } else if (!value.includes('.')) {
          this.setState({ isEmailError: true, emailErrorMessage: "Please enter a valid email" });
          return false
        }
        break;
      case 'password':
        if (!(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/.test(value))) {
          this.setState({ isPasswordError: true, passwordErrorMessage: "Password must be between 8 and 16 chars with with at least a special character, upper and lower case letters and a number" });
          return false;
        }
        break;
      case 'confirmPassword':
        if (!(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/.test(value))) {
          this.setState({ isConfirmPasswordError: true, confirmPasswordErrorMessage: "Password must be between 8 and 16 chars with with at least a special character, upper and lower case letters and a number" });
          return false;
        }
        break;
      case 'confirmPasswordMatch':
        if (value !== this.state.confirmpassword) {
          this.setState({ isConfirmPasswordError: true, confirmPasswordErrorMessage: "Confirm password must match with the password" });
          return false;
        }
        break;
      default:
        return false;
    }
    return true;
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = {};
    data.first_name = this.state.firstName.trim();
    data.last_name = this.state.lastName.trim();
    data.username = this.state.email.trim();
    data.password = this.state.password.trim();
    this.setState({ disabled: true })
    if (this.checkForm('firstName', data.first_name) &&
      this.checkForm('lastName', data.last_name) &&
      this.checkForm('email', data.username) &&
      this.checkForm('password', data.password) &&
      this.checkForm('confirmPassword', this.state.confirmpassword.trim()) &&
      this.checkForm('confirmPasswordMatch', data.password)) {
      axios.post(API_URL + 'api/user/create', data).then((response) => {
        this.setState({
          firstName: '', lastName: '', email: '', password: '', confirmpassword: '', showPassword: false, showConfirmPassword: false, success: true,
          disabled: false
        });
      },
        err => {
          console.log(err.response)
          this.setState({ failure: true, disabled: false });
        }
      );
    } else {
      this.setState({ disabled: false })
    }
  }

  handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ success: false });
  }

  handleFailureClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ failure: false });
  }

  render() {
    const { classes } = this.props;
    const { isFirstNameError, isLastNameError, isEmailError, isPasswordError, isConfirmPasswordError } = this.state;


    return (

      <Container component="main" maxWidth="xs">
        <Snackbar open={this.state.success} autoHideDuration={2000} onClose={this.handleClose}>
          <Alert onClose={this.handleClose} severity="success">
            You are registered successfully!
          </Alert>
        </Snackbar>
        <Snackbar open={this.state.failure} autoHideDuration={2000} onClose={this.handleFailureClose}>
          <Alert onClose={this.handleFailureClose} severity="error">
            This user already exists!
          </Alert>
        </Snackbar>
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar} />
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <form className={classes.form} onSubmit={this.handleSubmit} >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  error={isFirstNameError}
                  helperText={this.state.firstNameErrorMessage}
                  autoComplete="fname"
                  name="firstName"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  size="small"
                  label="First Name"
                  value={this.state.firstName}
                  autoFocus
                  onChange={(e) => this.handleChange(e, 'firstName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  error={isLastNameError}
                  helperText={this.state.lastNameErrorMessage}
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  size="small"
                  label="Last Name"
                  value={this.state.lastName}
                  name="lastName"
                  autoComplete="lname"
                  onChange={(e) => this.handleChange(e, 'lastName')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="email"
                  error={isEmailError}
                  helperText={this.state.emailErrorMessage}
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  size="small"
                  label="Email Address"
                  value={this.state.email}
                  name="email"
                  autoComplete="email"
                  onChange={(e) => this.handleChange(e, 'email')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={isPasswordError}
                  helperText={this.state.passwordErrorMessage}
                  required
                  fullWidth
                  label="Password"
                  id="password"
                  size="small"
                  variant="outlined"
                  name="password"
                  // id="outlined-adornment-password"
                  type={this.state.showPassword ? "text" : "password"}
                  value={this.state.password}
                  onChange={(e) => this.handleChange(e, 'password')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={this.handleClickShowPassword}
                          onMouseDown={this.handleMouseDownPassword}
                          edge="end"
                        >
                          {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}

                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={isConfirmPasswordError}
                  helperText={this.state.confirmPasswordErrorMessage}
                  required
                  fullWidth
                  label="Confirm Password"
                  id="confirmPassword"
                  size="small"
                  variant="outlined"
                  name="confirmpassword"
                  // id="outlined-adornment-password"
                  type={this.state.showConfirmPassword ? "text" : "password"}
                  value={this.state.confirmpassword}
                  onChange={(e) => this.handleChange(e, 'confirmpassword')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={this.handleClickShowConfirmPassword}
                          onMouseDown={this.handleMouseDownPassword}
                          edge="end"
                        >
                          {this.state.showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Button
                disabled={this.state.disabled}
                type="submit"
                size="large"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign Up
              </Button>
            </Grid>
          </form>
        </div>
      </Container>
    );
  }

}

export default withStyles(useStyles)(signup)

