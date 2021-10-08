import React, { useEffect, useState } from 'react';
import { Column, defaultTableRowRenderer, Table } from 'react-virtualized';
import { Grid, LinearProgress, makeStyles } from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { fetchFilteredTitles } from '../../services/api';

const Titles = props => {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { client } = props;
  const classes = useStyles();

  useEffect(() => {
    setLoading(true);

    fetchFilteredTitles(client).then(result => {
      setTitles(result);
      setLoading(false);
    });
  }, [client]);

  const dateDiffInDays = (due) => {
    let due_date = new Date(parseInt(due.substr(0, 4)), parseInt(due.substr(4, 2)) - 1, parseInt(due.substr(6, 2)));
    let now = new Date();

    const utc1 = Date.UTC(due_date.getFullYear(), due_date.getMonth(), due_date.getDate());
    const utc2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  }

  const getTitlesTotals = () => {
    let quantity = titles.length;
    let total = 0;
    let pending = 0;

    if (quantity > 0) {
      titles.forEach(title => {
        total += parseFloat(title.value);
        pending += parseFloat(title.pending);
      });
    }

    return {
      quantity,
      total,
      pending
    };
  }

  const customRowRenderer = props => {
    return (
      <div key={props.key} style={{}}>
        {defaultTableRowRenderer({
          ...props,
          style: dateDiffInDays(props.rowData.due_date) > 30 ? { ...props.style, backgroundColor: '#f44336' }
            : dateDiffInDays(props.rowData.due_date) > 15 ? { ...props.style, backgroundColor: '#FF5722' } :
              dateDiffInDays(props.rowData.due_date) >= 1 ? { ...props.style, backgroundColor: '#FFEB3B' } : props.style
        })}
      </div>
    );
  }

  const customHeaderRenderer = ({ className, columns, style, }) => {
    return (
      <div className={className} role="row" style={{ ...style, textAlign: 'center', backgroundColor: '#3F51B5', color: '#fff' }}>
        {columns}
      </div>
    );
  }

  const getRowClassName = ({ index }) => {
    if (index < 0)
      return 'headerRow';
    else
      return 'regRow';
  }

  return (<>
    { loading ? <LinearProgress /> : (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <p className={classes.legend}>
            <strong>Legenda: </strong>
            <FiberManualRecordIcon style={{ color: '#f44336' }} /> vencido há mais de 30 dias
            <FiberManualRecordIcon style={{ color: '#FF5722' }} /> vencido há mais de 15 dias
            <FiberManualRecordIcon style={{ color: '#FFEB3B' }} /> vencido há mais de 1 dia
          </p>
        </Grid>

        <Grid item xs={12} className={classes.itemCenter}>
          <Table
            width={1250}
            height={200}
            headerHeight={25}
            rowHeight={25}
            rowCount={titles.length}
            rowGetter={({ index }) => titles[index]}
            rowClassName={(index) => getRowClassName(index)}
            style={{ fontSize: '13px', marginTop: '2px' }}
            rowRenderer={customRowRenderer}
            headerRowRenderer={customHeaderRenderer}
          >
            <Column label="Empresa" dataKey="company" width={80} style={{ textAlign: 'center' }} />
            <Column label="Filial" dataKey="branch" width={80} style={{ textAlign: 'center' }} />
            <Column label="Prefixo" dataKey="prefix" width={70} style={{ textAlign: 'center' }} />
            <Column label="Título" dataKey="title" width={200} style={{ textAlign: 'center' }} />
            <Column label="Parcela" dataKey="parcel" width={65} style={{ textAlign: 'center' }} />
            <Column label="Tipo" dataKey="type" width={80} style={{ textAlign: 'center' }} />
            <Column label="Emissão" dataKey="emission" width={110} cellRenderer={(data) => (<div>{data.cellData.substring(6, 8)}/{data.cellData.substring(4, 6)}/{data.cellData.substring(0, 4)}</div>)} style={{ textAlign: 'center' }} />
            <Column label="Vencimento" dataKey="due_date" width={110} cellRenderer={(data) => (<div>{data.cellData.substring(6, 8)}/{data.cellData.substring(4, 6)}/{data.cellData.substring(0, 4)}</div>)} style={{ textAlign: 'center' }} />
            <Column label="Venc. Real" dataKey="real_due_date" width={110} cellRenderer={(data) => (<div>{data.cellData.substring(6, 8)}/{data.cellData.substring(4, 6)}/{data.cellData.substring(0, 4)}</div>)} style={{ textAlign: 'center' }} />
            <Column label="Valor (R$)" dataKey="value" width={100} cellRenderer={(data) => (<div>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.cellData)}</div>)} style={{ textAlign: 'right' }} />
            <Column label="Saldo (R$)" dataKey="pending" width={100} cellRenderer={(data) => (<div>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.cellData)}</div>)} style={{ textAlign: 'right' }} />
          </Table>
        </Grid>

        <Grid item xs={12} className={classes.totals}>
          <p>
            <strong>Quantidade de Títulos: </strong> {getTitlesTotals().quantity}
          </p>
          <p>
            <strong>Valor Total: </strong> R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getTitlesTotals().total)}
          </p>
          <p>
            <strong>Total a receber: </strong> R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getTitlesTotals().pending)}
          </p>
        </Grid>
      </Grid>)}</>

  );
}

const useStyles = makeStyles((theme) => ({
  legend: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
    marginTop: '5px'
  },
  totals: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '5px'
  },
  itemCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  }
}));

export default Titles;