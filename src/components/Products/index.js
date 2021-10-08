import { Container, Paper } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { loadDataFromIndexedDB, saveDataToIndexedDB } from '../../services/db';
import useStyles from './styles';
import CustomToolbar from '../CustomToolbar';
import { AutoSizer, Column, Table } from 'react-virtualized';
import Hotkeys from 'react-hot-keys';

const KEYS = 'down,up,enter,esc,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,ç,1,2,3,4,5,6,7,8,9,0,num_1,num_2,num_3,num_4,num_5,num_6,num_7,num_8,num_9,num_0,space,backspace';

export default function Products({ order, handleClose, selectedIndex}) {
  const [products, setProducts] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState('');
  const classes = useStyles();

  useEffect(() => {
    if (products.length === 0) {
      let productsDB = loadDataFromIndexedDB('products');
      let policiesDB = loadDataFromIndexedDB('policies');
      let profileDB = loadDataFromIndexedDB('profile');

      Promise.all([productsDB, policiesDB, profileDB]).then(data => {
        let client = order.client;
        let branches = client.state === 'AL' ? ['0100', '0106', '0800', '0802'] : ['0102', '0114'];
        let filtered = data[0].filter(p => branches.includes(p.company + p.branch));

        let distinct = [];

        filtered.forEach(p => {
          let tmp = distinct.filter(e => e.company === p.company && e.branch === p.branch && e.code === p.code);

          if (tmp.length === 0) {
            var seller = data[2][0].sellers.filter(seller => seller.company === p.company);
            var hasPolicies = [];

            if (seller.length > 0) {
              hasPolicies = data[1].filter(policy =>
                p.company === policy.company &&
                client.state === policy.state &&
                (
                  (policy.supervisor === seller[0].supervisor && policy.product === p.code && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
                  (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === p.category && policy.subcategory === '' && policy.provider === '') ||
                  (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === seller[0].code && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
                  (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
                  (policy.supervisor === seller[0].supervisor && policy.product === p.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
                  (policy.supervisor === seller[0].supervisor && policy.product === p.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === seller[0].code && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
                  (policy.supervisor === '' && policy.product === p.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === seller[0].code && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
                  (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === p.provider.substring(0, 6)) ||
                  (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === p.category && policy.subcategory === '' && policy.provider === p.provider.substring(0, 6)) ||
                  (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === p.subcategory && policy.provider === p.provider.substring(0, 6)) ||
                  (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === p.category && policy.subcategory === p.subcategory && policy.provider === p.provider.substring(0, 6)) ||
                  (policy.supervisor === '' && policy.product === p.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
                  (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === p.category && policy.subcategory === '' && policy.provider === '') ||
                  (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === p.category && policy.subcategory === p.subcategory && policy.provider === '') ||
                  (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === p.subcategory && policy.provider === '') ||
                  (policy.supervisor === '' && policy.product === p.code && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === p.provider.substring(0, 6)) ||
                  (policy.supervisor === '' && policy.product === p.code && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === p.provider.substring(0, 6)) ||
                  (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === client.code && (policy.store === client.store || policy.store === '') && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === p.provider.substring(0, 6)) ||
                  (policy.supervisor === '' && policy.product === p.code && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '')
                )
              );
            }

            if (hasPolicies.length > 0)
              p['has_policy'] = 1;
            else
              p['has_policy'] = 0;

            distinct.push(p);
          }
        });

        distinct.sort((e, f) => {
          if (e.description > f.description) return 1;
          if (f.description > e.description) return -1;

          return 0;
        });

        setProducts(distinct);
        setProductsList(distinct);
      });
    } else {
      let tmpList = products.filter(
        p => p.code.includes(search) ||
          p.description.toUpperCase().includes(search.toUpperCase()) ||
          p.model.toUpperCase().includes(search.toUpperCase()) ||
          p.active_principle.toUpperCase().includes(search.toUpperCase()) ||
          p.ean.includes(search) ||
          p.next_due_date.includes(search) ||
          p.lot.includes(search.toUpperCase())
      );

      setProductsList(tmpList);
    }
  }, [products, search]);

  const handleSearch = (value) => {
    setSearch(`${search}${value}`);
    setSelected(0);
  }

  const handleSearchTextField = e => {
    setSearch(e.target.value);
    setSelected(0);
  }

  const handleAction = (data) => {
    let product = data.rowData;
    let client = order.client;

    let fixed = loadDataFromIndexedDB('fixed_prices', e => e.company === product.company && e.branch === product.branch && e.product === product.code &&
      ((e.client === client.code && e.store === client.store) || (e.client_group !== '' && client.client_group !== '' && e.client_group === client.client_group)));

    fixed.then(fixedPrice => {
      let tmpItems = order.items;

      let tmpProduct = {
        company: product.company,
        branch: product.branch,
        product: product.code,
        description: product.description,
        promotional: product.promotional,
        multiple: product.multiple,
        taxes: product.taxes,
        originalPrice: fixedPrice.length > 0 ? fixedPrice[0].price : parseFloat(product.price),
        price: fixedPrice.length > 0 ? fixedPrice[0].price : parseFloat(product.price),
        quantity: selectedIndex > -1 ? tmpItems[selectedIndex].quantity : 1,
        discount: 0,
        lot: '',
        fixedPrice: fixedPrice.length > 0
      };

      if (selectedIndex > -1)
        tmpItems[selectedIndex] = tmpProduct;
      else
        tmpItems.push(tmpProduct);

      let data = {
        id: order.id,
        items: tmpItems
      };

      saveDataToIndexedDB('orders', data).then(result => {
        if (result)
          handleClose();
        else
          toast.error('Falha ao adicionar o produto', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
      });
    });
  }

  const handleHotKeys = (keyName, e, handle) => {
    switch (keyName) {
      case 'down':
        setSelected(selected + 1 >= productsList.length ? productsList.length - 1 : selected + 1);
        break;
      case 'up':
        setSelected(selected - 1 < 0 ? 0 : selected - 1);
        break;
      case 'enter':
        handleAction({ rowData: productsList[selected] });
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

  const getRowClassName = ({ index }) => {
    if (index == selected)
      return classes.selected;
    else if (productsList.length > 0 && index > -1) {
      if (productsList[index].has_policy === 1)
        return classes.hasPolicy;
    }
  }

  const customHeaderRenderer = ({ className, columns, style, }) => {
    return (
      <div className={className} role="row" style={{ ...style, textAlign: 'center' }}>
        {columns}
      </div>
    );
  }


  const onRowclick = ({ index }) => {
    setSelected(index);
  }

  return (
    <Paper className={classes.root} elevation={3}>
      <Hotkeys
        keyName={KEYS}
        onKeyDown={handleHotKeys}
        allowRepeat={true}
      >
        <CustomToolbar title="Produtos" handler={handleClose} action="back" handlerSearch={handleSearchTextField} search={true} searchValue={search} />
        <Container maxWidth="xl" className={classes.fullWidthHeight}>
          <AutoSizer>
            {({ height, width }) => (
              <Table
                headerHeight={30}
                headerRowRenderer={customHeaderRenderer}
                height={height}
                rowCount={productsList.length}
                rowGetter={({ index }) => productsList[index]}
                rowClassName={(index) => getRowClassName(index)}
                rowHeight={25}
                width={width}
                onRowClick={onRowclick}
                onRowDoubleClick={handleAction}
                className={classes.table}
                scrollToIndex={selected}
              >
                <Column label="Emp." dataKey="company" width={35} className={classes.textCenter} />
                <Column label="Fil." dataKey="branch" width={35} className={classes.textCenter} />
                <Column label="Código" dataKey="code" width={70} className={classes.textCenter} />
                <Column label="Descrição" dataKey="description" width={350} className={classes.textLeft} />
                <Column label="UM" dataKey="unity" width={30} className={classes.textCenter} />
                <Column label="Validade" dataKey="next_due_date" width={66} cellRenderer={(data) => (<div>{data.cellData.substring(6, 8)}/{data.cellData.substring(4, 6)}/{data.cellData.substring(0, 4)}</div>)} className={classes.textCenter} />
                <Column label="Saldo" dataKey="balance" width={66} className={classes.textRight} cellRenderer={(data) => (<div>{Math.round(data.cellData)}</div>)} />
                <Column label="Preço" dataKey="price" width={50} cellRenderer={(data) => (<div>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.cellData)}</div>)} className={classes.textRight} />
                <Column label="Trib. (%)" dataKey="taxes" width={70} cellRenderer={(data) => (<div>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.cellData)}</div>)} className={classes.textRight} />
                <Column label="Modelo" dataKey="model" width={100} className={classes.textCenter} />
                <Column label="Princ. Ativo" dataKey="active_principle" width={300} />
              </Table>
            )}
          </AutoSizer>
        </Container>
      </Hotkeys>
    </Paper>
  );
}