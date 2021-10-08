import React from 'react';

// Components
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

// Services
import { isAuthenticated } from './services/auth';

// Pages
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import Products from './pages/Products';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: "/", state: { from: props.location } }} />
      )
    }
  />
);

const LoginRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        isAuthenticated() ? (
            <Redirect to={{ pathname: "/dashboard", state: { from: props.location } }} />
        ) : (
            <Component {...props} />
        )
      }
    />
  );

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <LoginRoute exact path="/" component={SignIn} />
      <PrivateRoute path="/dashboard" component={Home} />
      <PrivateRoute path="/pedido/novo" component={NewOrder} />
      <PrivateRoute path="/produtos" component={Products} />
      <PrivateRoute path="/pedidos" component={Orders} />
      <Route path="*" component={() => <h1>Página não encontrada</h1>} />
    </Switch>
  </BrowserRouter>
);

export default Routes;