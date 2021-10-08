import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { InputBase, Toolbar, Typography } from '@material-ui/core';
import useStyles from './styles';

const SearchIconMemoized = React.memo(() => <FontAwesomeIcon icon={faSearch} size="sm" />);

export default function CustomToolbar(props) {
  const classes = useStyles();

  return (
    <Toolbar className={classes.toolbar} variant="dense">
      <Typography component="h4" variant="h6" color="inherit" noWrap className={classes.title}>
        {props.title}
      </Typography>

      {props.search && <div className={classes.search}>
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
          value={props.searchValue}
        />
      </div>}
    </Toolbar>
  );
}