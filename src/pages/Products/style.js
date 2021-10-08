import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
  tableContainer: {
    width: '100%',
    height: '78vh'
  },
  table: {
    width: '100wh',
    height: '78vh'
  },
  tableBody: {
    width: '100%',
    height: '100%',
    padding: '0'
  },
  tableHead: {
    fontWeight: 'bold'
  },
  selected: {
    fontWeight: 'bold',
    backgroundColor: '#B0BEC5'
  },
  textCenter: {
    textAlign: 'center'
  },
  textLeft: {
    textAlign: 'left'
  },
  textRight: {
    textAlign: 'right'
  },
  hasPolicy: {
    backgroundColor: '#FFEB3B',
    color: '#000'
  },
  policies: {
    height: '25',
    left: '0',
    overflow: 'hidden',
    paddingRight: '17',
    position: 'absolute',
    top: '15'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: '13px',
    paddingTop: '15px'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: '10px'
  },
  rowPolicy: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: '12px',
    padding: '5px',
    backgroundColor: '#ECEFF1'
  },
  promotional: {
    backgroundColor: '#FFEB3B',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: '13px',
    paddingTop: '10px',
    paddingBottom: '5px',
    borderBottom: '2px solid #546E7A',
    fontWeight: 'bold'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    paddingTop: '5px',
    paddingBottom: '5px'
  },
  w35: {
    minWidth: '35px'
  },
  w55: {
    minWidth: '55px'
  },
  w60: {
    minWidth: '60px'
  },
  w80: {
    minWidth: '80px'
  },
  w100: {
    minWidth: '100px'
  },
  w500: {
    minWidth: '500px'
  }
});