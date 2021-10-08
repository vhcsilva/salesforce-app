import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Paper, Slide, TextField, Typography } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import LaunchIcon from '@material-ui/icons/Launch';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';

import Dashboard from '../Dashboard';
import { useStyles } from './style';
import { loadDataFromIndexedDB, deleteDataFromIndexedDB } from '../../services/db';
import { useHistory } from 'react-router';
import { synchronizeOrders } from '../../services/sync';
import api from '../../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [delDialog, setDelDialog] = useState(false);
  const [date, setDate] = useState(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${(new Date().getDate()).toString().padStart(2, '0')}`);
  const history = useHistory();
  const style = useStyles();

  useEffect(() => {
    let split = date.split('-');
    let filterDateIni = new Date(parseInt(split[0]), parseInt(split[1]) - 1, parseInt(split[2]), 0, 0, 0).getTime();
    let filterDateEnd = new Date(parseInt(split[0]), parseInt(split[1]) - 1, parseInt(split[2]), 23, 59, 0).getTime();

    let response = api.get('/api/v1/order', {
      params: {
        date: date
      }
    });

    response.then(data => {
      synchronizeOrders(data.data).then(r => {
        loadDataFromIndexedDB('orders', order => order.id >= filterDateIni && order.id <= filterDateEnd && order.client).then(list => {
          setOrders(list);
        });
      });
    });

}, [date, orderToDelete]);

const handleSearchChange = e => {
  setSearch(e.target.value);
}

const handleDateChange = e => {
  setDate(e.target.value);
}

const handleOpenDialog = (id) => {
  setOrderToDelete(id);
  setDelDialog(true);
}

const handleCloseDialog = () => {
  setDelDialog(false);
}

const handleViewOrder = id => {
  history.push('/pedido/novo', { id: id });
}

const validateSearch = (data, str) => {
  if (data !== null && data !== undefined)
    return String(data).toUpperCase().includes(str.toUpperCase());

  return false;
}

const handleConfirmDelete = () => {
  deleteDataFromIndexedDB('orders', { id: orderToDelete });
  setOrderToDelete(null);
  handleCloseDialog();
}

return (
  <React.Fragment>
    <Dashboard title="Pedidos">
      <Grid container spacing={1}>
        <Grid item xs={12} md={10} align="left">
          <TextField
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">
                <FontAwesomeIcon icon={faSearch} />
              </InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} md={2} align="left">
          <TextField
            type="date"
            variant="outlined"
            size="small"
            value={date}
            onChange={handleDateChange}
          />
        </Grid>

        <Grid item xs={12}>
          {(orders.length > 0) && orders.filter(el => validateSearch(el.id, search) ||
            validateSearch(el.pedpalm, search) ||
            validateSearch(el.client.fantasy_name, search) ||
            validateSearch(el.client.name, search)
          ).map((order, i) =>
            <Paper className={style.order} key={i}>
              <Grid container>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={1} align="center" style={{ paddingTop: '15px' }}>
                      <IconButton disabled>
                        {order.sync ? <CloudDoneIcon style={{ color: 'green' }} /> : <CloudQueueIcon />}
                      </IconButton>
                    </Grid>

                    <Grid item xs={9}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography>
                            <strong>Pedido #</strong>{order.id}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Typography>
                            <strong>Data: </strong>{new Date(parseInt(order.id)).toLocaleDateString()}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Typography>
                            <strong>PEDPALM: </strong>{order.pedpalm}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={5}>
                          <strong>Nome Fantasia: </strong>{order.client.fantasy_name}
                        </Grid>

                        <Grid item xs={12} md={5}>
                          <strong>Razão Social: </strong>{order.client.name}
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <strong>Total: </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getTotais(order.items).total)}
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={2} align="right" style={{ paddingTop: '15px' }}>
                      {!order.sync ? <IconButton onClick={e => handleOpenDialog(order.id)}>
                        <DeleteIcon style={{ color: 'red' }} />
                      </IconButton> : <></>}

                      <IconButton onClick={e => handleViewOrder(order.id)}>
                        <LaunchIcon style={{ color: 'blue' }} />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>)}
        </Grid>
      </Grid>

      <Dialog
        open={delDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Atenção !</DialogTitle>
        <DialogContent>
          Deseja excluir o pedido ? Essa ação não poderá ser defeita.
          </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="contained">
            Cancelar
              </Button>
          <Button onClick={handleConfirmDelete} color="secondary" variant="contained">
            Excluir
              </Button>
        </DialogActions>
      </Dialog>
    </Dashboard>
  </React.Fragment>
);
}

const getTotais = (items) => {
  let total = 0;
  let totalSt = 0;

  items.forEach(item => {
    total += item.quantity * item.price;
    totalSt += (item.quantity * (item.price + (item.price * item.taxes / 100)));
  });

  return { total, totalSt };
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});