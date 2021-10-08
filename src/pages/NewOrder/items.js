import React, { useEffect, useState } from 'react';
import { Grid, TextField, InputAdornment, IconButton, Tooltip, makeStyles, withStyles, Modal } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlusCircle, faSearch, faInfo } from '@fortawesome/free-solid-svg-icons';
import { loadDataFromIndexedDB, saveDataToIndexedDB } from '../../services/db';
import { AutoSizer, Grid as VirtualizedGrid } from 'react-virtualized';
import Products from '../../components/Products';
import Policies from '../../components/Policies';
import Lots from '../../components/Lots';
import Hotkeys from 'react-hot-keys';
import { Alert } from '@material-ui/lab';

const TimesIconMemoized = React.memo(() => <FontAwesomeIcon icon={faTimes} color="red" />);

export default function Items({ order, goTo }) {
  const [items, setItems] = useState([]);
  const [orderO, setOrder] = useState(null);
  const [modalProduct, setModalProduct] = useState(false);
  const [modalPolicies, setModalPolicies] = useState(false);
  const [modalLot, setModalLot] = useState(false);
  const [tmpSelected, setTmpSelected] = useState(-1);
  const style = useStyles();

  useEffect(() => {
    if (!orderO) {
      loadItems();
    }
  }, [items]);

  const loadItems = () => {
    let orderRs = loadDataFromIndexedDB('orders', (o) => o.id == order);

    orderRs.then(result => {
      if (result.length > 0) {
        setOrder(result[0]);
        setItems(result[0].items);
      }
    });
  }

  const handleOpenProducts = () => {
    setModalProduct(true);
  }

  const handleSetProduct = index => {
    setTmpSelected(index);
    handleOpenProducts();
  }

  const handleOpenPolicies = (index) => {
    setTmpSelected(index);
    setModalPolicies(true);
  }

  const handleOpenLot = (index) => {
    setTmpSelected(index);
    setModalLot(true);
  }

  const handleCloseProducts = () => {
    setModalProduct(false);
    setTmpSelected(-1);
  }

  const handleClosePolicies = () => {
    setModalPolicies(false);
    setTmpSelected(-1);
  }

  const handleCloseLot = () => {
    setModalLot(false);
    setTmpSelected(-1);
  }

  const validateMultiple = index => {
    if (orderO.sync)
      return false;

    let multiple = items[index].multiple;
    let quantity = items[index].quantity;

    if ((quantity % multiple == 0) && String(quantity).replaceAll(' ') != '' && quantity > 0) {
      return false;
    }

    return true;
  }

  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => (
    <div key={key} style={{ ...style, paddingTop: '3px', fontWeight: rowIndex === 0 ? 'bold' : '' }} >
      {renderColumn(rowIndex, columnIndex)}
    </div>
  )

  const handleFieldChange = (rowIndex, columnIndex, value) => {
    let tmp = items;

    switch (columnIndex) {
      case 2:
        tmp[rowIndex].quantity = parseInt(value) || 0;
        break;
      case 3:
        tmp[rowIndex].price = parseFloat(value) || 0;
        break;
      case 4:
        tmp[rowIndex].discount = parseFloat(value) || 0;
        tmp[rowIndex].price = tmp[rowIndex].originalPrice - (tmp[rowIndex].originalPrice * (parseFloat(value) || 0) / 100);
        break;
      case 5:
        tmp[rowIndex].lot = value;
        break;
    }

    let update = {
      id: orderO.id,
      items: tmp
    }

    saveDataToIndexedDB('orders', update).then(result => {
      loadItems();
    });
  }

  const handleItemDelete = (rowIndex) => {
    let tmp = [...items];

    tmp.splice(rowIndex, 1);

    let update = {
      id: orderO.id,
      items: tmp
    }

    saveDataToIndexedDB('orders', update).then(result => {
      loadItems();
    });
  }

  const renderColumn = (rowIndex, columnIndex) => {
    let itemsList = [];

    items.forEach((item, index) => {
      itemsList.push([item.product, item.description, item.quantity, item.price, item.discount, item.lot, 0, '']);
    });

    if (itemsList.length > 0) {
      switch (columnIndex) {
        case 0:
          return (<TextField
            size="small"
            type="number"
            variant="outlined"
            value={itemsList[rowIndex][columnIndex]}
            fullWidth
            disabled
            InputProps={{
              style: { color: '#000', backgroundColor: '#E8E8E8' },
              endAdornment: orderO.sync ? null : (<InputAdornment position="end">
                <IconButton style={{ padding: '0' }} onClick={e => handleSetProduct(rowIndex)}>
                  <FontAwesomeIcon icon={faSearch} style={{ color: '#90A4AE' }} />
                </IconButton>
              </InputAdornment>)
            }}
          />);
        case 1:
          return (<TextField
            size="small"
            type="text"
            variant="outlined"
            value={itemsList[rowIndex][columnIndex]}
            fullWidth
            disabled
            InputProps={{
              style: { color: '#000', backgroundColor: '#E8E8E8' }
            }}
          />);
        case 2:
          return (<TextField
            size="small"
            type="number"
            variant="outlined"
            value={itemsList[rowIndex][columnIndex]}
            onChange={e => handleFieldChange(rowIndex, columnIndex, e.target.value)}
            onWheel={event => event.target.blur()}
            error={validateMultiple(rowIndex)}
            label={validateMultiple(rowIndex) ? `Múlt. de ${parseInt(items[rowIndex].multiple)}` : ''}
            InputProps={{
              style: { color: '#000', backgroundColor: '#FFF' }
            }}
            fullWidth
          />);
        case 3:
          return (<TextField
            size="small"
            type="number"
            variant="outlined"
            value={itemsList[rowIndex][columnIndex]}
            onChange={e => handleFieldChange(rowIndex, columnIndex, e.target.value)}
            onWheel={event => event.target.blur()}
            disabled={items[rowIndex].promotional === 'S' || items[rowIndex].fixedPrice || items[rowIndex].discount > 0 || orderO.sync ? true : false}
            InputProps={{
              style: items[rowIndex].promotional === 'S' || items[rowIndex].fixedPrice || items[rowIndex].discount > 0 || orderO.sync ? { color: '#000', backgroundColor: '#E8E8E8', textAlign: 'right' } : { color: '#000', backgroundColor: '#FFF' },
              endAdornment: <InputAdornment position="end">
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <p><strong>Preço Original: </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(items[rowIndex].originalPrice)}</p>
                      <p><strong>Preço com ST: </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(parseFloat(items[rowIndex].price) + (parseFloat(items[rowIndex].price) * items[rowIndex].taxes / 100))}</p>
                      <p><strong>Valor ST: </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(parseFloat(items[rowIndex].price) * items[rowIndex].taxes / 100)}</p>
                      <p><strong>Carg. Trib.(%): </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(items[rowIndex].taxes)}</p>
                    </React.Fragment>
                  }
                >
                  <IconButton style={{ padding: '0' }}>
                    <FontAwesomeIcon icon={faInfo} style={{ color: '#90A4AE', height: '16px' }} />
                  </IconButton>
                </HtmlTooltip>
              </InputAdornment>
            }}
            fullWidth
          />);
        case 4:
          return (<TextField
            size="small"
            type="number"
            variant="outlined"
            value={itemsList[rowIndex][columnIndex]}
            onChange={e => handleFieldChange(rowIndex, columnIndex, e.target.value)}
            onWheel={event => event.target.blur()}
            disabled={items[rowIndex].promotional === 'S' || items[rowIndex].fixedPrice || orderO.sync || !('02;14'.includes(items[rowIndex].branch) && items[rowIndex].company === '01') ? true : false}
            InputProps={{
              style: items[rowIndex].promotional === 'S' || items[rowIndex].fixedPrice || orderO.sync || !('02;14'.includes(items[rowIndex].branch) && items[rowIndex].company === '01') ? {color: '#000', backgroundColor: '#E8E8E8'} : { color: '#000', backgroundColor: '#FFF' },
              endAdornment: items[rowIndex].promotional === 'S' || items[rowIndex].fixedPrice || orderO.sync ? null : (<InputAdornment position="end">
                <IconButton style={{ padding: '0' }} onClick={e => handleOpenPolicies(rowIndex)}>
                  <FontAwesomeIcon icon={faSearch} style={{ color: '#90A4AE' }} />
                </IconButton>
              </InputAdornment>)
            }}
            fullWidth
          />);
        case 5:
          return (<TextField
            size="small"
            type="text"
            variant="outlined"
            value={itemsList[rowIndex][columnIndex]}
            onChange={e => handleFieldChange(rowIndex, columnIndex, e.target.value)}
            InputProps={{
              style: { color: '#000', backgroundColor: '#E8E8E8' },
              endAdornment: orderO.sync ? null : (<InputAdornment position="end">
                <IconButton style={{ padding: '0' }} onClick={e => handleOpenLot(rowIndex)}>
                  <FontAwesomeIcon icon={faSearch} style={{ color: '#90A4AE' }} />
                </IconButton>
              </InputAdornment>)
            }}
            disabled
            fullWidth
          />);
        case 6:
          return (<TextField
            size="small"
            type="text"
            variant="outlined"
            value={new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format((itemsList[rowIndex][2] || 0) * (itemsList[rowIndex][3] || 0))}
            disabled
            fullWidth
            InputProps={{
              style: { color: '#000', backgroundColor: '#E8E8E8' },
              endAdornment: <InputAdornment position="end">
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <p><strong>Total com ST: </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format((parseFloat(items[rowIndex].price) + (parseFloat(items[rowIndex].price) * items[rowIndex].taxes / 100)) * items[rowIndex].quantity)}</p>
                    </React.Fragment>
                  }
                >
                  <IconButton style={{ padding: '0' }}>
                    <FontAwesomeIcon icon={faInfo} style={{ color: '#90A4AE', height: '16px' }} />
                  </IconButton>
                </HtmlTooltip>
              </InputAdornment>
            }}
          />);
        case 7:
          return (<IconButton className={style.timesIcon} onClick={e => handleItemDelete(rowIndex)}>
            <TimesIconMemoized />
          </IconButton>);
        default:
          return itemsList[rowIndex][columnIndex];
      }
    }
  };

  const getColumnWidth = ({ index }) => {
    switch (index) {
      case 0:
        return 120;
      case 1:
        return 560;
      case 2:
        return 85;
      case 7:
        return 40;
      default:
        return 105;
    }
  };

  const getTotais = () => {
    let total = 0;
    let totalSt = 0;

    items.forEach(item => {
      total += item.quantity * item.price;
      totalSt += (item.quantity * (item.price + (item.price * item.taxes / 100)));
    });

    return { total, totalSt };
  }

  const handleHotKeys = (keyName, e, handle) => {
    switch (keyName) {
      case 'shift+i':
        handleClosePolicies();
        handleCloseLot();
        handleOpenProducts();
        break;
      case 'shift+p':
        handleCloseProducts();
        handleCloseLot();
        handleOpenPolicies(tmpSelected);
        break;
      case 'shift+l':
        handleCloseProducts();
        handleClosePolicies();
        handleOpenLot(tmpSelected);
        break;
      case 'esc':
        handleCloseProducts();
        handleClosePolicies();
        handleCloseLot();
        break;
    }
  }

  return (
    <Hotkeys
      keyName="shift+i,shift+p,shift+l,esc"
      onKeyDown={handleHotKeys}
    >
      <Grid container maxwidth="xl" spacing={1}>
        {(orderO && orderO.client.xmecoes === 'T') && <Grid item xs={12} sm={2}>
          <Alert icon={false} variant="filled" severity="success" className={style.perms}>Med. Controle Esp.</Alert>
        </Grid>}

        {(orderO && orderO.client.xantibi === 'T') && <Grid item xs={12} sm={2}>
          <Alert icon={false} variant="filled" severity="error" className={style.perms}>Antibióticos</Alert>
        </Grid>}

        {(orderO && orderO.client.xmedica === 'T') && <Grid item xs={12} sm={2}>
          <Alert icon={false} variant="filled" severity="info" className={style.perms}>Medicamentos</Alert>
        </Grid>}

        {(orderO && orderO.client.xcorrel === 'T') && <Grid item xs={12} sm={2}>
          <Alert icon={false} variant="filled" severity="warning" className={style.perms}>Correlatos</Alert>
        </Grid>}

        {(orderO && orderO.client.xcosmet === 'T') && <Grid item xs={12} sm={2}>
          <Alert icon={false} variant="filled" className={style.permsCosm}>Cosméticos</Alert>
        </Grid>}

        {(orderO && orderO.client.xhigien === 'T') && <Grid item xs={12} sm={2}>
          <Alert icon={false} variant="filled" className={style.permsHigi}>Higiene</Alert>
        </Grid>}
        <Grid item xs={12} className={style.itemCenter}>
          <div className={style.header}>
            <div className={style.w120}>Código</div>
            <div className={style.w560}>Descrição</div>
            <div className={style.w85}>Qtd.</div>
            <div className={style.w105}>Preço (R$)</div>
            <div className={style.w105}>Desconto (%)</div>
            <div className={style.w105}>Lote</div>
            <div className={style.w105}>Total (R$)</div>
          </div>
          <AutoSizer>
            {({ height, width }) => (
              <VirtualizedGrid
                cellRenderer={cellRenderer}
                columnCount={8}
                columnWidth={getColumnWidth}
                height={height}
                rowCount={items.length}
                rowHeight={50}
                width={width}
              />
            )}
          </AutoSizer>
        </Grid>
      </Grid>

      <Grid container className={style.footer}>
        <Grid item xs={12} className={style.centeredItems}>
          {!order.sync && <IconButton style={{ padding: '5px' }} color="primary" onClick={handleOpenProducts}>
            <FontAwesomeIcon icon={faPlusCircle} size="lg" />
          </IconButton>}
        </Grid>

        <Grid item xs={12} md={6} className={style.centeredItems}>
          <strong>Total Pedido: </strong> {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getTotais().total)}
        </Grid>
        <Grid item xs={12} md={6} className={style.centeredItems}>
          <strong>Total Pedido(ST): </strong> {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getTotais().totalSt)}
        </Grid>
      </Grid>

      <Modal
        open={modalProduct}
        onClose={handleCloseProducts}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={style.modal}
      >
        <Products order={orderO} handleClose={handleCloseProducts} selectedIndex={tmpSelected} />
      </Modal>

      <Modal
        open={modalPolicies}
        onClose={handleClosePolicies}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={style.modal}
      >
        <Policies order={orderO} handleClose={handleClosePolicies} itemIndex={tmpSelected} />
      </Modal>

      <Modal
        open={modalLot}
        onClose={handleCloseLot}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={style.modal}
      >
        <Lots order={orderO} handleClose={handleCloseLot} itemIndex={tmpSelected} />
      </Modal>
    </Hotkeys>
  );
}

