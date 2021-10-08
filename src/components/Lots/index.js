import { Container, Paper } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { loadDataFromIndexedDB, saveDataToIndexedDB } from '../../services/db';
import useStyles from './styles';
import CustomToolbar from '../CustomToolbar';
import { AutoSizer, Column, Table } from 'react-virtualized';
import Hotkeys from 'react-hot-keys';

const KEYS = 'down,up,enter,esc';

export default function Lots({ order, handleClose, itemIndex }) {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(0);
  const classes = useStyles();

  useEffect(() => {
    let item = order.items[itemIndex];

    let productsDB = loadDataFromIndexedDB('products', p => p.company === item.company && p.branch === item.branch && p.code === item.product);

    productsDB.then(result => {
      setProducts(result);
    });
  }, []);

  const handleAction = (data) => {
    let tmpItems = [...order.items];

    tmpItems[itemIndex].lot = data.rowData.lot;

    let newData = {
      id: order.id,
      items: tmpItems
    };

    saveDataToIndexedDB('orders', newData).then(result => {
      if (result)
        handleClose();
      else
        toast.error('Falha ao selecionar o lote.', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
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
        setSelected(selected + 1 >= products.length ? products.length - 1 : selected + 1);
        break;
      case 'up':
        setSelected(selected - 1 < 0 ? 0 : selected - 1);
        break;
      case 'enter':
        handleAction({ rowData: products[selected] });
        break;
      case 'esc':
        handleClose();
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
        <CustomToolbar title="Lotes" handler={handleClose} action="back" />
        <Container maxWidth="xl" className={classes.fullWidthHeight}>
          <AutoSizer>
            {({ height, width }) => (
              <Table
                headerHeight={30}
                height={height}
                rowCount={products.length}
                rowGetter={({ index }) => products[index]}
                rowClassName={(index) => getRowClassName(index)}
                rowHeight={25}
                width={width}
                onRowClick={onRowclick}
                onRowDoubleClick={handleAction}
                className={classes.table}
              >
                <Column label="Lote" dataKey="lot" width={200} />
                <Column label="Saldo" dataKey="balance" width={200} />
                <Column label="Validade" dataKey="due_date" width={200} cellRenderer={(data) => (<div>{data.cellData.substring(6, 8)}/{data.cellData.substring(4, 6)}/{data.cellData.substring(0, 4)}</div>)} />
              </Table>
            )}
          </AutoSizer>
        </Container>
      </Hotkeys>
    </Paper>
  );
}