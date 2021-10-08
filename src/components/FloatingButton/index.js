import React, { useState } from 'react';

// Components
import { SpeedDial, SpeedDialIcon } from '@material-ui/lab';

// Styles
import { makeStyles } from '@material-ui/core/styles';

// Icons
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
    speedDial: {
        position: 'fixed',
        bottom: theme.spacing(1),
        right: theme.spacing(3),
        zIndex: '4'
    }
}));

const FloatingButton = (props) => {
    const [openDial, setOpenDial] = useState(false);
    const classes = useStyles();

    const onOpenDial = () => {
        setOpenDial(true);
    }

    const onCloseDial = () => {
        setOpenDial(false);
    }

    return(
        <SpeedDial
        ariaLabel='Ações rápidas'
        className={classes.speedDial}
        icon={<SpeedDialIcon icon={<MoreVertIcon />} openIcon={<CloseIcon />} />}
        onClose={onCloseDial}
        onOpen={onOpenDial}
        open={openDial}
        direction='up'
    >
        {props.children}
    </SpeedDial>
    );
}

export default FloatingButton