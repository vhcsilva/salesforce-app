import { Grid, IconButton, makeStyles } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import React from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { useBreakpoint } from '../Utils';

export default function DataGrid({ data, action, rowRenderer, getRowHeight }) {
  const classes = useStyles();
  const point = useBreakpoint();

  const handler = (index) => {
    action(data[index]);
  }

  const _getRowHeight = () => {
    return getRowHeight(point);
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          width={width}
          height={height}
          rowCount={data.length}
          rowHeight={getRowHeight}
          rowRenderer={(props) => rowRenderer({...props, data, handler})}
          className={classes.list}
        />
      )}
    </AutoSizer>
  );
}

const useStyles = makeStyles((theme) => ({
  table: {
    fontSize: '13px'
  },
  right: {
    textAlign: 'right',
  },
  left: {
    textAlign: 'left',
  },
  center: {
    textAlign: 'center',
  },
  row: {
    marginBottom: '10px'
  },
  list: {
    fontSize: '12px'
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
}));