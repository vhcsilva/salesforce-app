import React, { createRef, useEffect, useState } from 'react';
import { Checkbox, FormControlLabel, Grid, InputAdornment, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

import Dashboard from '../Dashboard';
import { useStyles } from './style';
import { loadDataFromIndexedDB } from '../../services/db';
import { AutoSizer, Column, List } from 'react-virtualized';
import Hotkeys from 'react-hot-keys';

const KEYS = 'down,up,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,ç,1,2,3,4,5,6,7,8,9,0,num_1,num_2,num_3,num_4,num_5,num_6,num_7,num_8,num_9,num_0,space,backspace';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [profile, setProfile] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [search, setSearch] = useState('');
  const [promotional, setPromotional] = useState(false);
  const [selected, setSelected] = useState(0);
  const [modalDetails, setModalDetails] = useState(false);
  const [listRef, setListRef] = useState(null);
  const style = useStyles();

  useEffect(() => {
    if (products.length === 0) {
      let productsDB = loadDataFromIndexedDB('products');
      let policiesDB = loadDataFromIndexedDB('policies');
      let profileDB = loadDataFromIndexedDB('profile');

      Promise.all([productsDB, policiesDB, profileDB]).then(data => {
        let distinct = [];

        data[0].forEach(p => {
          let tmp = distinct.filter(e => e.company === p.company && e.branch === p.branch && e.code === p.code);

          if (tmp.length === 0) {
            let hasPolicies = getProductPolicies(p, data[2][0], data[1]);

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
        setPolicies(data[1]);
        setProfile(data[2][0]);
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

      if (promotional)
        tmpList = tmpList.filter(p => p.has_policy === 1);

      setProductsList(tmpList);
    }
  }, [products, search, promotional]);

  useEffect(() => {
    listRef && listRef.recomputeRowHeights(0);
  }, [selected, promotional, search]);

  const getProductPolicies = (productArg, profileArg, policiesArg) => {
    var seller = profileArg.sellers.filter(seller => seller.company === productArg.company);
    var hasPolicies = [];
    var state = ['0102', '0114'].includes(`${productArg.company}${productArg.branch}`) ? 'SE'  : 'AL';

    if (seller.length > 0) {
      hasPolicies = policiesArg.filter(policy =>
        productArg.company === policy.company &&
        state === policy.state &&
        (
          (policy.supervisor === seller[0].supervisor && policy.product === productArg.code && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
          (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === productArg.category && policy.subcategory === '' && policy.provider === '') ||
          (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === seller[0].code && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
          (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
          (policy.supervisor === seller[0].supervisor && policy.product === productArg.code && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
          (policy.supervisor === seller[0].supervisor && policy.product === productArg.code && policy.seller === seller[0].code && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
          (policy.supervisor === '' && policy.product === productArg.code && policy.seller === seller[0].code && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
          (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === productArg.provider.substring(0, 6)) ||
          (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === productArg.category && policy.subcategory === '' && policy.provider === productArg.provider.substring(0, 6)) ||
          (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === productArg.subcategory && policy.provider === productArg.provider.substring(0, 6)) ||
          (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === productArg.category && policy.subcategory === productArg.subcategory && policy.provider === productArg.provider.substring(0, 6)) ||
          (policy.supervisor === '' && policy.product === productArg.code && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '') ||
          (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === productArg.category && policy.subcategory === '' && policy.provider === '') ||
          (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === productArg.category && policy.subcategory === productArg.subcategory && policy.provider === '') ||
          (policy.supervisor === '' && policy.product === '' && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === productArg.subcategory && policy.provider === '') ||
          (policy.supervisor === '' && policy.product === productArg.code && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === productArg.provider.substring(0, 6)) ||
          (policy.supervisor === '' && policy.product === productArg.code && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === productArg.provider.substring(0, 6)) ||
          (policy.supervisor === seller[0].supervisor && policy.product === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === productArg.provider.substring(0, 6)) ||
          (policy.supervisor === '' && policy.product === productArg.code && policy.client === '' && policy.store === '' && policy.seller === '' && policy.category === '' && policy.subcategory === '' && policy.provider === '')
        )
      );
    }

    return hasPolicies;
  }

  const handleSearchChange = e => {
    setSearch(e.target.value);
  }

  const handleSearchChangeHot = value => {
    setSearch(`${search}${value}`);
    setSelected(0);
  }

  const handlePromotional = () => {
    setPromotional(!promotional);
    setSelected(0);
  }

  const getRowClassName = ({ index }) => {
    if (index == selected)
      return style.selected;
    else if (productsList.length > 0 && index > -1) {
      if (productsList[index].has_policy === 1)
        return style.hasPolicy;
    }
  }

  const renderPolicies = (index) => {
    let tmpPolicies = getProductPolicies(productsList[index], profile, policies);

    if (tmpPolicies.length > 0) {
      return tmpPolicies.map((policy, i) => <div className={style.rowPolicy}>
        <div className={style.column} style={{ minWidth: '410px' }}>
          {i === 0 && <strong>Descrição</strong>}
          <p>{policy.description}</p>
        </div>
        <div className={style.column} style={{ minWidth: '150px' }}>
          {i === 0 && <strong>Qtd. Min.</strong>}
          <p>{policy.minimum_quantity}</p>
        </div>
        <div className={style.column} style={{ minWidth: '150px' }}>
          {i === 0 && <strong>Desconto (%)</strong>}
          <p>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(policy.discount)}</p>
        </div>
        <div className={style.column} style={{ minWidth: '150px' }}>
          {i === 0 && <strong>Preço c/ Desc.</strong>}
          <p>R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(productsList[index].price - (productsList[index].price * policy.discount / 100))}</p>
        </div>
      </div>);
    }

    return <> </>;
  }

  const customRowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style: styles, // Style object to be applied to row (to position it)
  }) => {
    return (
      <div key={key} style={styles}>
        <div className={productsList[index].has_policy ? style.promotional : style.row}>
          <div className={style.w55} align="center">{productsList[index].company}{productsList[index].branch}</div>
          <div className={style.w60} align="center">{productsList[index].code}</div>
          <div className={style.w500}>{productsList[index].description.substr(0, 60)}</div>
          <div className={style.w80} align="center">{productsList[index].due_date.substring(6, 8)}/{productsList[index].due_date.substring(4, 6)}/{productsList[index].due_date.substring(0, 4)}</div>
          <div className={style.w60} align="right">{Math.round(productsList[index].balance)}</div>
          <div className={style.w80} align="right">{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(productsList[index].price)}</div>
          <div className={style.w60} align="right">{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(productsList[index].taxes)}</div>
          <div className={style.w100} align="center">{productsList[index].model}</div>
          <div className={style.w80}>{productsList[index].active_principle.substr(0, 40)}</div>
        </div>

        { (productsList[index].has_policy && profile) ? renderPolicies(index) : <></>}
      </div>
    );
  }

  const onRowclick = ({ index }) => {
    setSelected(index);
  }

  const handleHotKeys = (keyName, e, handle) => {
    switch (keyName) {
      case 'down':
        setSelected(selected + 1 >= productsList.length ? productsList.length - 1 : selected + 1);
        break;
      case 'up':
        setSelected(selected - 1 < 0 ? 0 : selected - 1);
        break;
      case 'backspace':
        setSearch(search.substring(0, search.length - 1));
        setSelected(0);
        break;
      default:
        handleSearchChangeHot(keyName === 'space' ? ' ' : keyName.includes('num_') ? keyName.replace('num_', '') : keyName);
        break;

    }
  }

  const getRowHeight = ({ index }) => {
    if (profile) {
      let tmpPolicies = getProductPolicies(productsList[index], profile, policies);

      if (tmpPolicies.length > 0)
        return (tmpPolicies.length + 1) * 47;
    }

    return 40;
  }

  return (
    <React.Fragment>
      <Dashboard title="Produtos">
        <Hotkeys
          keyName={KEYS}
          onKeyDown={handleHotKeys}
          allowRepeat={true}
        >
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

            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={<Checkbox checked={promotional} onChange={handlePromotional} icon={<RadioButtonUncheckedIcon />} checkedIcon={<CheckCircleOutlineIcon />} color="primary" className={style.checkbox} />}
                label="Promoção"
              />
            </Grid>

            <Grid item xs={12} className={style.tableContainer}>
              <div className={style.header}>
                <div className={style.w55} align="center">EMP/FIL</div>
                <div className={style.w60} align="center">CÓDIGO</div>
                <div className={style.w500} align="center">DESCRIÇÃO</div>
                <div className={style.w80} align="center">VALIDADE</div>
                <div className={style.w60} align="right">SALDO</div>
                <div className={style.w80} align="right">PREÇO</div>
                <div className={style.w60} align="right">TRIB.(%)</div>
                <div className={style.w100} align="center">MODELO</div>
                <div className={style.w80} align="center">PRINC. ATIVO</div>
              </div>

              {profile && <AutoSizer>
                {({ height, width }) => (
                  <List
                    rowRenderer={customRowRenderer}
                    height={height}
                    rowCount={productsList.length}
                    rowClassName={(index) => getRowClassName(index)}
                    rowHeight={getRowHeight}
                    width={width}
                    scrollToIndex={selected}
                    ref={list => list && setListRef(list)}
                  />
                )}
              </AutoSizer>}
            </Grid>
          </Grid>
        </Hotkeys>
      </Dashboard>
    </React.Fragment>
  );
}