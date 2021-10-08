import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faHashtag, faCertificate, faThumbtack, faTag, faPercentage, faArrowDown, faEquals, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Box, Grid, IconButton, InputAdornment, Table, TableHead, TableBody, TableCell, TableFooter, TableRow, TextField, Typography, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { useHistory } from 'react-router';
import { loadDataFromIndexedDB, saveDataToIndexedDB } from '../../services/db';
import { HtmlTooltip } from './items';
import { toast } from 'react-toastify';

const ClientIconMemoized = React.memo(() => <FontAwesomeIcon icon={faUserPlus} size="6x" />);

export default function Client({ order }) {
  const [orderO, setOrder] = useState(null);
  const [profile, setProfile] = useState(null);
  const [obs, setObs] = useState('');
  const classes = useStyles();

  useEffect(() => {
    let orderDB = loadDataFromIndexedDB('orders', (o) => o.id == order);
    let profileDB = loadDataFromIndexedDB('profile');

    Promise.all([orderDB, profileDB]).then(data => {
      setOrder(data[0][0]);
      setProfile(data[1][0]);
      setObs(data[0][0].obs);
    });
  }, []);

  const handleObsChange = e => {
    setObs(e.target.value);
  }

  const handleSaveObs = e => {
    let data = {
      id: order,
      obs: e.target.value
    };

    saveDataToIndexedDB('orders', data).then(result => {
      if (!result)
        toast.error('Falha ao alterar a observação.', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
    });
  }

  const getTotais = () => {
    let total = 0;
    let totalSt = 0;

    orderO.items.forEach(item => {
      total += item.quantity * item.price;
      totalSt += (item.quantity * (item.price + (item.price * item.taxes / 100)));
    });

    return { total, totalSt };
  }

  return (
    <>
      { orderO && profile ?
        <Grid container spacing={1}>
          <Grid item xs={12} className={classes.centeredGrid}>
            <Typography className={classes.label}>
              Dados do Vendedor
          </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography className={classes.label}>
              Vendedor
        </Typography>

            <TextField
              fullWidth
              margin="dense"
              variant="outlined"
              value={profile.name}
              inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
              disabled
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
              value={profile.email}
              inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
              disabled
            />
          </Grid>

          <Grid item xs={12}>
            <Typography className={classes.label}>
              Observação do Pedido
          </Typography>

            <TextField
              fullWidth
              margin="dense"
              variant="outlined"
              onChange={handleObsChange}
              onBlur={handleSaveObs}
              value={obs}
              disabled={orderO.sync}
              inputProps={orderO.sync ? { style: { color: '#000', backgroundColor: '#E8E8E8' } } : {}}
            />
          </Grid>

          <Grid item xs={12} className={classes.centeredGrid}>
            <Typography className={classes.label}>
              Dados do Cliente
          </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography className={classes.label}>
              Razão Social
          </Typography>

            <TextField
              fullWidth
              margin="dense"
              variant="outlined"
              value={orderO.client.name}
              inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
              disabled
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
              value={orderO.client.fantasy_name}
              inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
              disabled
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography className={classes.label}>
              Email
          </Typography>

            <TextField
              fullWidth
              margin="dense"
              variant="outlined"
              value={orderO.client.email}
              inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
              disabled
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography className={classes.label}>
              Telefone
          </Typography>

            <TextField
              fullWidth
              margin="dense"
              variant="outlined"
              value={orderO.client.phone}
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
              value={orderO.client.cgc}
              inputProps={{ style: { color: '#000', backgroundColor: '#E8E8E8' } }}
              disabled
            />
          </Grid>

          <Grid item xs={12} className={classes.centeredGrid}>
            <Typography className={classes.label}>
              Itens
          </Typography>
          </Grid>

          <Grid item xs={12} align="center">
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">
                    <FontAwesomeIcon icon={faHashtag} style={{ color: '#FFF' }} />
                  </StyledTableCell>
                  <StyledTableCell align="center">Empresa</StyledTableCell>
                  <StyledTableCell align="center">Filial</StyledTableCell>
                  <StyledTableCell align="center">Código</StyledTableCell>
                  <StyledTableCell align="left">Descrição</StyledTableCell>
                  <StyledTableCell align="center">Lote</StyledTableCell>
                  <StyledTableCell align="center">Quantidade</StyledTableCell>
                  <StyledTableCell align="center">Preço (R$)</StyledTableCell>
                  <StyledTableCell align="center">Desconto (%)</StyledTableCell>
                  <StyledTableCell align="center">Total (R$)</StyledTableCell>
                  <StyledTableCell align="center">
                    <FontAwesomeIcon icon={faCertificate} style={{ color: '#FFF' }} />
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderO.items.map((item, index) =>
                  item.product !== '' ? <StyledTableRow>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{item.company}</TableCell>
                    <TableCell align="center">{item.branch}</TableCell>
                    <TableCell align="center">{item.product}</TableCell>
                    <TableCell align="left">{item.description}</TableCell>
                    <TableCell align="center">{item.lot}</TableCell>
                    <TableCell align="right">{formatNumber(item.quantity)}</TableCell>
                    <TableCell align="right">
                      <HtmlTooltip
                        title={
                          <React.Fragment>
                            <p><strong>Preço com ST: </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format((parseFloat(item.price) + (parseFloat(item.price) * item.taxes / 100)))}</p>
                          </React.Fragment>
                        }
                      >
                        <span>{formatNumber(parseFloat(item.price).toFixed(2))}</span>
                      </HtmlTooltip>
                    </TableCell>
                    <TableCell align="right">{formatNumber(parseFloat(item.discount).toFixed(2))}</TableCell>
                    <TableCell align="right">
                      <HtmlTooltip
                        title={
                          <React.Fragment>
                            <p><strong>Total com ST: </strong>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(item.quantity * (parseFloat(item.price) + (parseFloat(item.price) * item.taxes / 100)))}</p>
                          </React.Fragment>
                        }
                      >
                        <span>{formatNumber(parseFloat(item.quantity * item.price).toFixed(2))}</span>
                      </HtmlTooltip>
                    </TableCell>
                    <TableCell align="center">
                      {
                        item.fixedPrice ? <FontAwesomeIcon icon={faThumbtack} style={{ color: '#607D8B' }} />
                          : item.discount > 0 ? <FontAwesomeIcon icon={faPercentage} style={{ color: '#673AB7' }} />
                            : item.promotional === 'S' ? <FontAwesomeIcon icon={faTag} style={{ color: '#E91E63' }} />
                              : item.price < item.originalPrice ? <FontAwesomeIcon icon={faArrowDown} style={{ color: '#f44336' }} />
                                : item.price === item.originalPrice ? <FontAwesomeIcon icon={faEquals} style={{ color: '#3F51B5' }} />
                                  : item.price > item.originalPrice ? <FontAwesomeIcon icon={faArrowUp} style={{ color: '#009688' }} />
                                    : null
                      }
                    </TableCell>
                  </StyledTableRow> : null
                )}
              </TableBody>
              <TableFooter border={2} borderColor="theme.palette.common.black">
                <TableRow>
                  <StyledTableCell align="right" colSpan={10}>
                    Total
                  </StyledTableCell>

                  <StyledTableCell align="right">
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <p><strong>Total com ST: </strong>{formatNumber(getTotais().totalSt)}</p>
                        </React.Fragment>
                      }
                    >
                      <span>{formatNumber(getTotais().total)}</span>
                    </HtmlTooltip>
                  </StyledTableCell>


                </TableRow>
              </TableFooter>
            </Table>
          </Grid>
        </Grid>
        : <></>}
    </>
  );
}

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    fontWeight: 'bold'
  },
  body: {
    fontSize: 14
  },
  footer: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontWeight: 'bold'
  }
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: '#E0E0E0',
    },
  },
}))(TableRow);

const formatNumber = value => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

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
  centeredGrid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '20px'
  }
}));
