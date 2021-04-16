import Home from './views/Home';
import Login from './views/Login';
import Registration from './views/Registration';
import LeapCard from './views/LeapCard';

export default [
    {
        path: '/',
        component: Home
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/signup',
        component: Registration
    },
    {
        path: '/check-leap-balance',
        component: LeapCard
    }
]