import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '55vh',
    width: '50wh',
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
    width: '100%',
    padding: '10px',
    height: '50vh'
  },
  table: {
    fontSize: '13px'
  },
  selected: {
    backgroundColor: '#CFD8DC'
  }
}));

export default useStyles;