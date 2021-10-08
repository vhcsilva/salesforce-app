import { Container, Paper } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { loadDataFromIndexedDB, saveDataToIndexedDB } from '../../services/db';
import useStyles from './styles';
import CustomToolbar from '../CustomToolbar';
import { AutoSizer, Column, Table } from 'react-virtualized';
import Hotkeys from 'react-hot-keys';

const KEYS = 'down,up,enter,esc';

export default function Policies({ order, handleClose, itemIndex }) {
  const [policies, setPolicies] = useState([]);
  const [selected, setSelected] = useState(0);
  const classes = useStyles();

  useEffect(() => {
    let item = order.items[itemIndex];

    let policiesDB = loadDataFromIndexedDB('policies');
    let profileDB = loadDataFromIndexedDB('profile');
    let productDB = loadDataFromIndexedDB('products', p => p.company === item.company && p.branch === item.branch && p.code === item.product);

    Promise.all([policiesDB, profileDB, productDB]).then(data => {
      let policiesRs = data[0];
      let profileRs = data[1];
      let product = data[2][0];

      var seller = profileRs[0].sellers.filter(seller => seller.company === item.company);

      if (seller.length > 0) {
        var client = order.client;

        let filtered = policiesRs.filter(policy =>
          item.company === policy.company &&
          client.state === policy.state &&
          (
            (policy.supervisor === seller[0].supervisor && policy.product === product.code && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
            (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === product.category && policy.subcategory === '' && policy.provider === '') ||
            (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === seller[0].code && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
            (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
            (policy.supervisor === seller[0].supervisor && policy.product === product.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
            (policy.supervisor === seller[0].supervisor && policy.product === product.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === seller[0].code && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
            (policy.supervisor === '' && policy.product === product.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === seller[0].code && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
            (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === product.provider.substring(0, 6)) ||
            (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === product.provider.substring(0, 6)) ||
            (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === product.category && policy.subcategory === '' && policy.provider === product.provider.substring(0, 6)) ||
            (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === product.subcategory && policy.provider === product.provider.substring(0, 6)) ||
            (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === product.category && policy.subcategory === product.subcategory && policy.provider === product.provider.substring(0, 6)) ||
            (policy.supervisor === '' && policy.product === product.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
            (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === product.category && policy.subcategory === '' && policy.provider === '') ||
            (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === product.category && policy.subcategory === product.subcategory && policy.provider === '') ||
            (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === product.subcategory && policy.provider === '') ||
            (policy.supervisor === '' && policy.product === product.code && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === product.provider.substring(0, 6)) ||
            (policy.supervisor === '' && policy.product === product.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === product.provider.substring(0, 6)) ||
            (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === product.provider.substring(0, 6)) ||
            (policy.supervisor === '' && policy.product === product.code && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '')
          )
        );

        setPolicies(filtered);
      }
    });
  }, []);

  const handleAction = (dataP) => {
    let tmpItems = [...order.items];
    let policy = dataP.rowData;

    tmpItems[itemIndex].discount = policy.discount;
    tmpItems[itemIndex].quantity = policy.minimum_quantity;
    tmpItems[itemIndex].price = tmpItems[itemIndex].originalPrice - (tmpItems[itemIndex].originalPrice * policy.discount / 100);

    let data = {
      id: order.id,
      items: tmpItems
    };

    saveDataToIndexedDB('orders', data).then(result => {
      if (result)
        handleClose();
      else
        toast.error('Falha ao selecionar a política', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
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
        setSelected(selected + 1 >= policies.length ? policies.length - 1 : selected + 1);
        break;
      case 'up':
        setSelected(selected - 1 < 0 ? 0 : selected - 1);
        break;
      case 'enter':
        handleAction({ rowData: policies[selected] });
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
        <CustomToolbar title="Políticas" handler={handleClose} action="back" search={false} />
        <Container maxWidth="xl" className={classes.fullWidthHeight}>
          <AutoSizer>
            {({ height, width }) => (
              <Table
                headerHeight={30}
                height={height}
                rowCount={policies.length}
                rowGetter={({ index }) => policies[index]}
                rowClassName={(index) => getRowClassName(index)}
                rowHeight={25}
                width={width}
                onRowClick={onRowclick}
                onRowDoubleClick={handleAction}
                className={classes.table}
              >
                <Column label="Código" dataKey="code" width={200} />
                <Column label="Descrição" dataKey="description" width={400} />
                <Column label="Qtd. Min." dataKey="minimum_quantity" width={150} />
                <Column label="Qtd. Máx." dataKey="maximum_quantity" width={150} />
                <Column label="Desconto (%)" dataKey="discount" width={100} cellRenderer={(data) => (<div>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.cellData)}</div>)} />
              </Table>
            )}
          </AutoSizer>
        </Container>
      </Hotkeys>
    </Paper>
  );
}