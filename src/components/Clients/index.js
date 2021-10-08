import React, { useEffect, useState } from 'react';
import { Container, Paper } from '@material-ui/core';
import { toast } from 'react-toastify';
import { loadDataFromIndexedDB, saveDataToIndexedDB } from '../../services/db';
import useStyles from './styles';
import CustomToolbar from '../CustomToolbar';
import { AutoSizer, Column, Table } from 'react-virtualized';
import Hotkeys from 'react-hot-keys';

const KEYS = 'down,up,enter,esc,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,ç,1,2,3,4,5,6,7,8,9,0,num_1,num_2,num_3,num_4,num_5,num_6,num_7,num_8,num_9,num_0,space,backspace';

export default function Clients({ order, handleClose }) {
  const [clients, setClients] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState('');
  const classes = useStyles();

  useEffect(() => {
    if (clients.length === 0) {
      let fetch = loadDataFromIndexedDB('clients');

      fetch.then(result => {
        let filtered = result.filter(client => client.able_to_buy === 'S');

        setClients(filtered);
      });
    } else {
      let tmpList = clients.filter(client => client.name.toUpperCase().includes(search.toUpperCase()) ||
        client.fantasy_name.toUpperCase().includes(search.toUpperCase()) ||
        client.cgc.toUpperCase().includes(search.toUpperCase()) ||
        `${client.code}${client.store}`.toUpperCase().includes(search.toUpperCase()));

      setClientsList(tmpList);
      setSelected(0);
    }
  }, [clients, search]);

  const handleSearch = (value) => {
    setSearch(`${search}${value}`);
    setSelected(0);
  }

  const handleSearchTextField = e => {
    setSearch(e.target.value);
    setSelected(0);
  }


  const handleAction = ({ index }) => {
    let client = clients.filter(c => c.company === clientsList[index].company && c.branch === clientsList[index].branch && c.code === clientsList[index].code && c.store === clientsList[index].store)[0];

    let data = {
      id: order.id,
      client: client,
      payment_condition: client.payment_condition
    };

    saveDataToIndexedDB('orders', data).then(result => {
      if (result)
        handleClose();
      else
        toast.error('Falha ao selecionar o cliente', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
    });
  };

  const getRowClassName = ({ index }) => {
    if (index === selected)
      return classes.selected;
  }

  const onRowclick = ({ index }) => {
    setSelected(index);
  }

  const handleHotKeys = (keyName, e, handle) => {
    switch (keyName) {
      case 'down':
        setSelected(selected + 1 >= clientsList.length ? clientsList.length - 1 : selected + 1);
        break;
      case 'up':
        setSelected(selected - 1 < 0 ? 0 : selected - 1);
        break;
      case 'enter':
        handleAction({ index: selected });
        break;
      case 'esc':
        handleClose();
        break;
      case 'backspace':
        setSearch(search.substring(0, search.length - 1));
        setSelected(0);
        break;
      default:
        handleSearch(keyName === 'space' ? ' ' : keyName.includes('num_') ? keyName.replace('num_', '') : keyName);
        break;
    }
  }

  return (
    <Paper className={classes.root} elevation={3}>
      <Hotkeys
        keyName={KEYS}
        onKeyDown={handleHotKeys}
        allowRepeat={true}
      >
        <CustomToolbar title="Clientes" handler={handleClose} action="back" handlerSearch={handleSearchTextField} search={true} searchValue={search} />
        <Container maxWidth="xl" className={classes.fullWidthHeight}>

          <AutoSizer>
            {({ height, width }) => (
              <Table
                headerHeight={30}
                height={height}
                rowCount={clientsList.length}
                rowGetter={({ index }) => clientsList[index]}
                rowClassName={(index) => getRowClassName(index)}
                rowHeight={25}
                width={width}
                onRowClick={onRowclick}
                onRowDoubleClick={handleAction}
                className={classes.table}
                scrollToIndex={selected}
              >
                <Column label="Razão Social" dataKey="name" width={330} />
                <Column label="Nome Fantasia" dataKey="fantasy_name" width={330} />
                <Column label="CNPJ" dataKey="cgc" width={120} />
                <Column label="Endereço" dataKey="address" width={570} />
              </Table>
            )}
          </AutoSizer>
        </Container>
      </Hotkeys>
    </Paper>
  );
}