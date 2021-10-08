import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Loading from '../../assets/loading.svg';

const LoadingPage = () => {
    const classes = useStyles();

    return(
        <div className={classes.container}>
            <img src={Loading} alt='Carregando' className={classes.img} />
        </div>
    );
}

const useStyles = makeStyles({
    container: {
        position: 'absolute',
        zIndex: '5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
    },
    img: {
        height: '100px', 
        width: '100px'
    }
});

export default LoadingPage;