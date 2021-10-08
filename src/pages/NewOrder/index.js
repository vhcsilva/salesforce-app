import React, { useEffect, useState } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faListOl, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles, Slide } from '@material-ui/core';
import CustomAppBar from '../../components/CustomAppBar';
import { useHistory } from 'react-router';
import Client from './client';
import Items from './items';
import Resume from './resume';
import { loadDataFromIndexedDB, saveDataToIndexedDB, deleteDataFromIndexedDB } from '../../services/db';
import { toast } from 'react-toastify';
import { syncOrder } from '../../services/api';
import Hotkeys from 'react-hot-keys';

const ClientIconMemoized = React.memo(() => <FontAwesomeIcon icon={faUser} size="lg" />);
const ListIconMemoized = React.memo(() => <FontAwesomeIcon icon={faListOl} size="lg" />);
const ResumeIconMemoized = React.memo(() => <FontAwesomeIcon icon={faFileAlt} size="lg" />);


export default function NewOrder(props) {
  const order_id = props.location.state.id;
  const history = useHistory();
  const classes = useStyles();
  const [value, setValue] = useState(props.location.state.step ? props.location.state.step : 'client');
  const [orderO, setOrder] = useState(null);
  const [delDialog, setDelDialog] = useState(false);

  useEffect(() => {
    loadDataFromIndexedDB('orders', (o) => o.id == order_id).then(rs => setOrder(rs[0]));
  }, []);

  const handleChange = (event, newValue) => {
    let orderRs = loadDataFromIndexedDB('orders', (o) => o.id == order_id);

    orderRs.then(result => {
      let validation = validateItems(result[0].items);

      if (result[0].sync)
        setValue(newValue);
      else {
        if (newValue === 'resume') {
          if (!result[0].client) {
            toast.warning('Cliente não selecionado.', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
          } else if (result[0].items.length === 0) {
            toast.warning('Você ainda não adicionou nenhum item.', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
          } else if (validation.length > 0) {
            validation.forEach(error => {
              toast.warning(error, { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
            });
          } else {
            setValue(newValue);
          }
        } else if (value === 'client') {
          if (result[0].client) {
            setValue(newValue);
          } else {
            toast.warning('Cliente não selecionado.', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
          }
        } else {
          setValue(newValue);
        }
      }
    });
  }

  const validateItems = (items) => {
    let errors = [];

    items.forEach(item => {
      if (item.quantity === 0 || item.quantity === '') {
        errors.push(`O item ${item.product} está com quantidade 0.`);
      } else if (!((item.quantity % item.multiple === 0) && String(item.quantity).replaceAll(' ') != '' && item.quantity > 0)) {
        errors.push(`A quantidade do item ${item.product} deve ser múltipla de ${item.multiple}`);
      }

      if (item.price === 0 || item.price === '') {
        errors.push(`O item ${item.product} está com preço 0.`);
      }

      if (item.company === '01' && '00;06;19;20'.includes(item.branch) && item.price < item.originalPrice && item.discount === 0) {
        errors.push(`Desconto não permitido para o produto ${item.product}.`);
      }

    });

    return errors;
  }

  const handleSendOrder = () => {
    loadDataFromIndexedDB('orders', (o) => o.id == order_id).then(rs => {
      let orderToSend = rs[0];

      let header = {
        'date': new Date(orderToSend.id),
        'app_id': parseInt(orderToSend.id),
        'client_cgc': orderToSend.client.cgc,
        'payment_condition': orderToSend.payment_condition,
        'obs': orderToSend.obs,
        'unique': `${orderToSend.client.company}${orderToSend.client.branch}${orderToSend.client.code}${orderToSend.client.store}`
      };

      let items = orderToSend.items.map(item => ({
        'company': item.company,
        'branch': item.branch,
        'description': item.description,
        'product': item.product,
        'promotional': item.promotional,
        'fixed_price': item.fixedPrice,
        'quantity': item.quantity,
        'discount': item.discount,
        'original_price': item.originalPrice,
        'price': item.price,
        'lot': item.lot,
        'total': item.price * item.quantity
      }));

      syncOrder(header, items).then(result => {
        let data = {
          id: orderToSend.id,
          sync: true
        };

        saveDataToIndexedDB('orders', data);

        orderToSend.sync = true;

        setOrder(orderToSend)

        toast.success(`O pedido foi ${orderToSend.id} enviado !`, { autoClose: 3000 });

      }).catch(result => {
        toast.error(`Falha ao enviar o pedido ${orderToSend.id} !`, { autoClose: 3000 });
      });
    });
  }

  const handleBack = () => {
    history.replace('/dashboard');
  }

  const handleHotKeys = (keyName, e, handle) => {
    switch (keyName) {
      case 'shift+1':
        handleChange(null, 'client');
        break;
      case 'shift+2':
        handleChange(null, 'items');
        break;
      case 'shift+3':
        handleChange(null, 'resume');
        break;
    }
  }

  const handleOpenDialog = () => {
    if (orderO.sync)
      handleBack();
    else
      setDelDialog(true);
  }

  const handleCloseDialog = () => {
    setDelDialog(false);
  }

  const handleDialog = () => {
    deleteDataFromIndexedDB('orders', { id: order_id }).then(result => {
      handleCloseDialog();
      handleBack();
    });
  }

  return (
    <Hotkeys
      keyName="shift+1,shift+2,shift+3"
      onKeyDown={handleHotKeys}
    >
      <CustomAppBar title="Novo Pedido" handler={handleOpenDialog} action="close" send={value === 'resume' && !orderO.sync} handleSend={handleSendOrder} />
      <Container className={classes.root} >
        <Tabs value={value} onChange={handleChange} aria-label="wrapped label tabs example" indicatorColor="primary" variant="fullWidth" className={classes.tabs} >
          <Tab
            value="client"
            label="Cliente"
            wrapped
            className={classes.tab}
            icon={<ClientIconMemoized />}
          />
          <Tab value="items" label="Itens" className={classes.tab} icon={<ListIconMemoized />} />
          <Tab value="resume" label="Resumo" className={classes.tab} icon={<ResumeIconMemoized />} />
        </Tabs>
        <TabPanel value={value} index="client">
          <Client order={order_id} />
        </TabPanel>
        <TabPanel value={value} index="items">
          <Items order={order_id} />
        </TabPanel>
        <TabPanel value={value} index="resume">
          <Resume order={order_id} />
        </TabPanel>

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
            <Button onClick={handleBack} color="primary" variant="contained">
              Não
          </Button>
            <Button onClick={handleDialog} color="secondary" variant="contained">
              Sim
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Hotkeys>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#fff',
    padding: '0',
    paddingTop: '68px'
  },
  tabs: {

  },
  tab: {
    backgroundColor: '#fff',
    width: '100%',
    color: '#1A237E'
  }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}