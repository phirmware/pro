if(navigator.serviceWorker){
    navigator.serviceWorker.register('./sw.js').then(()=>{
        console.log('Service Worker Registered');
    }).catch(()=>{
        console.log('Service Worker failed to register');
    });
}