import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '57vh',
    width: '100wh',
    marginTop: '15vh'
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
  fullWidthHeight: {
    width: '100wh',
    padding: '10px',
    height: '50vh'
  },
  table: {
    fontSize: '13px'
  },
  selected: {
    backgroundColor: '#CFD8DC'
  },
  textCenter:{
    textAlign: 'center'
  },
  textLeft:{
    textAlign: 'left'
  },
  textRight:{
    textAlign: 'right'
  },
  hasPolicy: {
    backgroundColor: '#FFEB3B',
    color: '#000'
  }
}));

export default useStyles;