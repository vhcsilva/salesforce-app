import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTimes, faSearch, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { AppBar, IconButton, InputBase, Toolbar, Typography } from '@material-ui/core';
import useStyles from './styles';

const BackIconMemoized = React.memo(() => <FontAwesomeIcon icon={faArrowLeft} size="sm" />);
const CloseIconMemoized = React.memo(() => <FontAwesomeIcon icon={faTimes} size="sm" />);
const SearchIconMemoized = React.memo(() => <FontAwesomeIcon icon={faSearch} size="sm" />);
const UploadIconMemoized = React.memo(() => <FontAwesomeIcon color="white" icon={faCloudUploadAlt} size="sm" />);

export default function CustomAppBar(props) {
  const classes = useStyles();

  return (
    <AppBar position="absolute" className={classes.appBar}>
      <Toolbar className={classes.toolbar} variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={props.handler}
          className={classes.menuButton}
        >
          {props.action === 'close' ? <CloseIconMemoized /> : <BackIconMemoized />}
        </IconButton>

        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
          {props.title}
        </Typography>

        {props.search ? <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIconMemoized />
            </div>
            <InputBase
              placeholder="Procurar…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              onChange={props.handlerSearch}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div> : props.send ? <IconButton onClick={props.handleSend}>
              <UploadIconMemoized />
            </IconButton>
            : <></>}
      </Toolbar>
    </AppBar>
  );
}