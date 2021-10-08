import { fade, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    paddingRight: 24,
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    height: '1px',
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px'
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
  },
  title: {
    flexGrow: 1,
    fontSize: '15px'
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    margin: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      margin: 0,
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(0.8, 0, 0.8, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '50ch',
      '&:focus': {
        width: '60ch',
      },
    }
  },
}));

export default useStyles;