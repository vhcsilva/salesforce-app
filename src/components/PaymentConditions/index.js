import { Container, Paper } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { loadDataFromIndexedDB, saveDataToIndexedDB } from '../../services/db';
import useStyles from './styles';
import CustomToolbar from '../CustomToolbar';
import { AutoSizer, Column, Table } from 'react-virtualized';
import Hotkeys from 'react-hot-keys';

const KEYS = 'down,up,enter,esc,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,ç,1,2,3,4,5,6,7,8,9,0,num_1,num_2,num_3,num_4,num_5,num_6,num_7,num_8,num_9,num_0,space,backspace';

export default function PaymentConditions({ handleClose, order }) {
  const [conditions, setConditions] = useState(null);
  const [conditionsList, setConditionsList] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(0);
  const classes = useStyles();

  useEffect(() => {
    if (!conditions) {
      loadDataFromIndexedDB('paymentConditions', c => c.company === order.client.company).then(data => {
        let sortered = data.sort((e, f) => {
          if (e.company > f.company) return 1;
          if (f.company > e.company) return -1;

          return 0;
        });

        setConditions(sortered);
        setConditionsList(sortered);
      });
    } else {
      let filtered = conditions.filter(p => p.code.includes(search) || p.description.toUpperCase().includes(search.toUpperCase()));

      setConditionsList(filtered);
    }
  }, [search]);

  const handleSearch = (value) => {
    setSearch(`${search}${value}`);
    setSelected(0);
  }

  const handleSearchTextField = e => {
    setSearch(e.target.value);
    setSelected(0);
  }


  const handleAction = (condition) => {
    let data = {
      id: order.id,
      payment_condition: condition.rowData.code
    };

    saveDataToIndexedDB('orders', data).then(result => {
      if (result)
        handleClose();
      else
        toast.error('Falha ao selecionar a condição de pagamento.', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
    });
  }

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
        setSelected(selected + 1 >= conditionsList.length ? conditionsList.length - 1 : selected + 1);
        break;
      case 'up':
        setSelected(selected - 1 < 0 ? 0 : selected - 1);
        break;
      case 'enter':
        handleAction({ rowData: conditionsList[selected] });
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
        <CustomToolbar title="Condições de Pagamento" handler={handleClose} action="back" handlerSearch={handleSearchTextField} search={true} searchValue={search} />
        <Container maxWidth="xl" className={classes.fullWidthHeight}>
          <AutoSizer>
            {({ height, width }) => (
              <Table
                headerHeight={30}
                height={height}
                rowCount={conditionsList.length}
                rowGetter={({ index }) => conditionsList[index]}
                rowClassName={(index) => getRowClassName(index)}
                rowHeight={25}
                width={width}
                onRowClick={onRowclick}
                onRowDoubleClick={handleAction}
                className={classes.table}
                scrollToIndex={selected}
              >
                <Column label="Código" dataKey="code" width={330} />
                <Column label="Condição" dataKey="description" width={120} />
              </Table>
            )}
          </AutoSizer>
        </Container>
      </Hotkeys>
    </Paper>
  );
}