const useStyles = makeStyles({
  items: {
    marginTop: '0',
    paddingLeft: '10px',
    paddingRight: '10px'
  },
  tableContainer: {
    maxHeight: '60vh'
  },
  list: {
    height: 'auto',
    width: '100%',
    marginTop: '5vh',
    marginBottom: '1vh',
    overflow: 'auto',
    padding: '10px',
  },
  footer: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    paddingBottom: '20px'
  },
  footerItem: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerItemText: {
    color: '#1A237E',
    fontWeight: 'bold',
    fontSize: '30px'
  },
  footerItemTextSmall: {
    color: '#546E7A',
    fontWeight: 'bold',
    fontSize: '15px'
  },
  tableHeadItem: {
    backgroundColor: '#fff',
    fontWeight: 'bold',
    border: '0',
    paddingLeft: '0',
    paddingRight: '0'
  },
  tableBodyItem: {
    padding: '7px',
    margin: '0',
    border: '0'
  },
  tableBodyItemNumber: {
    width: '1%',
    minWidth: '30px'
  },
  tableBodyItemProduct: {
    width: '1%',
    minWidth: '129px !important',
    maxWidth: '129px !important'
  },
  tableBodyItemDescription: {
    width: '1%',
    minWidth: '580px',
    maxWidth: '580px',
  },
  tableBodyItemPrice: {
    width: '1%',
    minWidth: '120px'
  },
  tableBodyItemQuantity: {
    width: '1%',
    minWidth: '50px',
    maxWidth: '50px',
  },
  itemCenter: {
    width: '100wh',
    height: '50vh'
  },
  centeredItems: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px'
  },
  timesIcon: {
    paddingTop: '5px'
  },
  w40: {
    width: '40px'
  },
  w85: {
    width: '85px'
  },
  w120: {
    width: '120px'
  },
  w105: {
    width: '105px'
  },
  w560: {
    width: '560px'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    fontWeight: 'bold'
  },
  modal: {
    width: '50wh',
    padding: '10px',
    borderRadius: '10px'
  },
  perms: {
    fontWeight: 'bold',
    padding: '0',
    paddingLeft: '10px'
  },
  permsCosm: {
    fontWeight: 'bold',
    padding: '0',
    paddingLeft: '10px',
    backgroundColor: '#673AB7'
  },
  permsHigi: {
    fontWeight: 'bold',
    padding: '0',
    paddingLeft: '10px',
    backgroundColor: '#FF5722'
  }
});

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

export { HtmlTooltip };