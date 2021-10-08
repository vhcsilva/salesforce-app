import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import Dashboard from '../Dashboard';
import { loadDataFromLocalStorage } from '../../services/storage';

export default function Home() {
  const classes = useStyles();
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    loadDataFromLocalStorage('sync-time').then(data => {
      setLastSync(new Date(parseInt(data)));
    });
  }, []);

  return (
    <React.Fragment>
      <Dashboard title="Dashboard">
      <Alert severity="warning">
          <AlertTitle><strong>Sincronização</strong></AlertTitle>
          <p>Lembre-se de sincronizar o sistema com frequência. O sistema não irá permitir editar pedidos caso a última sincronização tenha sido há mais de 30 minutos.</p>
          <br />
          <p><strong>Última sincronização:</strong> {lastSync && lastSync.toLocaleDateString()} às {lastSync && lastSync.toLocaleTimeString()}</p>
        </Alert>
        
        <br />

        <Alert severity="info">
          <AlertTitle><strong>Atalhos Disponíveis</strong></AlertTitle>
          <strong>Dashboard:</strong>
          <ul className={classes.firstLevel}>
            <li>SHIFT + N: novo pedido</li>
            <li>SHIFT + P: ir para página "Produtos"</li>
            <li>SHIFT + S: sincronizar sistema</li>
          </ul>
          <strong>Novo Pedido:</strong>
          <ul className={classes.firstLevel}>
            <li>SHIFT + 1: ir para a aba "Cliente"</li>
            <li>SHIFT + 2: ir para a aba "Items"</li>
            <li>SHIFT + 3: ir para a aba "Resumo"</li>
            <li>
              <strong>Cliente:</strong>
              <ul className={classes.secondLevel}>
                <li>SHIFT + P: buscar cliente</li>
                <li>SHIFT + C: buscar condições de pagamento</li>
              </ul>
            </li>
            <li>
              <strong>Itens:</strong>
              <ul className={classes.secondLevel}>
                <li>SHIFT + I: incluir item</li>
              </ul>
            </li>
          </ul>
        </Alert>
      </Dashboard>
    </React.Fragment>
  );
}

const useStyles = makeStyles({
  firstLevel: {
    paddingLeft: '40px'
  },
  secondLevel: {
    paddingLeft: '60px'
  }
});