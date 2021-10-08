import React, { useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import ViewListIcon from '@material-ui/icons/ViewList';
import LocalMallIcon from '@material-ui/icons/LocalMall';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Hotkeys from 'react-hot-keys';

import LoadingPage from './Loading';
import FloatingButton from '../components/FloatingButton';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { logout } from '../services/auth';
import Synchronization, { dbExists, validateLastSync } from '../services/sync';
import { useHistory } from 'react-router';
import { SpeedDialAction } from '@material-ui/lab';

import { createNewOrder } from './NewOrder/utils';

function Copyright() {
  const classes = useStyles();

  return (
    <div className={classes.footerContainer}>
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
        <Link color="inherit" href="http://asabranca.ind.br/" target="_blank">
          T.I. - Asa Branca Distribuidora
      </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </div>
  );
}

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    backgroundColor: '#fff',
    width: '100%'
  },
  footerContainer: {
    backgroundColor: '#fff'
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: 4,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    zIndex: 3,
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    zIndex: 3,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(4),
    backgroundColor: '#fff'
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  copy: {
    position: 'fixed',
    width: '100%',
    bottom: theme.spacing(0)
  }
}));

export default function Dashboard(props) {
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const [sync, setSync] = React.useState(false);

  useEffect(() => {
    dbExists().then(exists => {
      if (!exists)
        handleSyncClick();
    });
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const handleSyncClick = () => {
    setSync(true);

    Synchronization().then(result => {
      setSync(false);
    });
  }
  const handleLogout = () => {
    logout();
    history.push('/');
  }
  const handleNewOrder = () => {
    validateLastSync().then(result => {
      if (result) {
        createNewOrder().then(result => {
          if (result > -1)
            history.push('/pedido/novo', { id: result });
          else
            toast.warning('Falha ao criar pedido.', { autoClose: 6000, style: {color: '#000', fontWeight: 'bold' } });
        });
      } else
        toast.warning('Sincronize o sistema para poder digitar pedidos.', { autoClose: 6000, style: { color: '#000', fontWeight: 'bold' } });
    });
  }

  const handleHome = () => {
    history.push('/dashboard');
  }

  const handleOrders = () => {
    history.push('/pedidos');
  }

  const handleProducts = () => {
    history.push('/produtos');
  }

  const handleHotKeys = (keyName, e, handle) => {
    switch (keyName) {
      case 'shift+n':
        handleNewOrder();
        break;
      case 'shift+p':
        handleProducts();
        break;
      case 'shift+s':
        handleSyncClick();
        break;
      
    }
  }

  return (
    <React.Fragment>
      {sync ? <LoadingPage /> : ''}
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
              {props.title}
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={0} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
          }}
          open={open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItem button onClick={handleHome}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={handleOrders}>
              <ListItemIcon>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Pedidos" />
            </ListItem>
            <ListItem button onClick={handleProducts}>
              <ListItemIcon>
                <ViewListIcon />
              </ListItemIcon>
              <ListItemText primary="Produtos" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleSyncClick}>
              <ListItemIcon>
                <CloudDownloadIcon />
              </ListItemIcon>
              <ListItemText primary="Sincronizar" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItem>
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            {props.children}
          </Container>
        </main>
      </div>
      <Box className={classes.copy}>
        <Copyright />
      </Box>
      { history.location.pathname.includes('dashboard') ?
        <Hotkeys
          keyName="shift+n,shift+p,shift+s"
          onKeyDown={handleHotKeys}
        >
        <FloatingButton>
          <SpeedDialAction
            key='Novo Pedido'
            icon={<LocalMallIcon onClick={handleNewOrder} />}
            tooltipTitle='Novo Pedido'
          />
        </FloatingButton> </Hotkeys> : <></>
      }
    </React.Fragment>
  );
}
