import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faSearch, faInfo } from '@fortawesome/free-solid-svg-icons';
import { Box, Grid, IconButton, InputAdornment, Modal, TextField, Typography, withStyles, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { loadDataFromIndexedDB } from '../../services/db';
import Titles from './titles';
import Clients from '../../components/Clients';
import PaymentConditions from '../../components/PaymentConditions';
import Hotkeys from 'react-hot-keys';

const ClientIconMemoized = React.memo(() => <FontAwesomeIcon icon={faUserPlus} size="6x" />);

export default function Client({ order }) {
  const [client, setClient] = useState(null);
  const [orderO, setOrder] = useState(null);
  const [modalVisible, setModal] = useState(true);
  const [modalConditions, setModalConditions] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    loadOrderClient();
  }, []);

  const loadOrderClient = () => {
    let orderRs = loadDataFromIndexedDB('orders', (o) => o.id == order);

    orderRs.then(result => {
      if (result.length > 0) {
        setOrder(result[0]);

        if (result[0].client) {
          setClient(result[0].client);
          setModal(false);
        }
      }
    });
  }

  const handleSearchClick = () => {
    setModal(true);
  }

  const handleClose = () => {
    loadOrderClient();
    setModal(false);
  }

  const handleSearchConditions = () => {
    setModalConditions(true);
  }

  const handleCloseConditions = () => {
    loadOrderClient();
    setModalConditions(false);
  }

  return (
    <>
      {client ? <Details order={orderO} setModal={handleSearchClick} setModalConditions={handleSearchConditions} /> : <Box className={classes.searchBox}>
        <IconButton onClick={handleSearchClick}>
          <ClientIconMemoized />
        </IconButton>
      </Box>
      }

      <Modal
        open={modalVisible}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modal}
      >
        <Clients order={orderO} handleClose={handleClose} />
      </Modal>

      <Modal
        open={modalConditions}
        onClose={handleCloseConditions}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modal}
      >
        <PaymentConditions order={orderO} handleClose={handleCloseConditions} />
      </Modal>
    </>
  );
}

const Details = ({ order, setModal, setModalConditions }) => {
  const classes = useStyles();

  const handleHotKeys = (keyName, e, handle) => {
    switch (keyName) {
      case 'shift+p':
        setModal();
        break;
      case 'shift+c':
        setModalConditions();
        break;
    }
  }

  const calculateAvailableLimit = client => {
    let newLimit = 0;

    newLimit = (client.credit_limit * (1 + (client.credit_extra_percent / 100))) - client.saldup;

    return newLimit;
  }

  return (
    <Hotkeys
      keyName="shift+p,shift+c"
      onKeyDown={handleHotKeys}
    >
      <Grid container spacing={1}>
        <Grid item xs={12} md={6}>
          <Typography className={classes.label}>
            Razão Social
          </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={order.client.name}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            disabled
            InputProps={{
              style: { color: '#000', backgroundColor: '#E8E8E8' },
              endAdornment: !order.sync ? <InputAdornment position="end">
                <IconButton style={{ padding: '0' }} onClick={setModal}>
                  <FontAwesomeIcon icon={faSearch} style={{ color: '#90A4AE' }} />
                </IconButton>
              </InputAdornment> : null
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography className={classes.label}>
            Nome Fantasia
          </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={order.client.fantasy_name}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography className={classes.label}>
            CNPJ
          </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={order.client.cgc}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography className={classes.label}>
            Pessoa
        </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={order.client.person_type === 'J' ? 'Jurídica' : 'Física'}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography className={classes.label}>
            Cond. Pag
        </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={order.payment_condition}
            disabled
            InputProps={{
              style: { color: '#000', backgroundColor: '#E8E8E8' },
              endAdornment: !order.sync ? <InputAdornment position="end">
                <IconButton style={{ padding: '0' }} onClick={setModalConditions}>
                  <FontAwesomeIcon icon={faSearch} style={{ color: '#90A4AE' }} />
                </IconButton>
              </InputAdornment> : null
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography className={classes.label}>
            Email
        </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={order.client.email}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography className={classes.label}>
            Telefone
        </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={order.client.phone}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Typography className={classes.label}>
            Limite de Crédito
        </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(order.client.credit_limit)}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            InputProps={{
              style: { color: '#000', backgroundColor: '#E8E8E8' },
              endAdornment: <InputAdornment position="end">
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <p><strong>Extra (%): </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(order.client.credit_extra_percent)}</p>
                      <p><strong>Limite + Extra(R$): </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(order.client.credit_limit * (1 + (order.client.credit_extra_percent / 100)))}</p>
                    </React.Fragment>
                  }
                >
                  <IconButton style={{ padding: '0' }}>
                    <FontAwesomeIcon icon={faInfo} style={{ color: '#90A4AE', height: '16px' }} />
                  </IconButton>
                </HtmlTooltip>
              </InputAdornment>
            }}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Typography className={classes.label}>
            Saldo Duplicata
        </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(order.client.saldup)}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Typography className={classes.label}>
            Saldo Pedidos Liberados
        </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(order.client.salpedl)}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Typography className={classes.label} style={{color: calculateAvailableLimit(order.client) <= 0 ? 'red': '#000'}}>
            Limite Disponível
          </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(calculateAvailableLimit(order.client))}
            inputProps={{ style: { color: calculateAvailableLimit(order.client) <= 0 ? 'red': '#000', backgroundColor: '#E8E8E8', fontWeight: calculateAvailableLimit(order.client) <= 0 ? 'bold': 'normal'} }}
            error={calculateAvailableLimit(order.client) <= 0}
            readonly
          />
          
          {calculateAvailableLimit(order.client) <= 0 ? <small style={{fontWeight: 'bold', color: 'red'}}>O cliente ultrapassou o limite permitido !</small>  : <></>}
        </Grid>

        <Grid item xs={12} md={12}>
          <Typography className={classes.label}>
            Endereço
        </Typography>

          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            value={order.client.address}
            inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
            disabled
          />
        </Grid>

        {order.sync ? <></> : <>
          <Grid item xs={12} className={classes.itemCenter}>
            <Typography className={classes.label}>
              Títulos em Aberto
        </Typography>
          </Grid>

          <Grid item xs={12} className={classes.itemCenter}>
            <Titles client={order.client.cgc} />
          </Grid></>
        }
      </Grid>
    </Hotkeys>
  );
}

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

const useStyles = makeStyles((theme) => ({
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: '20vh'
  },
  label: {
    fontWeight: 'bold'
  },
  itemCenter: {
    textAlign: 'center'
  },
  modal: {
    width: '50wh',
    padding: '10px',
    borderRadius: '10px'
  }
}));
