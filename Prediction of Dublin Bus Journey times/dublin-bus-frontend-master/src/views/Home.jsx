import React from 'react';
import GoogleMap from '../components/GoogleMap';
import './Home.css'
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class Home extends React.Component {
    render() {
        return (
            <>
                {this.props.isAuthenticated ? (
                    <div className="homeBannerForAuthenticated">
                        <GoogleMap />
                        <br />
                    </div>
                ) : (
                        <div className="homeBannerForNotAuthenticated">
                            <GoogleMap />
                            <br />
                        </div>
                    )}
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.isAuthenticated
    }
}

export default withRouter(connect(mapStateToProps)(Home));