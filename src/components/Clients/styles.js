import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '55vh',
    width: '50wh',
    marginTop: '15vh',
    borderRadius: '10px'
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
    height: '50vh',
    width: '100%',
    backgroundColor: '#fff',
    padding: '0'
  },
  table: {
    fontSize: '13px'
  },
  selected: {
    backgroundColor: '#CFD8DC'
  }
}));

export default useStyles;