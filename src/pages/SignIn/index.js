import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';

import LoadingPage from '../Loading'

import LogoTelevendas from '../../assets/televendas_logo.jpg';

import api from '../../services/api';
import { login } from '../../services/auth';

import { Form, Container } from './styles';

const SignIn = (props) => {
  const [state, setState] = useState({
    username: '',
    password: '',
    error: '',
    loading: false
  });

  const handleSignIn = async e => {
    e.preventDefault();
    const { username, password } = state;

    try {
      setState(oldState => ({
        ...oldState,
        loading: true
      }));

      var form = new FormData();

      form.append("username", username);
      form.append("password", password);
      form.append("grant_type", "password");
      form.append("client_id", "67jZAUZFsXx9OMbcMOpIxmYb9kBWhycYFhHXENjv");
      form.append("client_secret", "bUb4kRUuTRgUEoXpXWGHCm0MWsX7YTVDLy0SyQWp8VeFwnElTvcl8naRTaFjOXHjQ6bN9ALxhbFDaXYtYsERdgS6ZFADYO1JYAOO40OIcSJt8RZkzFAWjiKfyJaYxAis");

      const response = await api.post('/o/token/', form);

      login(username, response.data);

      props.history.push('/dashboard');
    } catch (err) {
      setState(oldState => ({
        ...oldState,
        loading: false,
        error:
          'Usuário ou senha inválidos.'
      }));
    }

  }

  const handleInputChange = (e) => {
    e.preventDefault();

    const name = e.target.name;
    const value = e.target.value;

    setState(state => (
      {
        ...state,
        [name]: value
      }
    ));
  }

  return (
    <div style={{background: '#F5F5F5'}}>
      {state.loading ? <LoadingPage /> : ''}
      <Container>
        <Form onSubmit={handleSignIn}>
          <img src={LogoTelevendas} alt='Televendas' style={{ height: '186.5px', width: '330.5px' }} />
          <input
            name='username'
            type='text'
            placeholder='Usuário'
            onChange={handleInputChange}
            required
          />
          <input
            name='password'
            type='password'
            placeholder='Senha'
            onChange={handleInputChange}
            required
          />
          {state.error && <p>{state.error}</p>}
          <button type='submit'>Entrar</button>
        </Form>
      </Container>
    </div>
  );
}

export default withRouter(SignIn);